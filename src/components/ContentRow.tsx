"use client";

import { Episode, Series } from "@/data/series";
import EpisodeCard from "./EpisodeCard";

interface ContentRowProps {
  series: Series;
  onEpisodeClick: (episode: Episode, series: Series) => void;
  thumbnailTokens?: Record<string, string>;
}

export default function ContentRow({
  series,
  onEpisodeClick,
  thumbnailTokens,
}: ContentRowProps) {
  const episodes = series.seasons[0]?.episodes ?? [];

  return (
    <section className="py-6 px-6">
      <h2 className="text-xl font-bold text-white mb-6">
        {series.title}
      </h2>
      <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-4">
        {episodes.map((episode) => (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            onClick={() => onEpisodeClick(episode, series)}
            thumbnailTokens={thumbnailTokens}
          />
        ))}
      </div>
    </section>
  );
}
