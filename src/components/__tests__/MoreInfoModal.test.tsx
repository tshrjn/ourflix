import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MoreInfoModal from "@/components/MoreInfoModal";
import { seriesData } from "@/data/series";

describe("MoreInfoModal", () => {
  const series = seriesData[0];
  const onClose = vi.fn();
  const onPlay = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
  });

  it("renders series title", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    const titles = screen.getAllByText("The Early Audition Days");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("renders metadata (match, year, rating)", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    expect(screen.getByText("98% Match")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  it("renders cast, genre, occasion", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    expect(screen.getByText("Tushar and Sheetal")).toBeInTheDocument();
    expect(screen.getByText("Irreverent, Witty & Heartfelt")).toBeInTheDocument();
    expect(screen.getByText("Relationship")).toBeInTheDocument();
  });

  it("renders all episodes in list", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    expect(screen.getByText("Us in our Snapchat Filter era")).toBeInTheDocument();
    expect(screen.getByText("Lockdown Parties")).toBeInTheDocument();
  });

  it("calls onPlay when episode clicked", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    fireEvent.click(screen.getByText("Our Fan Moment"));
    expect(onPlay).toHaveBeenCalledWith(series.seasons[0].episodes[1]);
  });

  it("calls onClose when X button clicked", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    const closeButtons = screen.getAllByRole("button");
    const xButton = closeButtons.find((btn) =>
      btn.querySelector('path[d="M6 18L18 6M6 6l12 12"]')
    );
    if (xButton) fireEvent.click(xButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("locks body scroll on mount", () => {
    render(<MoreInfoModal series={series} onClose={onClose} onPlay={onPlay} />);
    expect(document.body.style.overflow).toBe("hidden");
  });
});
