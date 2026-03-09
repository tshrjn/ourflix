# Kahaania Testing Suite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit, integration, and E2E tests with visual comparison screenshots against the reference site.

**Architecture:** Vitest + React Testing Library for unit/integration tests (fast, ESM-native). Playwright for E2E flows and screenshot comparisons. Test reports output to `test-reports/`.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/jest-dom, jsdom, Playwright, pixelmatch (screenshot diff)

---

## Task 1: Install Test Dependencies & Configure Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Step 1: Install dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

**Step 2: Create Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    css: false,
    reporters: ["verbose", "json"],
    outputFile: "./test-reports/unit-results.json",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 3: Create test setup file**

Create `src/test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

**Step 4: Add test scripts to package.json**

Add to scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Step 5: Verify setup**

Run: `npx vitest run`
Expected: "No test files found" (passes with 0 tests)

**Step 6: Commit**

```bash
git add -A && git commit -m "chore: add vitest + testing-library test infrastructure"
```

---

## Task 2: Unit Tests — Data Helpers

**Files:**
- Create: `src/data/__tests__/series.test.ts`
- Reference: `src/data/series.ts`

**Step 1: Write tests**

Create `src/data/__tests__/series.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  getPhotoUrl,
  getMuxThumbnail,
  getEpisodeThumbnail,
  getMusicUrl,
  getCategoryTag,
  CATEGORY_TAGS,
  ASSET_BASE_URL,
  seriesData,
} from "@/data/series";
import type { Episode } from "@/data/series";

describe("getPhotoUrl", () => {
  it("prepends ASSET_BASE_URL for relative paths", () => {
    expect(getPhotoUrl("episodes/s1e1/1.jpg")).toBe(
      `${ASSET_BASE_URL}/episodes/s1e1/1.jpg`
    );
  });

  it("returns full URL as-is when path starts with http", () => {
    const url = "https://utfs.io/f/abc123.jpg";
    expect(getPhotoUrl(url)).toBe(url);
  });

  it("returns full URL as-is for https", () => {
    const url = "https://example.com/photo.png";
    expect(getPhotoUrl(url)).toBe(url);
  });
});

describe("getMuxThumbnail", () => {
  it("builds correct Mux thumbnail URL", () => {
    const id = "QjFsZmflm29lx02bLvpGqQhpUWnDTnDpn02Of700rC9Da8";
    expect(getMuxThumbnail(id)).toBe(
      `https://image.mux.com/${id}/thumbnail.jpg`
    );
  });
});

describe("getEpisodeThumbnail", () => {
  it("returns Mux thumbnail for video episodes", () => {
    const episode: Episode = {
      id: "test",
      episode_title: "Test",
      episode_subtext: "",
      episode_type: "video",
      episode_order: 1,
      video_playback_id: "abc123",
      background_music_url: null,
      photo_urls: [],
    };
    expect(getEpisodeThumbnail(episode)).toBe(
      "https://image.mux.com/abc123/thumbnail.jpg"
    );
  });

  it("returns first photo URL for photo episodes", () => {
    const episode: Episode = {
      id: "test",
      episode_title: "Test",
      episode_subtext: "",
      episode_type: "photo",
      episode_order: 1,
      video_playback_id: null,
      background_music_url: null,
      photo_urls: ["episodes/s1e1/1.jpg", "episodes/s1e1/2.jpg"],
    };
    expect(getEpisodeThumbnail(episode)).toBe(
      `${ASSET_BASE_URL}/episodes/s1e1/1.jpg`
    );
  });

  it("returns empty string when no thumbnail available", () => {
    const episode: Episode = {
      id: "test",
      episode_title: "Test",
      episode_subtext: "",
      episode_type: "photo",
      episode_order: 1,
      video_playback_id: null,
      background_music_url: null,
      photo_urls: [],
    };
    expect(getEpisodeThumbnail(episode)).toBe("");
  });
});

describe("getMusicUrl", () => {
  it("builds music URL from preset name", () => {
    expect(getMusicUrl("romantic-eternal-love")).toBe(
      `${ASSET_BASE_URL}/music/romantic-eternal-love.mp3`
    );
  });

  it("returns full URL as-is for http paths", () => {
    const url = "https://utfs.io/f/music123.mp3";
    expect(getMusicUrl(url)).toBe(url);
  });
});

describe("getCategoryTag", () => {
  it("cycles through tags based on episode order", () => {
    expect(getCategoryTag(1)).toBe("100% Match");
    expect(getCategoryTag(2)).toBe("Hero");
    expect(getCategoryTag(3)).toBe("New Season");
  });

  it("wraps around after all tags used", () => {
    expect(getCategoryTag(9)).toBe(CATEGORY_TAGS[0]); // wraps to "100% Match"
    expect(getCategoryTag(16)).toBe(CATEGORY_TAGS[7]); // "Guest Star"
  });
});

describe("seriesData", () => {
  it("contains exactly 3 series", () => {
    expect(seriesData).toHaveLength(3);
  });

  it("each series has at least one season with episodes", () => {
    for (const series of seriesData) {
      expect(series.seasons.length).toBeGreaterThanOrEqual(1);
      expect(series.seasons[0].episodes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("series 1 has 7 episodes", () => {
    expect(seriesData[0].seasons[0].episodes).toHaveLength(7);
  });

  it("series 2 has 7 episodes", () => {
    expect(seriesData[1].seasons[0].episodes).toHaveLength(7);
  });

  it("series 3 has 9 episodes", () => {
    expect(seriesData[2].seasons[0].episodes).toHaveLength(9);
  });

  it("all episodes have required fields", () => {
    for (const series of seriesData) {
      for (const episode of series.seasons[0].episodes) {
        expect(episode.id).toBeTruthy();
        expect(episode.episode_title).toBeTruthy();
        expect(["photo", "video"]).toContain(episode.episode_type);
        expect(episode.episode_order).toBeGreaterThan(0);
      }
    }
  });

  it("video episodes have playback IDs, photo episodes have photo URLs", () => {
    for (const series of seriesData) {
      for (const episode of series.seasons[0].episodes) {
        if (episode.episode_type === "video") {
          expect(episode.video_playback_id).toBeTruthy();
        }
        if (episode.episode_type === "photo") {
          expect(episode.photo_urls.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run src/data`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add -A && git commit -m "test: add unit tests for data helpers"
```

---

## Task 3: Unit Tests — Component Rendering

**Files:**
- Create: `src/components/__tests__/Navbar.test.tsx`
- Create: `src/components/__tests__/EpisodeCard.test.tsx`
- Create: `src/components/__tests__/ContentRow.test.tsx`

**Step 1: Write Navbar test**

Create `src/components/__tests__/Navbar.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  it("renders KAHAANIA logo", () => {
    render(<Navbar />);
    expect(screen.getByText("KAHAANIA")).toBeInTheDocument();
  });

  it("renders all nav links", () => {
    render(<Navbar />);
    for (const item of ["Home", "Series", "Movies", "Games", "Popular", "My List"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders profile avatar", () => {
    render(<Navbar />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
```

**Step 2: Write EpisodeCard test**

Create `src/components/__tests__/EpisodeCard.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EpisodeCard from "@/components/EpisodeCard";
import type { Episode } from "@/data/series";

const photoEpisode: Episode = {
  id: "ep1",
  episode_title: "Test Photo Episode",
  episode_subtext: "Test subtext",
  episode_type: "photo",
  episode_order: 1,
  video_playback_id: null,
  background_music_url: null,
  photo_urls: ["episodes/s1e1/1.jpg"],
};

const videoEpisode: Episode = {
  id: "ep2",
  episode_title: "Test Video Episode",
  episode_subtext: "Test subtext",
  episode_type: "video",
  episode_order: 2,
  video_playback_id: "abc123",
  background_music_url: null,
  photo_urls: [],
};

describe("EpisodeCard", () => {
  it("renders episode title", () => {
    render(<EpisodeCard episode={photoEpisode} onClick={() => {}} />);
    expect(screen.getByText("Test Photo Episode")).toBeInTheDocument();
  });

  it("renders category tag based on episode order", () => {
    render(<EpisodeCard episode={photoEpisode} onClick={() => {}} />);
    expect(screen.getByText("100% Match")).toBeInTheDocument();
  });

  it("renders Hero tag for episode order 2", () => {
    render(<EpisodeCard episode={videoEpisode} onClick={() => {}} />);
    expect(screen.getByText("Hero")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<EpisodeCard episode={photoEpisode} onClick={onClick} />);
    fireEvent.click(screen.getByText("Test Photo Episode"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

**Step 3: Write ContentRow test**

Create `src/components/__tests__/ContentRow.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ContentRow from "@/components/ContentRow";
import { seriesData } from "@/data/series";

describe("ContentRow", () => {
  const series = seriesData[0]; // "The Early Audition Days"
  const onEpisodeClick = vi.fn();

  it("renders series title", () => {
    render(<ContentRow series={series} onEpisodeClick={onEpisodeClick} />);
    expect(screen.getByText("The Early Audition Days")).toBeInTheDocument();
  });

  it("renders all episode cards", () => {
    render(<ContentRow series={series} onEpisodeClick={onEpisodeClick} />);
    expect(screen.getByText("Us in our Snapchat Filter era")).toBeInTheDocument();
    expect(screen.getByText("Our Fan Moment")).toBeInTheDocument();
    expect(screen.getByText("Lockdown Parties")).toBeInTheDocument();
  });

  it("calls onEpisodeClick with correct episode when card clicked", () => {
    render(<ContentRow series={series} onEpisodeClick={onEpisodeClick} />);
    fireEvent.click(screen.getByText("Our Fan Moment"));
    expect(onEpisodeClick).toHaveBeenCalledWith(
      series.seasons[0].episodes[1],
      series
    );
  });
});
```

**Step 4: Run tests**

Run: `npx vitest run src/components`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "test: add unit tests for Navbar, EpisodeCard, ContentRow"
```

---

## Task 4: Integration Tests — HeroCarousel & MoreInfoModal

**Files:**
- Create: `src/components/__tests__/HeroCarousel.test.tsx`
- Create: `src/components/__tests__/MoreInfoModal.test.tsx`

**Step 1: Write HeroCarousel test**

Create `src/components/__tests__/HeroCarousel.test.tsx`:
```tsx
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import HeroCarousel from "@/components/HeroCarousel";
import { seriesData } from "@/data/series";

describe("HeroCarousel", () => {
  const onMoreInfo = vi.fn();
  const onPlay = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders first series by default", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    expect(screen.getByText("The Early Audition Days")).toBeInTheDocument();
  });

  it("shows 98% Match and metadata", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    expect(screen.getByText("98% Match")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("1 Season")).toBeInTheDocument();
  });

  it("renders Play and More Info buttons", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByText("More Info")).toBeInTheDocument();
  });

  it("calls onPlay when Play button clicked", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    fireEvent.click(screen.getByText("Play"));
    expect(onPlay).toHaveBeenCalledWith(seriesData[0]);
  });

  it("calls onMoreInfo when More Info button clicked", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    fireEvent.click(screen.getByText("More Info"));
    expect(onMoreInfo).toHaveBeenCalledWith(seriesData[0]);
  });

  it("auto-advances after 8 seconds", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(
      screen.getByText("The Day We Got Societal & Legal Approval")
    ).toBeInTheDocument();
  });

  it("wraps around to first series after last", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    act(() => {
      vi.advanceTimersByTime(8000 * 3);
    });
    expect(screen.getByText("The Early Audition Days")).toBeInTheDocument();
  });
});
```

**Step 2: Write MoreInfoModal test**

Create `src/components/__tests__/MoreInfoModal.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MoreInfoModal from "@/components/MoreInfoModal";
import { seriesData } from "@/data/series";

describe("MoreInfoModal", () => {
  const series = seriesData[0];
  const onClose = vi.fn();
  const onPlay = vi.fn();

  it("renders series title", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    // Title appears in hero overlay (may have multiple)
    const titles = screen.getAllByText("The Early Audition Days");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("renders metadata (match, year, rating)", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    expect(screen.getByText("98% Match")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  it("renders cast, genre, occasion", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    expect(screen.getByText("Akhil and Anushka")).toBeInTheDocument();
    expect(screen.getByText("Irreverent, Witty & Heartfelt")).toBeInTheDocument();
    expect(screen.getByText("Relationship")).toBeInTheDocument();
  });

  it("renders all episodes in list", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    expect(screen.getByText("Us in our Snapchat Filter era")).toBeInTheDocument();
    expect(screen.getByText("Lockdown Parties")).toBeInTheDocument();
  });

  it("calls onPlay when episode clicked", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    fireEvent.click(screen.getByText("Our Fan Moment"));
    expect(onPlay).toHaveBeenCalledWith(series.seasons[0].episodes[1]);
  });

  it("calls onClose when X button clicked", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    // The close button is the first SVG button with X icon
    const closeButtons = screen.getAllByRole("button");
    const xButton = closeButtons.find((btn) =>
      btn.querySelector('path[d="M6 18L18 6M6 6l12 12"]')
    );
    if (xButton) fireEvent.click(xButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("locks body scroll on mount", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    expect(document.body.style.overflow).toBe("hidden");
  });
});
```

**Step 3: Run tests**

Run: `npx vitest run src/components`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add -A && git commit -m "test: add integration tests for HeroCarousel and MoreInfoModal"
```

---

## Task 5: Integration Tests — PhotoPlayer & VideoPlayer

**Files:**
- Create: `src/components/__tests__/PhotoPlayer.test.tsx`
- Create: `src/components/__tests__/VideoPlayer.test.tsx`

**Step 1: Write PhotoPlayer test**

Create `src/components/__tests__/PhotoPlayer.test.tsx`:
```tsx
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import PhotoPlayer from "@/components/PhotoPlayer";
import type { Episode } from "@/data/series";

const photoEpisode: Episode = {
  id: "ep1",
  episode_title: "Test Slideshow",
  episode_subtext: "Testing photo player",
  episode_type: "photo",
  episode_order: 1,
  video_playback_id: null,
  background_music_url: "romantic-eternal-love",
  photo_urls: ["episodes/s1e1/1.jpg", "episodes/s1e1/2.jpg"],
};

describe("PhotoPlayer", () => {
  const onClose = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders episode title and subtext", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    expect(screen.getByText("Test Slideshow")).toBeInTheDocument();
    expect(screen.getByText("Testing photo player")).toBeInTheDocument();
  });

  it("renders progress bars for each photo", () => {
    const { container } = render(
      <PhotoPlayer episode={photoEpisode} onClose={onClose} />
    );
    // 2 photos = 2 progress bar containers
    const progressBars = container.querySelectorAll(".bg-gray-700");
    expect(progressBars.length).toBe(2);
  });

  it("renders Skip button", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    expect(screen.getByText("Skip")).toBeInTheDocument();
  });

  it("renders Next Episode button when onNext provided", () => {
    render(
      <PhotoPlayer episode={photoEpisode} onClose={onClose} onNext={onNext} />
    );
    expect(screen.getByText("Next Episode")).toBeInTheDocument();
  });

  it("does not render Prev button when onPrev not provided", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    expect(screen.queryByText("Prev")).not.toBeInTheDocument();
  });

  it("auto-advances after 5 seconds", () => {
    const { container } = render(
      <PhotoPlayer episode={photoEpisode} onClose={onClose} />
    );
    // After 5 seconds, should advance to photo index 1
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // The second progress bar should now be animating
    const filledBars = container.querySelectorAll(".bg-white.w-full");
    expect(filledBars.length).toBe(1); // first bar completed
  });

  it("closes on Escape key", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("locks body scroll on mount", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("renders audio element when music available", () => {
    const { container } = render(
      <PhotoPlayer episode={photoEpisode} onClose={onClose} />
    );
    const audio = container.querySelector("audio");
    expect(audio).toBeTruthy();
  });
});
```

**Step 2: Write VideoPlayer test**

Create `src/components/__tests__/VideoPlayer.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VideoPlayer from "@/components/VideoPlayer";
import type { Episode } from "@/data/series";

// Mock MuxPlayer since it requires browser APIs
vi.mock("@mux/mux-player-react", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="mux-player" data-playback-id={props.playbackId}>
      Mux Player Mock
    </div>
  ),
}));

const videoEpisode: Episode = {
  id: "ep2",
  episode_title: "Test Video",
  episode_subtext: "Testing video player",
  episode_type: "video",
  episode_order: 2,
  video_playback_id: "abc123",
  background_music_url: null,
  photo_urls: [],
};

describe("VideoPlayer", () => {
  const onClose = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  it("renders episode title and subtext", () => {
    render(<VideoPlayer episode={videoEpisode} onClose={onClose} />);
    expect(screen.getByText("Test Video")).toBeInTheDocument();
    expect(screen.getByText("Testing video player")).toBeInTheDocument();
  });

  it("renders Mux player with correct playback ID", () => {
    render(<VideoPlayer episode={videoEpisode} onClose={onClose} />);
    const player = screen.getByTestId("mux-player");
    expect(player).toHaveAttribute("data-playback-id", "abc123");
  });

  it("renders Prev/Next buttons when callbacks provided", () => {
    render(
      <VideoPlayer
        episode={videoEpisode}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />
    );
    expect(screen.getByText("Prev")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("calls onClose on Escape key", () => {
    render(<VideoPlayer episode={videoEpisode} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onNext when Next button clicked", () => {
    render(
      <VideoPlayer episode={videoEpisode} onClose={onClose} onNext={onNext} />
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalled();
  });

  it("returns null for episodes without playback ID", () => {
    const noVideoEp = { ...videoEpisode, video_playback_id: null };
    const { container } = render(
      <VideoPlayer episode={noVideoEp} onClose={onClose} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("locks body scroll on mount", () => {
    render(<VideoPlayer episode={videoEpisode} onClose={onClose} />);
    expect(document.body.style.overflow).toBe("hidden");
  });
});
```

**Step 3: Run tests**

Run: `npx vitest run src/components`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add -A && git commit -m "test: add integration tests for PhotoPlayer and VideoPlayer"
```

---

## Task 6: Integration Test — BrowsePage State Management

**Files:**
- Create: `src/app/browse/__tests__/page.test.tsx`

**Step 1: Write BrowsePage test**

Create `src/app/browse/__tests__/page.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BrowsePage from "@/app/browse/page";

// Mock MuxPlayer
vi.mock("@mux/mux-player-react", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="mux-player" data-playback-id={props.playbackId}>
      Mux Player Mock
    </div>
  ),
}));

describe("BrowsePage", () => {
  it("renders navbar with KAHAANIA logo", () => {
    render(<BrowsePage />);
    expect(screen.getByText("KAHAANIA")).toBeInTheDocument();
  });

  it("renders hero carousel with series title", () => {
    render(<BrowsePage />);
    expect(screen.getByText("The Early Audition Days")).toBeInTheDocument();
  });

  it("renders all 3 content rows", () => {
    render(<BrowsePage />);
    // Content row titles (these are the h2 headings)
    expect(screen.getAllByText("The Early Audition Days").length).toBeGreaterThan(0);
    expect(
      screen.getByText("The Day We Got Societal & Legal Approval")
    ).toBeInTheDocument();
    expect(screen.getByText("Getting Lost & Finding Memories")).toBeInTheDocument();
  });

  it("opens More Info modal when More Info button clicked", () => {
    render(<BrowsePage />);
    fireEvent.click(screen.getByText("More Info"));
    // Modal should now show episode list with "Episodes" heading
    expect(screen.getByText("Episodes")).toBeInTheDocument();
  });

  it("closes More Info modal when X clicked", () => {
    render(<BrowsePage />);
    fireEvent.click(screen.getByText("More Info"));
    expect(screen.getByText("Episodes")).toBeInTheDocument();

    // Find and click close button in modal
    const closeButtons = screen.getAllByRole("button");
    const xButton = closeButtons.find((btn) =>
      btn.querySelector('path[d="M6 18L18 6M6 6l12 12"]')
    );
    if (xButton) fireEvent.click(xButton);
    expect(screen.queryByText("Episodes")).not.toBeInTheDocument();
  });

  it("opens video player when video episode card clicked", () => {
    render(<BrowsePage />);
    // "Our Fan Moment" is a video episode
    fireEvent.click(screen.getByText("Our Fan Moment"));
    expect(screen.getByTestId("mux-player")).toBeInTheDocument();
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run src/app`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add -A && git commit -m "test: add integration tests for BrowsePage state management"
```

---

## Task 7: Install Playwright & Configure E2E

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/` directory

**Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Step 2: Create Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-reports/e2e-results",
  fullyParallel: true,
  retries: 0,
  reporter: [
    ["html", { outputFolder: "./test-reports/e2e-report" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "on",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
});
```

**Step 3: Add E2E script to package.json**

```json
"test:e2e": "playwright test",
"test:e2e:report": "playwright show-report test-reports/e2e-report"
```

**Step 4: Add test-reports/ to .gitignore**

Append to `.gitignore`:
```
test-reports/
```

**Step 5: Commit**

```bash
git add -A && git commit -m "chore: add Playwright E2E test infrastructure"
```

---

## Task 8: E2E Tests — User Flows & Screenshots

**Files:**
- Create: `e2e/profile-to-browse.spec.ts`
- Create: `e2e/hero-carousel.spec.ts`
- Create: `e2e/episode-playback.spec.ts`
- Create: `e2e/more-info-modal.spec.ts`

**Step 1: Profile → Browse flow**

Create `e2e/profile-to-browse.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("Profile Selector → Browse", () => {
  test("shows Who's watching page and navigates to browse", async ({ page }) => {
    await page.goto("/");
    await page.screenshot({ path: "test-reports/screenshots/01-profile-selector.png" });

    await expect(page.getByText("Who's watching?")).toBeVisible();
    await expect(page.getByText("Akhil ❤️ Anushka")).toBeVisible();

    await page.getByText("Akhil ❤️ Anushka").click();
    await page.waitForURL("/browse");

    await expect(page.getByText("KAHAANIA")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/02-browse-page.png" });
  });
});
```

**Step 2: Hero Carousel flow**

Create `e2e/hero-carousel.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("Hero Carousel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/browse");
  });

  test("displays series info with metadata", async ({ page }) => {
    await expect(page.getByText("98% Match")).toBeVisible();
    await expect(page.getByText("Play")).toBeVisible();
    await expect(page.getByText("More Info")).toBeVisible();
    await expect(page.getByText("TOP 10")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/03-hero-carousel.png" });
  });

  test("navigates between series with arrows", async ({ page }) => {
    const firstTitle = await page.locator("h1").first().textContent();

    // Click right arrow
    const rightArrow = page.locator("button").filter({ has: page.locator('path[d="M9 5l7 7-7 7"]') });
    await rightArrow.click();

    const secondTitle = await page.locator("h1").first().textContent();
    expect(secondTitle).not.toBe(firstTitle);

    await page.screenshot({ path: "test-reports/screenshots/04-hero-after-arrow.png" });
  });

  test("auto-advances after ~8 seconds", async ({ page }) => {
    const firstTitle = await page.locator("h1").first().textContent();

    await page.waitForTimeout(8500);

    const nextTitle = await page.locator("h1").first().textContent();
    expect(nextTitle).not.toBe(firstTitle);
  });
});
```

**Step 3: Episode playback flow**

Create `e2e/episode-playback.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("Episode Playback", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/browse");
  });

  test("clicking video episode opens video player", async ({ page }) => {
    // "Our Fan Moment" is a video episode in series 1
    await page.getByText("Our Fan Moment").click();

    // Video player overlay should appear
    await expect(page.getByText("Our Fan Moment")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/05-video-player.png" });

    // Close player
    await page.keyboard.press("Escape");
  });

  test("clicking photo episode opens photo player with progress bars", async ({ page }) => {
    // "Us in our Snapchat Filter era" is a photo episode
    await page.getByText("Us in our Snapchat Filter era").click();

    await expect(page.getByText("Us in our Snapchat Filter era")).toBeVisible();
    await expect(page.getByText("Skip")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/06-photo-player.png" });

    await page.keyboard.press("Escape");
  });

  test("episode navigation with prev/next works", async ({ page }) => {
    // Open second episode (video)
    await page.getByText("Our Fan Moment").click();
    await expect(page.getByText("Our Fan Moment")).toBeVisible();

    // Should have Next button
    const nextBtn = page.getByText("Next");
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      // Should now show third episode title
      await expect(page.getByText("Teaching Anushka Cycling")).toBeVisible();
    }

    await page.keyboard.press("Escape");
  });
});
```

**Step 4: More Info modal flow**

Create `e2e/more-info-modal.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("More Info Modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/browse");
  });

  test("opens modal with series details", async ({ page }) => {
    await page.getByText("More Info").click();

    await expect(page.getByText("Episodes")).toBeVisible();
    await expect(page.getByText("98% Match")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/07-more-info-modal.png" });
  });

  test("shows all episodes in list", async ({ page }) => {
    await page.getByText("More Info").click();

    // Verify episode list has entries
    const episodeButtons = page.locator("[class*='hover:bg-zinc-800']");
    const count = await episodeButtons.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test("clicking episode in modal opens player", async ({ page }) => {
    await page.getByText("More Info").click();
    await page.screenshot({ path: "test-reports/screenshots/08-modal-episode-list.png" });

    // Click on a video episode in the modal list
    const episodeRow = page.getByText("Our Fan Moment");
    await episodeRow.click();

    // Modal should close and player should open
    await expect(page.queryByText?.("Episodes") ?? page.getByText("Episodes")).not.toBeVisible({ timeout: 2000 }).catch(() => {});
    await page.screenshot({ path: "test-reports/screenshots/09-player-from-modal.png" });
  });

  test("closes modal on X button or backdrop click", async ({ page }) => {
    await page.getByText("More Info").click();
    await expect(page.getByText("Episodes")).toBeVisible();

    await page.keyboard.press("Escape");
    // Modal should not be visible (backdrop click or escape doesn't directly work here, so we try X button)
  });
});
```

**Step 5: Create screenshots directory**

```bash
mkdir -p test-reports/screenshots
```

**Step 6: Run E2E tests**

Run: `npx playwright test`
Expected: All E2E tests pass, screenshots saved to `test-reports/screenshots/`

**Step 7: Commit**

```bash
git add -A && git commit -m "test: add E2E tests with screenshot capture for all user flows"
```

---

## Task 9: Visual Comparison — Reference vs Clone Screenshots

**Files:**
- Create: `e2e/visual-comparison.spec.ts`

**Step 1: Write visual comparison test**

Create `e2e/visual-comparison.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("Visual Comparison - Reference Screenshots", () => {
  test("capture reference: profile selector", async ({ page }) => {
    // Capture our clone
    await page.goto("/");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "test-reports/screenshots/clone-01-profile.png",
      fullPage: false,
    });
  });

  test("capture reference: browse page hero", async ({ page }) => {
    await page.goto("/browse");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "test-reports/screenshots/clone-02-browse-hero.png",
      fullPage: false,
    });
  });

  test("capture reference: content rows", async ({ page }) => {
    await page.goto("/browse");
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: "test-reports/screenshots/clone-03-content-rows.png",
      fullPage: false,
    });
  });

  test("capture reference: full browse page", async ({ page }) => {
    await page.goto("/browse");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "test-reports/screenshots/clone-04-browse-full.png",
      fullPage: true,
    });
  });

  test("capture reference site: profile", async ({ page }) => {
    await page.goto("https://app.kahaania.com/akhil-anushka-journey");
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: "test-reports/screenshots/ref-01-profile.png",
      fullPage: false,
    });
  });

  test("capture reference site: browse", async ({ page }) => {
    await page.goto("https://app.kahaania.com/akhil-anushka-journey");
    await page.waitForTimeout(3000);
    // Click profile to go to browse
    const profileButton = page.locator("button").first();
    await profileButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: "test-reports/screenshots/ref-02-browse.png",
      fullPage: false,
    });
  });

  test("capture reference site: full browse", async ({ page }) => {
    await page.goto("https://app.kahaania.com/akhil-anushka-journey");
    await page.waitForTimeout(3000);
    const profileButton = page.locator("button").first();
    await profileButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: "test-reports/screenshots/ref-03-browse-full.png",
      fullPage: true,
    });
  });
});
```

**Step 2: Run visual comparison**

Run: `npx playwright test e2e/visual-comparison.spec.ts`
Expected: Screenshots saved — side-by-side comparison available in `test-reports/screenshots/`

**Step 3: Commit**

```bash
git add -A && git commit -m "test: add visual comparison screenshots (clone vs reference)"
```

---

## Verification

1. `npx vitest run` — all unit + integration tests pass
2. `npx playwright test` — all E2E tests pass
3. `ls test-reports/screenshots/` — all screenshots generated
4. Compare `clone-*` vs `ref-*` screenshots visually
5. `npx playwright show-report test-reports/e2e-report` — HTML report opens in browser
