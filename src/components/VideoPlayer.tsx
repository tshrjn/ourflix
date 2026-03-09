"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Episode, getMuxThumbnail } from "@/data/series";
import { fetchPlaybackTokens } from "@/lib/mux-tokens";

interface VideoPlayerProps {
  episode: Episode;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  thumbnailToken?: string;
}

export default function VideoPlayer({
  episode,
  onClose,
  onNext,
  onPrev,
  thumbnailToken,
}: VideoPlayerProps) {
  const [tokens, setTokens] = useState<{
    playback: string;
    thumbnail: string;
    storyboard: string;
  } | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  useEffect(() => {
    if (!episode.video_playback_id) return;
    setIsLoadingTokens(true);
    fetchPlaybackTokens(episode.video_playback_id)
      .then(setTokens)
      .finally(() => setIsLoadingTokens(false));
  }, [episode.video_playback_id]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!episode.video_playback_id) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Title Overlay */}
      <div className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 text-center">
        <p className="text-sm font-medium text-white md:text-base">
          {episode.episode_title}
        </p>
        <p className="text-xs text-gray-400">{episode.episode_subtext}</p>
      </div>

      {/* Navigation */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-3">
        {onPrev && (
          <button
            onClick={onPrev}
            className="flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Prev
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            Next
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/80 text-white hover:bg-zinc-700"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Loading Overlay */}
      {isLoadingTokens && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      {/* Mux Player */}
      <MuxPlayer
        playbackId={episode.video_playback_id}
        streamType="on-demand"
        poster={getMuxThumbnail(episode.video_playback_id, tokens?.thumbnail ?? thumbnailToken)}
        tokens={tokens ? {
          playback: tokens.playback,
          thumbnail: tokens.thumbnail,
          storyboard: tokens.storyboard,
        } : undefined}
        metadata={{
          video_title: episode.episode_title,
        }}
        style={{ width: "100%", height: "100%", maxHeight: "100vh" }}
        autoPlay={!isLoadingTokens}
      />
    </div>
  );
}
