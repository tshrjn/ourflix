import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import PhotoPlayer from "@/components/PhotoPlayer";
import type { Episode } from "@/data/series";

const photoEpisode: Episode = {
  id: "ep1",
  episode_title: "Test Slideshow",
  episode_subtext: "Testing photo player",
  episode_type: "photo",
  episode_order: 1,
  video_playback_id: null,
  background_music_url: "romantic-eternal-love",
  photo_urls: ["episodes/s1e1/1.jpg", "episodes/s1e1/2.jpg"],
};

describe("PhotoPlayer", () => {
  const onClose = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders episode title and subtext", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    expect(screen.getByText("Test Slideshow")).toBeInTheDocument();
    expect(screen.getByText("Testing photo player")).toBeInTheDocument();
  });

  it("renders progress bars for each photo", () => {
    const { container } = render(
      <PhotoPlayer episode={photoEpisode} onClose={onClose} />
    );
    const progressBars = container.querySelectorAll(".bg-gray-700");
    expect(progressBars.length).toBe(2);
  });

  it("renders Skip button", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    expect(screen.getByText("Skip")).toBeInTheDocument();
  });

  it("renders Next Episode button when onNext provided", () => {
    render(
      <PhotoPlayer episode={photoEpisode} onClose={onClose} onNext={onNext} />
    );
    expect(screen.getByText("Next Episode")).toBeInTheDocument();
  });

  it("does not render Prev button when onPrev not provided", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    expect(screen.queryByText("Prev")).not.toBeInTheDocument();
  });

  it("auto-advances after 5 seconds", () => {
    const { container } = render(
      <PhotoPlayer episode={photoEpisode} onClose={onClose} />
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    const filledBars = container.querySelectorAll(".bg-white.w-full");
    expect(filledBars.length).toBe(1);
  });

  it("closes on Escape key", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("locks body scroll on mount", () => {
    render(<PhotoPlayer episode={photoEpisode} onClose={onClose} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("renders audio element when music available", () => {
    const { container } = render(
      <PhotoPlayer episode={photoEpisode} onClose={onClose} />
    );
    const audio = container.querySelector("audio");
    expect(audio).toBeTruthy();
  });
});
