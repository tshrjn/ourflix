import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EpisodeCard from "@/components/EpisodeCard";
import type { Episode } from "@/data/series";

const photoEpisode: Episode = {
  id: "ep1",
  episode_title: "Test Photo Episode",
  episode_subtext: "Test subtext",
  episode_type: "photo",
  episode_order: 1,
  video_playback_id: null,
  background_music_url: null,
  photo_urls: ["episodes/s1e1/1.jpg"],
};

const videoEpisode: Episode = {
  id: "ep2",
  episode_title: "Test Video Episode",
  episode_subtext: "Test subtext",
  episode_type: "video",
  episode_order: 2,
  video_playback_id: "abc123",
  background_music_url: null,
  photo_urls: [],
};

describe("EpisodeCard", () => {
  it("renders episode title", () => {
    render(<EpisodeCard episode={photoEpisode} onClick={() => {}} />);
    expect(screen.getByText("Test Photo Episode")).toBeInTheDocument();
  });

  it("renders category tag based on episode order", () => {
    render(<EpisodeCard episode={photoEpisode} onClick={() => {}} />);
    expect(screen.getByText("100% Match")).toBeInTheDocument();
  });

  it("renders Hero tag for episode order 2", () => {
    render(<EpisodeCard episode={videoEpisode} onClick={() => {}} />);
    expect(screen.getByText("Hero")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<EpisodeCard episode={photoEpisode} onClick={onClick} />);
    fireEvent.click(screen.getByText("Test Photo Episode"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
