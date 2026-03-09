import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ContentRow from "@/components/ContentRow";
import { seriesData } from "@/data/series";

describe("ContentRow", () => {
  const series = seriesData[0]; // "The Early Audition Days"
  const onEpisodeClick = vi.fn();

  it("renders series title", () => {
    render(<ContentRow series={series} onEpisodeClick={onEpisodeClick} />);
    expect(screen.getByText("The Early Audition Days")).toBeInTheDocument();
  });

  it("renders all episode cards", () => {
    render(<ContentRow series={series} onEpisodeClick={onEpisodeClick} />);
    expect(screen.getByText("Museum Day")).toBeInTheDocument();
    expect(screen.getByText("Jaipuriyaa")).toBeInTheDocument();
    expect(screen.getByText("1st Stayacation")).toBeInTheDocument();
  });

  it("calls onEpisodeClick with correct episode when card clicked", () => {
    render(<ContentRow series={series} onEpisodeClick={onEpisodeClick} />);
    fireEvent.click(screen.getByText("Jaipuriyaa"));
    expect(onEpisodeClick).toHaveBeenCalledWith(
      series.seasons[0].episodes[1],
      series
    );
  });
});
