import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getPhotoUrl,
  getMuxThumbnail,
  getEpisodeThumbnail,
  getAllVideoPlaybackIds,
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

  it("appends token query param when provided", () => {
    const id = "abc123";
    const token = "jwt-token-here";
    expect(getMuxThumbnail(id, token)).toBe(
      `https://image.mux.com/${id}/thumbnail.jpg?token=${token}`
    );
  });

  it("returns bare URL when token is undefined", () => {
    const id = "abc123";
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

describe("getEpisodeThumbnail with tokens", () => {
  it("uses token from thumbnailTokens map for video episodes", () => {
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
    const tokens = { abc123: "my-jwt-token" };
    expect(getEpisodeThumbnail(episode, tokens)).toBe(
      "https://image.mux.com/abc123/thumbnail.jpg?token=my-jwt-token"
    );
  });

  it("returns bare URL when thumbnailTokens is empty", () => {
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
    expect(getEpisodeThumbnail(episode, {})).toBe(
      "https://image.mux.com/abc123/thumbnail.jpg"
    );
  });
});

describe("getAllVideoPlaybackIds", () => {
  it("extracts all video playback IDs from series data", () => {
    const ids = getAllVideoPlaybackIds(seriesData);
    expect(ids.length).toBe(1); // 1 video episode total
    expect(ids).toContain("HW00AJKHAjC000135ntgnj0001gHCV3017IboJA4fMKupRjwI");
  });

  it("returns empty array for empty input", () => {
    expect(getAllVideoPlaybackIds([])).toEqual([]);
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

  it("series 1 has 5 episodes", () => {
    expect(seriesData[0].seasons[0].episodes).toHaveLength(5);
  });

  it("series 2 has 4 episodes", () => {
    expect(seriesData[1].seasons[0].episodes).toHaveLength(4);
  });

  it("series 3 has 4 episodes", () => {
    expect(seriesData[2].seasons[0].episodes).toHaveLength(4);
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

// ---- Local asset mode (NEXT_PUBLIC_LOCAL_ASSETS=true) ----

describe("local asset mode", () => {
  let localGetPhotoUrl: typeof getPhotoUrl;
  let localGetMusicUrl: typeof getMusicUrl;
  let localLocalAssets: boolean;

  beforeEach(async () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_ASSETS", "true");
    vi.resetModules();
    const mod = await import("@/data/series");
    localGetPhotoUrl = mod.getPhotoUrl;
    localGetMusicUrl = mod.getMusicUrl;
    localLocalAssets = mod.LOCAL_ASSETS;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("LOCAL_ASSETS is true when env var is set", () => {
    expect(localLocalAssets).toBe(true);
  });

  it("getPhotoUrl falls back to URL when LOCAL_PHOTO_MAP has no match", () => {
    const ikUrl =
      "https://ik.imagekit.io/kahaania/photos/some-old-url.png";
    expect(localGetPhotoUrl(ikUrl)).toBe(ikUrl);
  });

  it("getPhotoUrl falls back to original URL for unknown http URLs", () => {
    const unknownUrl = "https://example.com/unknown.jpg";
    expect(localGetPhotoUrl(unknownUrl)).toBe(unknownUrl);
  });

  it("getPhotoUrl prepends /assets/ for relative paths", () => {
    expect(localGetPhotoUrl("episodes/s1e1/1.jpg")).toBe(
      "/assets/episodes/s1e1/1.jpg"
    );
  });

  it("getMusicUrl returns local path for preset name", () => {
    expect(localGetMusicUrl("romantic-eternal-love")).toBe(
      "/assets/music/romantic-eternal-love.mp3"
    );
  });

  it("getMusicUrl returns full URL as-is even in local mode", () => {
    const url = "https://cdn.example.com/music.mp3";
    expect(localGetMusicUrl(url)).toBe(url);
  });
});
