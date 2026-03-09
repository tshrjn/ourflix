import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VideoPlayer from "@/components/VideoPlayer";
import type { Episode } from "@/data/series";

// Mock MuxPlayer since it requires browser APIs
vi.mock("@mux/mux-player-react", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="mux-player" data-playback-id={props.playbackId}>
      Mux Player Mock
    </div>
  ),
}));

const videoEpisode: Episode = {
  id: "ep2",
  episode_title: "Test Video",
  episode_subtext: "Testing video player",
  episode_type: "video",
  episode_order: 2,
  video_playback_id: "abc123",
  background_music_url: null,
  photo_urls: [],
};

describe("VideoPlayer", () => {
  const onClose = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  it("renders episode title and subtext", () => {
    render(<VideoPlayer episode={videoEpisode} onClose={onClose} />);
    expect(screen.getByText("Test Video")).toBeInTheDocument();
    expect(screen.getByText("Testing video player")).toBeInTheDocument();
  });

  it("renders Mux player with correct playback ID", () => {
    render(<VideoPlayer episode={videoEpisode} onClose={onClose} />);
    const player = screen.getByTestId("mux-player");
    expect(player).toHaveAttribute("data-playback-id", "abc123");
  });

  it("renders Prev/Next buttons when callbacks provided", () => {
    render(
      <VideoPlayer
        episode={videoEpisode}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />
    );
    expect(screen.getByText("Prev")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("calls onClose on Escape key", () => {
    render(<VideoPlayer episode={videoEpisode} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onNext when Next button clicked", () => {
    render(
      <VideoPlayer episode={videoEpisode} onClose={onClose} onNext={onNext} />
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalled();
  });

  it("returns null for episodes without playback ID", () => {
    const noVideoEp = { ...videoEpisode, video_playback_id: null };
    const { container } = render(
      <VideoPlayer episode={noVideoEp} onClose={onClose} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("locks body scroll on mount", () => {
    render(<VideoPlayer episode={videoEpisode} onClose={onClose} />);
    expect(document.body.style.overflow).toBe("hidden");
  });
});
