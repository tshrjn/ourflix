"use client";

import { useState } from "react";
import { Episode, getEpisodeThumbnail, getCategoryTag } from "@/data/series";

interface EpisodeCardProps {
  episode: Episode;
  onClick: () => void;
  thumbnailTokens?: Record<string, string>;
}

export default function EpisodeCard({ episode, onClick, thumbnailTokens }: EpisodeCardProps) {
  const thumbnail = getEpisodeThumbnail(episode, thumbnailTokens);
  const tag = getCategoryTag(episode.episode_order);
  const [imgError, setImgError] = useState(false);

  const showFallback = !thumbnail || imgError;

  return (
    <button
      onClick={onClick}
      className="group w-[160px] flex-shrink-0 text-left transition-transform duration-200 hover:scale-105 md:w-[200px]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-800">
        {showFallback ? (
          <div className="flex h-full w-full items-center justify-center bg-zinc-700 text-4xl">
            {episode.episode_type === "video" ? "🎬" : "📷"}
          </div>
        ) : (
          <img
            src={thumbnail}
            alt={episode.episode_title}
            className="h-full w-full object-cover transition-all duration-200 group-hover:brightness-125"
            onError={() => setImgError(true)}
          />
        )}
        {/* Gradient fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-[15%] to-transparent to-[30%] pointer-events-none" />
        {/* Play icon overlay for videos */}
        {episode.episode_type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
              <svg
                className="ml-0.5 h-5 w-5 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      {/* Category Tag — plain green text below image */}
      <p className="mt-2 mb-1 text-[10px] text-[#05df72]">{tag}</p>
      {/* Title */}
      <p className="truncate text-xs text-gray-300 group-hover:text-white md:text-sm">
        {episode.episode_title}
      </p>
    </button>
  );
}
