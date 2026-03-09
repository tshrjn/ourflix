import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  it("renders NETFLIX logo", () => {
    render(<Navbar />);
    expect(screen.getByText("NETFLIX")).toBeInTheDocument();
  });

  it("renders all nav links", () => {
    render(<Navbar />);
    for (const item of ["Home", "Series", "Movies", "Games", "Popular", "My List"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders profile avatar", () => {
    render(<Navbar />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
