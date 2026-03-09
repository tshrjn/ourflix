"use client";

import { useState, useEffect } from "react";
import { Episode, Series, seriesData, getAllVideoPlaybackIds } from "@/data/series";
import { fetchThumbnailTokens } from "@/lib/mux-tokens";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import ContentRow from "@/components/ContentRow";
import MoreInfoModal from "@/components/MoreInfoModal";
import PhotoPlayer from "@/components/PhotoPlayer";
import VideoPlayer from "@/components/VideoPlayer";

interface PlayerState {
  episode: Episode;
  series: Series;
  episodeIndex: number;
}

export default function BrowsePage() {
  const [activeModal, setActiveModal] = useState<Series | null>(null);
  const [activePlayer, setActivePlayer] = useState<PlayerState | null>(null);
  const [thumbnailTokens, setThumbnailTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    const ids = getAllVideoPlaybackIds(seriesData);
    if (ids.length > 0) {
      fetchThumbnailTokens(ids).then(setThumbnailTokens);
    }
  }, []);

  const openPlayer = (episode: Episode, series: Series) => {
    const episodes = series.seasons[0]?.episodes ?? [];
    const index = episodes.findIndex((e) => e.id === episode.id);
    setActivePlayer({ episode, series, episodeIndex: index });
    setActiveModal(null);
  };

  const navigateEpisode = (direction: "prev" | "next") => {
    if (!activePlayer) return;
    const episodes = activePlayer.series.seasons[0]?.episodes ?? [];
    const newIndex =
      direction === "next"
        ? activePlayer.episodeIndex + 1
        : activePlayer.episodeIndex - 1;
    if (newIndex >= 0 && newIndex < episodes.length) {
      setActivePlayer({
        episode: episodes[newIndex],
        series: activePlayer.series,
        episodeIndex: newIndex,
      });
    }
  };

  const handlePlay = (series: Series) => {
    const firstEpisode = series.seasons[0]?.episodes[0];
    if (firstEpisode) openPlayer(firstEpisode, series);
  };

  const canGoPrev = activePlayer
    ? activePlayer.episodeIndex > 0
    : false;
  const canGoNext = activePlayer
    ? activePlayer.episodeIndex <
      (activePlayer.series.seasons[0]?.episodes.length ?? 0) - 1
    : false;

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <HeroCarousel
        seriesList={seriesData}
        onMoreInfo={(series) => setActiveModal(series)}
        onPlay={handlePlay}
      />

      <div className="-mt-16 relative z-10 space-y-8 pb-16">
        {seriesData.map((series) => (
          <ContentRow
            key={series.id}
            series={series}
            onEpisodeClick={(episode, s) => openPlayer(episode, s)}
            thumbnailTokens={thumbnailTokens}
          />
        ))}
      </div>

      {/* More Info Modal */}
      {activeModal && (
        <MoreInfoModal
          series={activeModal}
          onClose={() => setActiveModal(null)}
          onPlay={(episode) => openPlayer(episode, activeModal)}
          thumbnailTokens={thumbnailTokens}
        />
      )}

      {/* Photo Player */}
      {activePlayer && activePlayer.episode.episode_type === "photo" && (
        <PhotoPlayer
          key={activePlayer.episode.id}
          episode={activePlayer.episode}
          onClose={() => setActivePlayer(null)}
          onPrev={canGoPrev ? () => navigateEpisode("prev") : undefined}
          onNext={canGoNext ? () => navigateEpisode("next") : undefined}
        />
      )}

      {/* Video Player */}
      {activePlayer && activePlayer.episode.episode_type === "video" && (
        <VideoPlayer
          key={activePlayer.episode.id}
          episode={activePlayer.episode}
          onClose={() => setActivePlayer(null)}
          onPrev={canGoPrev ? () => navigateEpisode("prev") : undefined}
          onNext={canGoNext ? () => navigateEpisode("next") : undefined}
        />
      )}
    </div>
  );
}
