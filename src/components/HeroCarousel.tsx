"use client";

import { useCallback, useEffect, useState } from "react";
import { Series, getPhotoUrl } from "@/data/series";

interface HeroCarouselProps {
  seriesList: Series[];
  onMoreInfo: (series: Series) => void;
  onPlay: (series: Series) => void;
}

export default function HeroCarousel({
  seriesList,
  onMoreInfo,
  onPlay,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % seriesList.length);
  }, [seriesList.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + seriesList.length) % seriesList.length
    );
  }, [seriesList.length]);

  useEffect(() => {
    const interval = setInterval(goNext, 8000);
    return () => clearInterval(interval);
  }, [goNext]);

  const series = seriesList[currentIndex];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          key={series.id}
          src={getPhotoUrl(series.cover_thumbnail_url)}
          alt={series.title}
          className="h-full w-full object-cover transition-opacity duration-700"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-[15%] left-4 z-10 max-w-xl space-y-4 md:left-12">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg md:text-5xl">
          {series.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-[#46d369]">98% Match</span>
          <span className="text-gray-400">2025</span>
          <span className="rounded border border-gray-500 px-1.5 py-0.5 text-xs text-gray-400">
            U/A 13+
          </span>
          <span className="text-gray-400">1 Season</span>
        </div>

        {/* Top 10 Badge */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 items-center rounded bg-red-600 px-1.5 text-xs font-bold">
            TOP 10
          </div>
          <span className="text-sm font-medium text-white">
            #1 in Movies Today
          </span>
        </div>

        {/* Description */}
        <p className="line-clamp-3 max-w-lg text-sm text-gray-200 md:text-base">
          {series.sub_title}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlay(series)}
            className="flex items-center gap-2 rounded bg-white px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-gray-300 md:px-7 md:text-base"
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
          <button
            onClick={() => onMoreInfo(series)}
            className="flex items-center gap-2 rounded bg-gray-500/70 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-500/50 md:px-7 md:text-base"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            More Info
          </button>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={goPrev}
        className="absolute left-2 top-1/2 z-10 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded bg-black/40 text-white opacity-0 transition-opacity hover:bg-black/70 md:opacity-100"
      >
        <svg
          className="h-6 w-6"
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
      </button>

      {/* Right Arrow */}
      <button
        onClick={goNext}
        className="absolute right-2 top-1/2 z-10 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded bg-black/40 text-white opacity-0 transition-opacity hover:bg-black/70 md:opacity-100"
      >
        <svg
          className="h-6 w-6"
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

      {/* Dot Indicators */}
      <div className="absolute bottom-8 right-4 z-10 flex gap-1.5 md:right-12">
        {seriesList.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-0.5 w-4 rounded-full transition-all ${
              i === currentIndex ? "w-6 bg-white" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
