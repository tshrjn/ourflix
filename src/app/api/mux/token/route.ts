import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

export async function POST(request: NextRequest) {
  const { playbackIds, type } = await request.json();

  // Validate input
  if (
    !Array.isArray(playbackIds) ||
    playbackIds.length === 0 ||
    playbackIds.length > 50
  ) {
    return NextResponse.json({ error: "Invalid playbackIds" }, { status: 400 });
  }
  if (type !== "thumbnail" && type !== "playback") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Check for signing keys — if missing, return empty tokens (unsigned fallback)
  const signingKeyId = process.env.MUX_SIGNING_KEY;
  const signingKeySecret = process.env.MUX_PRIVATE_KEY;

  if (!signingKeyId || !signingKeySecret) {
    const emptyTokens: Record<string, Record<string, string>> = {};
    for (const id of playbackIds) {
      emptyTokens[id] = {};
    }
    return NextResponse.json({ tokens: emptyTokens });
  }

  try {
    // Instantiate Mux client — it reads MUX_SIGNING_KEY and MUX_PRIVATE_KEY
    // from env automatically for JWT signing.
    const mux = new Mux();

    const tokens: Record<string, Record<string, string>> = {};

    for (const id of playbackIds) {
      if (type === "thumbnail") {
        const thumbnailToken = await mux.jwt.signPlaybackId(id, {
          type: "thumbnail",
          expiration: "24h",
        });
        tokens[id] = { thumbnail: thumbnailToken };
      } else {
        // type === "playback" — generate all 3 token types at once
        const result = await mux.jwt.signPlaybackId(id, {
          type: ["video", "thumbnail", "storyboard"],
          expiration: "4h",
        });
        tokens[id] = {
          playback: result["playback-token"] ?? "",
          thumbnail: result["thumbnail-token"] ?? "",
          storyboard: result["storyboard-token"] ?? "",
        };
      }
    }

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Mux token signing error:", error);
    return NextResponse.json(
      { error: "Token generation failed" },
      { status: 500 },
    );
  }
}
