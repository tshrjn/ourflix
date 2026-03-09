/**
 * Google Drive OAuth Helper
 *
 * Run once to obtain a refresh token for the migration script.
 *
 * Usage:
 *   npx tsx scripts/gdrive-auth.ts
 *
 * Prerequisites:
 *   1. Create a Google Cloud project at https://console.cloud.google.com
 *   2. Enable the Google Drive API
 *   3. Create OAuth 2.0 credentials (Desktop app type)
 *   4. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
 */

import "dotenv/config";
import { google } from "googleapis";
import * as http from "http";
import * as url from "url";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3333/oauth2callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local"
  );
  console.error("See .env.local.example for setup instructions.");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/drive.readonly"],
});

console.log("\n=== Google Drive OAuth Setup ===\n");
console.log("Opening browser for authorization...\n");
console.log("If the browser doesn't open, visit this URL:\n");
console.log(authUrl);
console.log();

// Open browser
import("child_process").then(({ exec }) => {
  const openCmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  exec(`${openCmd} "${authUrl}"`);
});

// Start local server to receive callback
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url ?? "", true);

  if (parsedUrl.pathname !== "/oauth2callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = parsedUrl.query.code as string;
  if (!code) {
    res.writeHead(400);
    res.end("No authorization code received");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h2>Authorization successful!</h2><p>You can close this tab and return to the terminal.</p>"
    );

    console.log("Authorization successful!\n");
    console.log("Add this to your .env.local:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log();

    server.close();
    process.exit(0);
  } catch (err) {
    res.writeHead(500);
    res.end("Error exchanging code for tokens");
    console.error("Error:", err);
    server.close();
    process.exit(1);
  }
});

server.listen(3333, () => {
  console.log("Waiting for authorization callback on port 3333...\n");
});
