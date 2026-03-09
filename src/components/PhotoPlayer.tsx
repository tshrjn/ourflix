"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Episode, getPhotoUrl, getMusicUrl } from "@/data/series";

interface PhotoPlayerProps {
  episode: Episode;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function PhotoPlayer({
  episode,
  onClose,
  onNext,
  onPrev,
}: PhotoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const photos = episode.photo_urls;
  const currentPhoto = photos[currentIndex];
  const photoUrl = getPhotoUrl(currentPhoto);
  const musicUrl = episode.background_music_url
    ? getMusicUrl(episode.background_music_url)
    : null;

  const advance = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgressKey((prev) => prev + 1);
    } else {
      // Last photo — close or loop
      onClose();
    }
  }, [currentIndex, photos.length, onClose]);

  // Auto-advance timer
  useEffect(() => {
    timerRef.current = setTimeout(advance, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, advance]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Mute/unmute audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
        setProgressKey((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, advance, currentIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress Bar */}
      <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 px-1 pt-1">
        {photos.map((_, i) => (
          <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-gray-700">
            {i < currentIndex ? (
              <div className="h-full w-full bg-white" />
            ) : i === currentIndex ? (
              <div
                key={progressKey}
                className="animate-progress h-full bg-white"
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Background (blurred) */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={photoUrl}
          alt=""
          className="h-full w-full scale-125 object-cover opacity-40 blur-[40px]"
        />
      </div>

      {/* Main Photo */}
      <div className="relative flex h-full w-full items-center justify-center p-8">
        <img
          key={currentPhoto}
          src={photoUrl}
          alt={episode.episode_title}
          className="max-h-full max-w-full object-contain drop-shadow-2xl"
        />
      </div>

      {/* Controls */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-3">
        {onPrev && (
          <button
            onClick={onPrev}
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            Prev
          </button>
        )}
        <button
          onClick={() => {
            advance();
          }}
          className="text-sm font-medium text-white/80 hover:text-white"
        >
          Skip
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            Next Episode
          </button>
        )}
      </div>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-3">
        {/* Volume Toggle */}
        {musicUrl && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-500 text-white hover:border-white"
          >
            {isMuted ? (
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
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
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
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/80 text-white hover:bg-zinc-700"
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
      </div>

      {/* Episode Info */}
      <div className="absolute bottom-6 left-6 z-20">
        <p className="text-sm font-medium text-white">
          {episode.episode_title}
        </p>
        <p className="text-xs text-gray-400">{episode.episode_subtext}</p>
      </div>

      {/* Background Music */}
      {musicUrl && (
        <audio ref={audioRef} src={musicUrl} autoPlay loop muted={isMuted} />
      )}
    </div>
  );
}
