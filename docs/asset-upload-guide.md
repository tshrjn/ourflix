# Asset Upload Guide

This guide explains how to upload photos, audio, and videos so they map correctly to the app.

## Overview

| Asset Type | Storage | Format |
|-----------|---------|--------|
| Photos & GIFs | Cloudflare R2 (or UploadThing) | JPG, PNG, GIF |
| Background Music | Cloudflare R2 (or UploadThing) | MP3 |
| Cover Images | Cloudflare R2 (or UploadThing) | PNG |
| Profile Avatar | Cloudflare R2 (or UploadThing) | JPG |
| Videos | Mux | Any video format (Mux transcodes) |

---

## 1. Photos & Audio (Cloudflare R2)

### Setting Up R2

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2 Object Storage
2. Create a bucket (e.g., `kahaania-assets`)
3. Enable **Public Access**: Bucket Settings → Public access → Allow Access
4. Copy your public bucket URL — it looks like: `https://pub-abc123def456.r2.dev`
5. Update `ASSET_BASE_URL` in `src/data/series.ts` with your bucket URL

### Directory Structure

Upload files to R2 matching this exact structure:

```
your-r2-bucket/
├── covers/                          # Series cover images (hero carousel + modal)
│   ├── early-audition-days.png      # Series 1: "The Early Audition Days"
│   ├── wedding.png                  # Series 2: "The Day We Got Societal & Legal Approval"
│   └── travel.png                   # Series 3: "Getting Lost & Finding Memories"
│
├── profile/
│   └── avatar.jpg                   # Profile selector avatar (120x120 minimum)
│
├── music/                           # Background music for photo episodes
│   ├── romantic-eternal-love.mp3    # Used by: S1E1, S1E3, S1E4, S1E6, S2E6
│   ├── romantic-folklore.mp3        # Used by: S1E7, S2E5
│   ├── romantic-white-petals.mp3    # Used by: S3E3
│   ├── happy.mp3                    # Used by: S2E1, S2E3
│   └── holiday.mp3                  # Used by: S2E2, S2E4, S3E4
│
└── episodes/                        # Episode photos
    ├── s1e1/                        # Series 1, Episode 1: "Us in our Snapchat Filter era"
    │   ├── 1.gif                    #   Photo 1 (animated GIF)
    │   └── 2.jpg                    #   Photo 2
    ├── s1e3/                        # Series 1, Episode 3: "Teaching Sheetal Cycling"
    │   ├── 1.jpg                    #   Photo 1
    │   └── 2.jpg                    #   Photo 2 (convert HEIC → JPG before upload)
    ├── s1e4/                        # Series 1, Episode 4: "Good Hair Days"
    │   └── 1.gif                    #   Photo 1 (animated GIF)
    ├── s1e6/                        # Series 1, Episode 6: "Matching PJs"
    │   └── 1.jpg
    ├── s1e7/                        # Series 1, Episode 7: "Lockdown Parties"
    │   └── 1.jpg
    ├── s2e1/                        # Series 2, Episode 1: "Surprise!"
    │   ├── 1.jpg
    │   ├── 2.jpg
    │   └── 3.jpg
    ├── s2e2/                        # Series 2, Episode 2: "Sheetal's Musical Haldi"
    │   ├── 1.jpg
    │   └── 2.jpg
    ├── s2e3/                        # Series 2, Episode 3: "Gratitude"
    │   └── 1.jpg
    ├── s2e4/                        # Series 2, Episode 4: "Calm amidst the Storm"
    │   └── 1.jpg
    ├── s2e5/                        # Series 2, Episode 5: "The First Dance"
    │   └── 1.jpg
    ├── s2e6/                        # Series 2, Episode 6: "T-1 - Inviting the God's Blessings"
    │   └── 1.jpg
    ├── s3e3/                        # Series 3, Episode 3: "Maldives"
    │   ├── 1.jpg                    #   (convert HEIC → JPG before upload)
    │   ├── 2.jpg
    │   └── 3.jpg
    ├── s3e4/                        # Series 3, Episode 4: "Colva, Goa"
    │   └── 1.jpg
    ├── s3e5/                        # Series 3, Episode 5: "Kyoto, Japan"
    │   └── 1.jpg
    └── s3e7/                        # Series 3, Episode 7: "Koh Tao, Thailand"
        └── 1.jpg
```

### Uploading to R2

**Option A: Cloudflare Dashboard (small batches)**
1. Go to R2 → your bucket → Objects
2. Click "Upload" → drag and drop files
3. Maintain the folder structure above

**Option B: rclone (bulk upload, recommended)**
```bash
# Install rclone
brew install rclone  # macOS

# Configure R2 remote
rclone config
# Choose: New remote → name: r2 → type: S3 → provider: Cloudflare
# Enter your R2 Access Key ID and Secret Access Key
# Endpoint: https://<account-id>.r2.cloudflarestorage.com

# Upload everything
rclone sync ./assets/ r2:kahaania-assets/ --progress
```

**Option C: Wrangler CLI**
```bash
npm install -g wrangler
wrangler r2 object put kahaania-assets/covers/early-audition-days.png --file=./covers/early-audition-days.png
```

### HEIC Conversion

Apple devices save photos as HEIC. Convert to JPG before uploading:

```bash
# macOS (using sips)
sips -s format jpeg input.HEIC --out output.jpg

# Or use ImageMagick
magick input.HEIC output.jpg

# Batch convert all HEIC files in a directory
for f in *.HEIC; do sips -s format jpeg "$f" --out "${f%.HEIC}.jpg"; done
```

Files that need conversion:
- `s1e3/2` (was HEIC)
- `s3e3/1` (was HEIC)

### Using UploadThing Instead

If using UploadThing instead of R2:
1. Upload files to UploadThing — each file gets a full URL like `https://utfs.io/f/abc123.jpg`
2. Replace the relative paths in `src/data/series.ts` with full UploadThing URLs
3. The `getPhotoUrl()` and `getMusicUrl()` helpers detect full URLs (starting with `http`) and return them as-is

---

## 2. Videos (Mux)

Video episodes are streamed via [Mux](https://mux.com). Videos are NOT stored in R2.

### Uploading Videos to Mux

1. Go to [Mux Dashboard](https://dashboard.mux.com) → Video → Assets
2. Click "Upload" or "Add Asset"
3. Select your video file (any format — Mux transcodes automatically)
4. **Settings:**
   - Video Quality: "Plus" (recommended) or "Basic"
   - Playback Policy: **"Signed"** (for private videos) or "Public"
   - Auto-Generate Captions: optional
5. Click "Start Upload"
6. Once processed, copy the **Playback ID** (looks like `QjFsZmflm29lx02bLvpGqQhpUWnDTnDpn02Of700rC9Da8`)

### Adding the Playback ID to Code

In `src/data/series.ts`, set the `video_playback_id` for the episode:

```ts
{
  episode_title: "Your Video Title",
  episode_type: "video",
  video_playback_id: "YOUR_MUX_PLAYBACK_ID",  // ← paste here
  // ...
}
```

### Current Video Episodes & Their Playback IDs

| Series | Episode | Title | Mux Playback ID |
|--------|---------|-------|-----------------|
| 1 | 2 | Our Fan Moment | `QjFsZmflm29lx02bLvpGqQhpUWnDTnDpn02Of700rC9Da8` |
| 1 | 5 | Trying our hand at Tiktok Trends | `rC013kXrmqI02GV91MOP01sZfqiB7YHj2bBQsMXP9KXkJw` |
| 2 | 7 | Thodi Si Toh Lift Kara De | `esr2002CWHL8PJG5QmthLN8oC5lqntHEZbcZmHsEmYMQ` |
| 3 | 1 | Havelock, Andaman Islands | `kMxzrwlKxh02dDO7k4K4rTYqc01V1pfXNCQE36pF13qvg` |
| 3 | 2 | Majorda, Goa | `v5p1MOfuYsJZsaLoN3xq02i8nVvakBl93zGvJ24Q4lvU` |
| 3 | 6 | Gokarna, Karnataka | `qwesb3C4pXUXj6Pbb7Ru00NBcjRnaGyPSa601JRKYniJE` |
| 3 | 8 | Digurah, Maldives | `Um9VrdQPs5dtkAP8mii2FeyXSf014Vuwix01L8Us2WSkE` |
| 3 | 9 | Bandipur, Karnataka | `K7k1h801mPEH1a7fKwYsXDlO6dNFZXOAVBBm01K201JV8s` |

### Signed Playback Setup

If your Mux videos use **Signed** playback policy, you need signing keys:

1. Go to [Mux Dashboard](https://dashboard.mux.com) → Settings → Signing Keys
2. Click "Generate new key"
3. Mux will show:
   - **Key ID** → set as `MUX_SIGNING_KEY` in `.env.local`
   - **Private Key** (base64-encoded) → set as `MUX_PRIVATE_KEY` in `.env.local`
4. **Save the private key immediately** — Mux only shows it once!
5. Create `.env.local`:
   ```
   MUX_SIGNING_KEY=your_key_id_here
   MUX_PRIVATE_KEY=LS0tLS1CRUdJTi...your_long_base64_key...
   ```

Without these env vars, the app falls back to unsigned playback (works for Public policy videos).

---

## 3. Quick Checklist

- [ ] R2 bucket created with public access enabled
- [ ] `ASSET_BASE_URL` updated in `src/data/series.ts`
- [ ] All cover images uploaded to `covers/`
- [ ] Profile avatar uploaded to `profile/avatar.jpg`
- [ ] All 5 music files uploaded to `music/`
- [ ] All episode photos uploaded to `episodes/s{X}e{Y}/`
- [ ] HEIC files converted to JPG (s1e3/2, s3e3/1)
- [ ] All 8 videos uploaded to Mux
- [ ] Mux playback IDs match values in `src/data/series.ts`
- [ ] (If Signed) Mux signing keys set in `.env.local`
- [ ] `next.config.ts` has your R2 domain in `remotePatterns`
