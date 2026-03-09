"use client";

import { useEffect, useState } from "react";
import {
  Episode,
  Series,
  getPhotoUrl,
  getEpisodeThumbnail,
} from "@/data/series";

interface MoreInfoModalProps {
  series: Series;
  onClose: () => void;
  onPlay: (episode: Episode) => void;
  thumbnailTokens?: Record<string, string>;
}

export default function MoreInfoModal({
  series,
  onClose,
  onPlay,
  thumbnailTokens,
}: MoreInfoModalProps) {
  const episodes = series.seasons[0]?.episodes ?? [];
  const [heroError, setHeroError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 pb-8 pt-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[900px] animate-fade-in overflow-hidden rounded-lg bg-[#181818]">
        {/* Hero Image */}
        <div className="relative aspect-video w-full">
          {heroError ? (
            <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
          ) : (
            <img
              src={getPhotoUrl(series.cover_thumbnail_url)}
              alt={series.title}
              className="h-full w-full object-cover"
              onError={() => setHeroError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#181818] text-white transition-colors hover:bg-zinc-700"
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

          {/* Title + Buttons over hero image */}
          <div className="absolute bottom-6 left-6 right-6 space-y-4">
            <h2 className="text-2xl font-bold text-white md:text-4xl">
              {series.title}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => episodes[0] && onPlay(episodes[0])}
                className="flex items-center gap-2 rounded bg-white px-6 py-2 text-sm font-bold text-black hover:bg-gray-300"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-500 text-white hover:border-white">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-500 text-white hover:border-white">
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
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-6 px-6 py-4 md:flex-row">
          <div className="space-y-2 md:w-2/3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-[#46d369]">98% Match</span>
              <span className="text-gray-400">2025</span>
              <span className="rounded border border-gray-500 px-1.5 py-0.5 text-xs text-gray-400">
                U/A 13+
              </span>
              <span className="text-gray-400">1 Season</span>
            </div>
            <p className="text-sm text-gray-300">{series.sub_title}</p>
          </div>
          <div className="space-y-2 text-sm md:w-1/3">
            <p>
              <span className="text-gray-500">Cast: </span>
              <span className="text-gray-300">{series.series_cast}</span>
            </p>
            <p>
              <span className="text-gray-500">Genre: </span>
              <span className="text-gray-300">{series.genre}</span>
            </p>
            <p>
              <span className="text-gray-500">Occasion: </span>
              <span className="text-gray-300">{series.occasion_type}</span>
            </p>
          </div>
        </div>

        {/* Episodes List */}
        <div className="px-6 pb-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Episodes</h3>
          <div className="space-y-3">
            {episodes.map((episode, index) => {
              const thumb = getEpisodeThumbnail(episode, thumbnailTokens);
              return (
                <button
                  key={episode.id}
                  onClick={() => onPlay(episode)}
                  className="group flex w-full items-center gap-4 rounded border border-transparent p-3 text-left transition-colors hover:border-gray-700 hover:bg-zinc-800"
                >
                  <span className="w-6 flex-shrink-0 text-center text-lg text-gray-500">
                    {index + 1}
                  </span>
                  <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded bg-zinc-700">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={episode.episode_title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        {episode.episode_type === "video" ? "🎬" : "📷"}
                      </div>
                    )}
                    {/* Small play icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black/50">
                        <svg
                          className="ml-0.5 h-3 w-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {episode.episode_title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {episode.episode_subtext}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
