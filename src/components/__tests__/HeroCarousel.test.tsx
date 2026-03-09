import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import HeroCarousel from "@/components/HeroCarousel";
import { seriesData } from "@/data/series";

describe("HeroCarousel", () => {
  const onMoreInfo = vi.fn();
  const onPlay = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders first series by default", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    expect(screen.getByText("The Early Audition Days")).toBeInTheDocument();
  });

  it("shows 98% Match and metadata", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    expect(screen.getByText("98% Match")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("1 Season")).toBeInTheDocument();
  });

  it("renders Play and More Info buttons", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByText("More Info")).toBeInTheDocument();
  });

  it("calls onPlay when Play button clicked", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    fireEvent.click(screen.getByText("Play"));
    expect(onPlay).toHaveBeenCalledWith(seriesData[0]);
  });

  it("calls onMoreInfo when More Info button clicked", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    fireEvent.click(screen.getByText("More Info"));
    expect(onMoreInfo).toHaveBeenCalledWith(seriesData[0]);
  });

  it("auto-advances after 8 seconds", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(
      screen.getByText("The Day We Got Societal & Legal Approval")
    ).toBeInTheDocument();
  });

  it("wraps around to first series after last", () => {
    render(
      <HeroCarousel seriesList={seriesData} onMoreInfo={onMoreInfo} onPlay={onPlay} />
    );
    act(() => {
      vi.advanceTimersByTime(8000 * 3);
    });
    expect(screen.getByText("The Early Audition Days")).toBeInTheDocument();
  });
});
