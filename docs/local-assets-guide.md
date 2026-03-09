# Local Assets Guide

How photos, music, and videos work in kahaania — and how to add your own.

---

## Quick Start

```bash
# 1. Copy env template (already has NEXT_PUBLIC_LOCAL_ASSETS=true)
cp .env.local.example .env.local

# 2. Add your asset files to public/assets/ (see structure below)

# 3. Start dev server
npm run dev
```

All photos and music serve from `public/assets/`. Videos always stream from Mux.

---

## Directory Structure

```
public/assets/
├── covers/                          # Series cover images (hero carousel + modal)
│   ├── early-audition-days.png      # Series 1 cover
│   ├── wedding.png                  # Series 2 cover
│   └── travel.png                   # Series 3 cover
│
├── episodes/                        # Episode photos
│   ├── s1e1/                        # Series 1, Episode 1
│   │   └── 1.gif                    #   Photo 1 (supports JPG, PNG, GIF)
│   ├── s1e3/
│   │   └── 1.jpg
│   ├── s1e4/
│   │   └── 1.gif
│   ├── s1e6/                        # ⚠ MISSING — you need to add this
│   │   └── 1.jpg
│   ├── s1e7/
│   │   └── 1.jpg
│   ├── s2e1/
│   │   └── 1.jpg
│   ├── s2e2/
│   │   └── 1.jpg
│   ├── s2e3/
│   │   └── 1.jpg
│   ├── s2e4/
│   │   └── 1.jpg
│   ├── s2e5/
│   │   └── 1.jpg
│   ├── s2e6/
│   │   └── 1.jpg
│   ├── s3e3/
│   │   └── 1.jpg
│   ├── s3e4/
│   │   └── 1.jpg
│   ├── s3e5/
│   │   └── 1.jpg
│   └── s3e7/                        # ⚠ MISSING — you need to add this
│       └── 1.jpg
│
└── music/                           # Background music for photo episodes
    ├── romantic-eternal-love.mp3    # ⚠ All 5 MP3 files need to be added
    ├── romantic-folklore.mp3
    ├── romantic-white-petals.mp3
    ├── happy.mp3
    └── holiday.mp3
```

### Naming Convention

- **Covers**: Named after the series slug — `early-audition-days.png`, `wedding.png`, `travel.png`
- **Episodes**: `s{series}e{episode}/{photo_number}.{ext}` — e.g., `s2e3/1.jpg`
- **Music**: Preset name + `.mp3` — must match the `background_music_url` value in `series.ts`

---

## How to Add a New Photo

1. **Drop the image file** into the right episode folder:
   ```
   public/assets/episodes/s1e6/1.jpg
   ```

2. **Update `series.ts`** — set `photo_urls` to the local path OR an ImageKit URL:
   ```ts
   photo_urls: ["episodes/s1e6/1.jpg"]
   // OR keep the full ImageKit URL — LOCAL_PHOTO_MAP handles the mapping
   ```

3. **If using a full ImageKit URL**, add the mapping to `LOCAL_PHOTO_MAP` in `series.ts`:
   ```ts
   "https://ik.imagekit.io/kahaania/.../your-file.jpg":
     "/assets/episodes/s1e6/1.jpg",
   ```

4. **Done** — the image will show up as the episode thumbnail and in the photo player.

### Adding Multiple Photos to an Episode

Photo episodes support galleries. Number each file sequentially:

```
public/assets/episodes/s2e1/
├── 1.jpg    # First photo (also used as thumbnail)
├── 2.jpg    # Second photo
└── 3.jpg    # Third photo
```

In `series.ts`:
```ts
photo_urls: ["episodes/s2e1/1.jpg", "episodes/s2e1/2.jpg", "episodes/s2e1/3.jpg"]
```

The PhotoPlayer auto-advances through all photos (5 seconds each).

---

## How to Add Music

1. **Place the MP3** in `public/assets/music/`:
   ```
   public/assets/music/romantic-eternal-love.mp3
   ```

2. The filename must match the `background_music_url` value in `series.ts`.

3. **Which episodes use which music:**

   | Preset | Used by |
   |--------|---------|
   | `romantic-eternal-love` | S1E1, S1E3, S1E4, S1E6, S2E6 |
   | `romantic-folklore` | S1E7, S2E5 |
   | `romantic-white-petals` | S3E3 |
   | `happy` | S2E1, S2E3 |
   | `holiday` | S2E2, S2E4, S3E4 |

4. **To add a new music preset**, add the MP3 file and reference it in an episode:
   ```ts
   background_music_url: "your-new-preset"
   // Resolves to: /assets/music/your-new-preset.mp3
   ```

Music plays automatically when a photo episode opens (muted by default, user can unmute).

---

## How Videos Work

Videos are **not** stored locally. They stream from [Mux](https://mux.com).

### Current Video Episodes

| Episode | Title | Mux Playback ID |
|---------|-------|-----------------|
| S1E2 | Our Fan Moment | `QjFsZmflm29lx02b...` |
| S1E5 | Trying our hand at Tiktok Trends | `rC013kXrmqI02GV9...` |
| S2E7 | Thodi Si Toh Lift Kara De | `esr2002CWHL8PJG5...` |
| S3E1 | Havelock, Andaman Islands | `kMxzrwlKxh02dDO7...` |
| S3E2 | Majorda, Goa | `v5p1MOfuYsJZsaLo...` |
| S3E6 | Gokarna, Karnataka | `qwesb3C4pXUXj6Pb...` |
| S3E8 | Digurah, Maldives | `Um9VrdQPs5dtkAP8...` |
| S3E9 | Bandipur, Karnataka | `K7k1h801mPEH1a7f...` |

### Adding a New Video

1. **Upload to Mux**: Go to [Mux Dashboard](https://dashboard.mux.com) → Video → Assets → Upload
2. **Copy the Playback ID** after processing completes
3. **Add to `series.ts`**:
   ```ts
   {
     episode_title: "Your Video Title",
     episode_type: "video",
     video_playback_id: "YOUR_MUX_PLAYBACK_ID",
     background_music_url: null,   // videos don't use background music
     photo_urls: [],               // videos don't use photos
   }
   ```
4. **For signed playback** (private videos), set these in `.env.local`:
   ```
   MUX_SIGNING_KEY=your_key_id
   MUX_PRIVATE_KEY=your_base64_rsa_private_key
   ```
   Without these, the app falls back to unsigned (public) playback.

### How the Video Flow Works

```
series.ts → video_playback_id
  → browse/page.tsx fetches thumbnail JWT tokens for all videos
  → EpisodeCard shows Mux thumbnail as poster image
  → User clicks → VideoPlayer fetches playback JWT token
  → MuxPlayer streams video with signed token
```

Thumbnails are auto-generated by Mux from the video content.

---

## Adding a New Episode

In `src/data/series.ts`, find the series and season, then add an episode object:

### Photo Episode
```ts
{
  id: "unique-uuid",                      // Generate with: crypto.randomUUID()
  episode_title: "Beach Day",
  episode_subtext: "A perfect sunset",
  episode_type: "photo",
  episode_order: 8,                        // Next number in sequence
  video_playback_id: null,
  background_music_url: "holiday",         // Preset name, or null for no music
  photo_urls: ["episodes/s3e10/1.jpg"],    // Relative path under public/assets/
}
```
Then place `1.jpg` in `public/assets/episodes/s3e10/`.

### Video Episode
```ts
{
  id: "unique-uuid",
  episode_title: "Scuba Diving",
  episode_subtext: "Finding Nemo vibes",
  episode_type: "video",
  episode_order: 10,
  video_playback_id: "YOUR_MUX_PLAYBACK_ID",
  background_music_url: null,
  photo_urls: [],
}
```

---

## Adding a New Series

1. Add cover image: `public/assets/covers/your-series-slug.png`

2. Add the mapping to `LOCAL_PHOTO_MAP` in `series.ts`:
   ```ts
   "https://ik.imagekit.io/kahaania/.../your-cover.png": "/assets/covers/your-series-slug.png",
   ```
   Or use a relative path directly as `cover_thumbnail_url`:
   ```ts
   cover_thumbnail_url: "covers/your-series-slug.png"
   ```

3. Add a new entry to `seriesData` array in `series.ts` with seasons and episodes.

---

## Local vs CDN Mode

| | Local (`NEXT_PUBLIC_LOCAL_ASSETS=true`) | CDN (default) |
|---|---|---|
| Photos | `public/assets/episodes/...` | ImageKit / R2 / UploadThing URLs |
| Covers | `public/assets/covers/...` | ImageKit / R2 URLs |
| Music | `public/assets/music/...` | `{ASSET_BASE_URL}/music/...` |
| Videos | Mux (always) | Mux (always) |
| Setup | Just add files | Configure R2/ImageKit + upload |

**Switch modes** by changing `NEXT_PUBLIC_LOCAL_ASSETS` in `.env.local`:
```bash
NEXT_PUBLIC_LOCAL_ASSETS=true   # Local files from public/assets/
NEXT_PUBLIC_LOCAL_ASSETS=false  # Remote CDN URLs
```

---

## Image Format Tips

- **HEIC** → Convert to JPG before adding (macOS: `sips -s format jpeg input.HEIC --out output.jpg`)
- **Recommended sizes**: Episode photos work at any size; covers look best at 1920px wide
- **GIFs**: Supported for animated content (e.g., s1e1, s1e4)
- **Total size**: Current assets are ~27 MB — well within Git limits (no LFS needed)

---

## What's Missing Right Now

These files need to be provided manually:

| File | Episode | Notes |
|------|---------|-------|
| `episodes/s1e6/1.jpg` | Matching PJs | Original deleted from ImageKit |
| `episodes/s3e7/1.jpg` | Koh Tao, Thailand | Original deleted from ImageKit |
| `music/romantic-eternal-love.mp3` | Background music | 5 episodes use this |
| `music/romantic-folklore.mp3` | Background music | 2 episodes use this |
| `music/romantic-white-petals.mp3` | Background music | 1 episode uses this |
| `music/happy.mp3` | Background music | 2 episodes use this |
| `music/holiday.mp3` | Background music | 3 episodes use this |
