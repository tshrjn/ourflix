# Encrypted S3 Storage Upgrade Plan

> **Status:** Plan only — not yet implemented.

## Goal

Upgrade kahaania (our-flix) from serving public unencrypted images via R2 to supporting end-to-end encrypted photo storage in S3-compatible storage. Photos should be encrypted at rest and only decryptable by authorized viewers.

---

## Current Architecture

```
Google Drive → R2 (public bucket) → getPhotoUrl() → <img src="...">
```

- Photos stored as plain files in R2
- Public bucket URL serves images directly
- `getPhotoUrl()` returns full public URLs
- No authentication required to view photos

---

## Target Architecture

```
Upload:  Photo → Encrypt (client-side) → R2 (private bucket)
View:    Auth check → Signed URL (time-limited) → Decrypt (client-side) → Display
```

### Key components:

1. **Client-side encryption** before upload
2. **Private R2 bucket** (no public access)
3. **Signed URLs** for time-limited access
4. **Client-side decryption** before display
5. **Key management** for encryption keys

---

## Encryption Strategy

### Option A: Signed URLs Only (Simpler)

No actual encryption of file contents. R2 bucket is private; access controlled via pre-signed URLs with expiration.

**Pros:** Simple, no client-side crypto, fast image loading (CDN-cacheable)
**Cons:** Files are unencrypted at rest in R2, R2 admins can see them

**Implementation:**
- Make R2 bucket private (remove public access)
- Generate pre-signed URLs server-side via API route
- Pre-signed URLs expire after N minutes
- `getPhotoUrl()` becomes async, calls API for signed URL
- All components switch from `<img src>` to a hook that fetches signed URLs

### Option B: Full E2E Encryption (Like Ente)

Photos encrypted client-side before upload, decrypted client-side after download.

**Pros:** True E2E encryption, R2 admins cannot see content
**Cons:** Complex key management, no CDN caching, slower loading, need crypto in browser

**Implementation:**
- Generate per-project master key (derived from password or stored securely)
- Each photo encrypted with AES-256-GCM using a random file key
- File key encrypted with master key, stored alongside the file or in a metadata DB
- Upload: `photo → AES encrypt → upload encrypted blob to R2`
- View: `download blob → AES decrypt → display as blob URL`
- Need a metadata store (DB or JSON) for file keys and IVs

### Recommendation

**Start with Option A (Signed URLs)**. It provides meaningful access control with minimal code changes. Upgrade to Option B later if true E2E encryption is required.

---

## Implementation Plan for Option A (Signed URLs)

### 1. Make R2 bucket private

- Remove public access from R2 bucket settings
- Verify direct URL access returns 403

### 2. Create API route: `POST /api/assets/sign`

```ts
// src/app/api/assets/sign/route.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  const { keys } = await req.json(); // Array of R2 keys

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const signedUrls: Record<string, string> = {};
  for (const key of keys) {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    signedUrls[key] = await getSignedUrl(s3, command, { expiresIn: 3600 });
  }

  return Response.json({ urls: signedUrls });
}
```

### 3. Create `useSignedUrl` hook

```ts
// src/hooks/useSignedUrl.ts
function useSignedUrl(key: string): string | null {
  // Cache signed URLs in memory (valid for 1 hour)
  // Fetch from /api/assets/sign on cache miss
  // Return signed URL or null while loading
}
```

### 4. Update `getPhotoUrl()` to return R2 keys (not full URLs)

```ts
// Currently returns: "https://pub-xxx.r2.dev/path/to/photo.jpg"
// After:  returns: "path/to/photo.jpg" (just the key)
```

### 5. Update all image-displaying components

Replace `<img src={getPhotoUrl(path)}>` with a component that uses `useSignedUrl`:

```tsx
// src/components/SecureImage.tsx
function SecureImage({ path, alt, className }: Props) {
  const signedUrl = useSignedUrl(path);
  if (!signedUrl) return <Skeleton />;
  return <img src={signedUrl} alt={alt} className={className} />;
}
```

**Components to update:**
- `src/components/HeroCarousel.tsx` — cover images
- `src/components/EpisodeCard.tsx` — episode thumbnails
- `src/components/MoreInfoModal.tsx` — hero image + episode thumbnails
- `src/components/PhotoPlayer.tsx` — full-size photos

### 6. Batch URL signing for performance

Instead of signing URLs one at a time, batch sign all visible image URLs:
- On page load, collect all visible photo keys
- Make one API call to sign them all
- Cache results for the session

---

## Implementation Plan for Option B (Full E2E Encryption)

### Additional components beyond Option A:

1. **Web Crypto API** for AES-256-GCM encryption/decryption in browser
2. **Key derivation** from user password using PBKDF2 or scrypt
3. **Metadata store** (Cloudflare D1, Vercel KV, or JSON in R2) for:
   - File key (encrypted with master key)
   - IV (initialization vector)
   - Original filename and MIME type
4. **Upload flow**: encrypt locally → upload encrypted blob + metadata
5. **View flow**: download encrypted blob + metadata → decrypt → display as blob URL
6. **Key rotation** support for changing master password

### Ente compatibility considerations:

- Ente uses `libsodium` (XChaCha20-Poly1305) for encryption
- Different cipher than AES-256-GCM — not directly interoperable
- To share encrypted storage with Ente, would need to match Ente's encryption format
- More practical: separate storage, shared source photos (unencrypted in Google Drive)

---

## Migration Path

### Phase 1: Signed URLs (Option A)
1. Deploy API route for URL signing
2. Update components to use signed URLs
3. Switch R2 bucket from public to private
4. Verify all images load via signed URLs

### Phase 2: E2E Encryption (Option B, if needed)
1. Add client-side encryption to upload script
2. Create metadata store
3. Add decryption to image display components
4. Re-encrypt existing R2 objects
5. Remove unencrypted copies

---

## Dependencies to add

```
@aws-sdk/s3-request-presigner  # For Option A (signed URLs)
```

No additional dependencies for Option B — Web Crypto API is built into browsers.

---

## Security considerations

- Signed URLs should expire (1 hour recommended)
- API route should verify user authentication before signing
- For Option B, master key must never be sent to server
- Consider rate limiting on the signing API
- Log access to signed URLs for audit trail
