# Kahaania

A Netflix-style streaming app for personal memories — photos, videos, and music presented as series and episodes.

## Getting Started

1. Copy the environment file and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Upload your assets (photos, music, videos):
   - **[Asset Upload Guide](docs/asset-upload-guide.md)** — Complete instructions for uploading photos to R2, videos to Mux, and the required directory structure.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Video:** Mux (with signed playback support)
- **Photos/Audio:** Cloudflare R2 (or UploadThing)
- **Testing:** Vitest + React Testing Library (unit), Playwright (E2E)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run unit/integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:e2e:codegen` | Open Playwright codegen |

## Guides

- [Asset Upload Guide](docs/asset-upload-guide.md) — How to upload photos, audio, and videos
- [Environment Variables](.env.local.example) — All required env vars and where to get them
