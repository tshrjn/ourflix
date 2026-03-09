import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BrowsePage from "@/app/browse/page";

// Mock MuxPlayer
vi.mock("@mux/mux-player-react", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="mux-player" data-playback-id={props.playbackId}>
      Mux Player Mock
    </div>
  ),
}));

describe("BrowsePage", () => {
  it("renders navbar with NETFLIX logo", () => {
    render(<BrowsePage />);
    expect(screen.getByText("NETFLIX")).toBeInTheDocument();
  });

  it("renders hero carousel with series title", () => {
    render(<BrowsePage />);
    // Title appears in both hero carousel (h1) and content row (h2)
    const titles = screen.getAllByText("The Early Audition Days");
    expect(titles.length).toBeGreaterThanOrEqual(2);
    // The hero carousel renders an h1
    const heroTitle = titles.find((el) => el.tagName === "H1");
    expect(heroTitle).toBeDefined();
  });

  it("renders all 3 content rows", () => {
    render(<BrowsePage />);
    expect(screen.getAllByText("The Early Audition Days").length).toBeGreaterThan(0);
    expect(
      screen.getByText("The Day We Got Societal & Legal Approval")
    ).toBeInTheDocument();
    expect(screen.getByText("Getting Lost & Finding Memories")).toBeInTheDocument();
  });

  it("opens More Info modal when More Info button clicked", () => {
    render(<BrowsePage />);
    fireEvent.click(screen.getByText("More Info"));
    expect(screen.getByText("Episodes")).toBeInTheDocument();
  });

  it("closes More Info modal when X clicked", () => {
    render(<BrowsePage />);
    fireEvent.click(screen.getByText("More Info"));
    expect(screen.getByText("Episodes")).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button");
    const xButton = closeButtons.find((btn) =>
      btn.querySelector('path[d="M6 18L18 6M6 6l12 12"]')
    );
    if (xButton) fireEvent.click(xButton);
    expect(screen.queryByText("Episodes")).not.toBeInTheDocument();
  });

  it("opens video player when video episode card clicked", () => {
    render(<BrowsePage />);
    fireEvent.click(screen.getByText("Our Fan Moment"));
    expect(screen.getByTestId("mux-player")).toBeInTheDocument();
  });
});
