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
    <section className="space-y-2 px-4 md:px-12">
      <h2 className="text-lg font-semibold text-white md:text-xl">
        {series.title}
      </h2>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-4 md:gap-3">
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
