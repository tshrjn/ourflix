"use client";

import { Episode, getEpisodeThumbnail, getCategoryTag } from "@/data/series";

interface EpisodeCardProps {
  episode: Episode;
  onClick: () => void;
  thumbnailTokens?: Record<string, string>;
}

export default function EpisodeCard({ episode, onClick, thumbnailTokens }: EpisodeCardProps) {
  const thumbnail = getEpisodeThumbnail(episode, thumbnailTokens);
  const tag = getCategoryTag(episode.episode_order);

  return (
    <button
      onClick={onClick}
      className="group w-[160px] flex-shrink-0 text-left transition-transform duration-200 hover:scale-105 md:w-[200px]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-zinc-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={episode.episode_title}
            className="h-full w-full object-cover transition-all duration-200 group-hover:brightness-125"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-700 text-4xl">
            {episode.episode_type === "video" ? "🎬" : "📷"}
          </div>
        )}
        {/* Category Tag */}
        <div className="absolute bottom-2 left-2">
          <span className="rounded bg-[#46d369]/90 px-2 py-0.5 text-[10px] font-semibold text-white md:text-xs">
            {tag}
          </span>
        </div>
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
      {/* Title */}
      <p className="mt-1.5 truncate text-xs text-gray-300 group-hover:text-white md:text-sm">
        {episode.episode_title}
      </p>
    </button>
  );
}
