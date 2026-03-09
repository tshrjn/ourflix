export async function fetchThumbnailTokens(
  playbackIds: string[],
): Promise<Record<string, string>> {
  try {
    const res = await fetch("/api/mux/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playbackIds, type: "thumbnail" }),
    });
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, string> = {};
    for (const [id, tokenObj] of Object.entries(data.tokens)) {
      const t = tokenObj as { thumbnail?: string };
      if (t.thumbnail) result[id] = t.thumbnail;
    }
    return result;
  } catch {
    return {};
  }
}

export async function fetchPlaybackTokens(
  playbackId: string,
): Promise<{
  playback: string;
  thumbnail: string;
  storyboard: string;
} | null> {
  try {
    const res = await fetch("/api/mux/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playbackIds: [playbackId], type: "playback" }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const tokenObj = data.tokens[playbackId];
    if (!tokenObj?.playback) return null;
    return {
      playback: tokenObj.playback,
      thumbnail: tokenObj.thumbnail,
      storyboard: tokenObj.storyboard,
    };
  } catch {
    return null;
  }
}
