import { describe, expect, it, vi, beforeEach } from "vitest";
import { fetchThumbnailTokens, fetchPlaybackTokens } from "@/lib/mux-tokens";

describe("fetchThumbnailTokens", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns thumbnail tokens map on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tokens: {
          abc123: { thumbnail: "thumb-jwt" },
          def456: { thumbnail: "thumb-jwt-2" },
        },
      }),
    } as Response);

    const result = await fetchThumbnailTokens(["abc123", "def456"]);
    expect(result).toEqual({ abc123: "thumb-jwt", def456: "thumb-jwt-2" });
  });

  it("returns empty object on fetch error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error")
    );
    const result = await fetchThumbnailTokens(["abc123"]);
    expect(result).toEqual({});
  });

  it("returns empty object on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
    } as Response);
    const result = await fetchThumbnailTokens(["abc123"]);
    expect(result).toEqual({});
  });
});

describe("fetchPlaybackTokens", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns playback tokens on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tokens: {
          abc123: {
            playback: "play-jwt",
            thumbnail: "thumb-jwt",
            storyboard: "sb-jwt",
          },
        },
      }),
    } as Response);

    const result = await fetchPlaybackTokens("abc123");
    expect(result).toEqual({
      playback: "play-jwt",
      thumbnail: "thumb-jwt",
      storyboard: "sb-jwt",
    });
  });

  it("returns null on fetch error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("fail"));
    const result = await fetchPlaybackTokens("abc123");
    expect(result).toBeNull();
  });

  it("returns null when tokens are empty (unsigned fallback)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tokens: { abc123: {} },
      }),
    } as Response);

    const result = await fetchPlaybackTokens("abc123");
    expect(result).toBeNull();
  });
});
