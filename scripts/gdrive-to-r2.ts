/**
 * Google Drive → Cloudflare R2 Migration Script
 *
 * Downloads all files from a Google Drive folder and uploads them to R2,
 * preserving the folder hierarchy as R2 key prefixes.
 *
 * Usage:
 *   npx tsx scripts/gdrive-to-r2.ts --folder-id=XXXXX
 *   npx tsx scripts/gdrive-to-r2.ts --folder-id=XXXXX --dry-run
 *   npx tsx scripts/gdrive-to-r2.ts --folder-id=XXXXX --prefix=custom/path
 *
 * Environment variables required in .env.local:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 */

import "dotenv/config";
import { google, drive_v3 } from "googleapis";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import * as mime from "mime-types";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";

// ── Config ──────────────────────────────────────────────────────────────────

interface Config {
  folderId: string;
  dryRun: boolean;
  prefix: string | null;
  skipExisting: boolean;
}

function parseArgs(): Config {
  const args = process.argv.slice(2);
  let folderId = "";
  let dryRun = false;
  let prefix: string | null = null;
  let skipExisting = true;

  for (const arg of args) {
    if (arg.startsWith("--folder-id=")) {
      folderId = arg.split("=")[1];
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("--prefix=")) {
      prefix = arg.split("=")[1];
    } else if (arg === "--no-skip") {
      skipExisting = false;
    }
  }

  if (!folderId) {
    folderId = process.env.GDRIVE_FOLDER_ID ?? "";
  }

  if (!folderId) {
    console.error("Usage: npx tsx scripts/gdrive-to-r2.ts --folder-id=XXXXX");
    console.error("  Or set GDRIVE_FOLDER_ID in .env.local");
    process.exit(1);
  }

  return { folderId, dryRun, prefix, skipExisting };
}

// ── Google Drive ────────────────────────────────────────────────────────────

function createDriveClient(): drive_v3.Drive {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("Missing Google Drive credentials in .env.local");
    console.error(
      "Run `npx tsx scripts/gdrive-auth.ts` to set up authentication."
    );
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: "v3", auth: oauth2Client });
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  path: string; // Full path from root folder
  size: number;
}

async function listFilesRecursive(
  drive: drive_v3.Drive,
  folderId: string,
  currentPath: string = ""
): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, size)",
      pageSize: 100,
      pageToken,
    });

    for (const file of res.data.files ?? []) {
      if (!file.id || !file.name || !file.mimeType) continue;

      const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;

      if (file.mimeType === "application/vnd.google-apps.folder") {
        // Recurse into subdirectory
        const subFiles = await listFilesRecursive(drive, file.id, filePath);
        files.push(...subFiles);
      } else {
        files.push({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          path: filePath,
          size: parseInt(file.size ?? "0", 10),
        });
      }
    }

    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
}

async function downloadFile(
  drive: drive_v3.Drive,
  fileId: string
): Promise<Buffer> {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  const chunks: Buffer[] = [];
  const stream = res.data as Readable;

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// ── Cloudflare R2 ───────────────────────────────────────────────────────────

function createR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error("Missing R2 credentials in .env.local");
    console.error("Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
    process.exit(1);
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function objectExists(
  r2: S3Client,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToR2(
  r2: S3Client,
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

// ── File filtering ──────────────────────────────────────────────────────────

const SKIP_FILES = new Set([
  ".DS_Store",
  "Thumbs.db",
  ".gitkeep",
  "desktop.ini",
]);

const SKIP_EXTENSIONS = new Set([".tmp", ".part", ".crdownload"]);

function shouldSkipFile(filename: string): boolean {
  if (SKIP_FILES.has(filename)) return true;
  if (filename.startsWith(".")) return true;
  const ext = path.extname(filename).toLowerCase();
  if (SKIP_EXTENSIONS.has(ext)) return true;
  return false;
}

function getContentType(filename: string, driveMimeType: string): string {
  // Try to detect from filename first
  const detected = mime.lookup(filename);
  if (detected) return detected;
  // Fall back to Drive's MIME type
  if (driveMimeType && !driveMimeType.startsWith("application/vnd.google-apps"))
    return driveMimeType;
  // Default
  return "application/octet-stream";
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const config = parseArgs();
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!bucketName) {
    console.error("Missing R2_BUCKET_NAME in .env.local");
    process.exit(1);
  }

  console.log("\n=== Google Drive → Cloudflare R2 Migration ===\n");
  console.log(`Folder ID:     ${config.folderId}`);
  console.log(`Dry run:       ${config.dryRun}`);
  console.log(`Prefix:        ${config.prefix ?? "(auto from folder names)"}`);
  console.log(`Skip existing: ${config.skipExisting}`);
  console.log(`R2 Bucket:     ${bucketName}`);
  console.log(`Public URL:    ${publicUrl ?? "(not set)"}`);
  console.log();

  // Connect to Google Drive
  console.log("Connecting to Google Drive...");
  const drive = createDriveClient();

  // Get root folder name
  const folderMeta = await drive.files.get({
    fileId: config.folderId,
    fields: "name",
  });
  const rootFolderName = folderMeta.data.name ?? "uploads";
  console.log(`Root folder: "${rootFolderName}"\n`);

  // List all files
  console.log("Scanning files...");
  const allFiles = await listFilesRecursive(drive, config.folderId, "");
  console.log(`Found ${allFiles.length} files total\n`);

  // Filter
  const files = allFiles.filter((f) => !shouldSkipFile(f.name));
  const skippedCount = allFiles.length - files.length;
  if (skippedCount > 0) {
    console.log(`Skipping ${skippedCount} system/hidden files\n`);
  }

  if (files.length === 0) {
    console.log("No files to upload. Done.");
    return;
  }

  // Prepare R2 client (skip in dry run)
  const r2 = config.dryRun ? null : createR2Client();

  // Process files
  const manifest: Record<string, string> = {};
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const keyPrefix = config.prefix ?? rootFolderName;
    const r2Key = `${keyPrefix}/${file.path}`;
    const r2Url = publicUrl ? `${publicUrl}/${r2Key}` : r2Key;
    const contentType = getContentType(file.name, file.mimeType);
    const sizeKb = (file.size / 1024).toFixed(1);

    if (config.dryRun) {
      console.log(`  [DRY] ${r2Key} (${sizeKb} KB, ${contentType})`);
      manifest[r2Key] = r2Url;
      uploaded++;
      continue;
    }

    try {
      // Check if already exists
      if (config.skipExisting && (await objectExists(r2!, bucketName, r2Key))) {
        console.log(`  [SKIP] ${r2Key} (already exists)`);
        manifest[r2Key] = r2Url;
        skipped++;
        continue;
      }

      // Download from Drive
      process.stdout.write(`  [DOWN] ${file.name} (${sizeKb} KB)...`);
      const buffer = await downloadFile(drive, file.id);

      // Upload to R2
      process.stdout.write(" [UP]...");
      await uploadToR2(r2!, bucketName, r2Key, buffer, contentType);

      console.log(" OK");
      manifest[r2Key] = r2Url;
      uploaded++;
    } catch (err) {
      console.log(` ERROR: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  // Write manifest
  const manifestPath = path.resolve("asset-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written to: ${manifestPath}`);

  // Summary
  console.log("\n=== Summary ===");
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Errors:   ${errors}`);
  console.log(`  Total:    ${files.length}`);

  if (config.dryRun) {
    console.log("\n(Dry run — no files were actually uploaded)");
  }

  if (publicUrl) {
    console.log(`\nPublic base URL: ${publicUrl}`);
    console.log(
      "Update ASSET_BASE_URL in src/data/series.ts to point to this URL."
    );
  }

  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
