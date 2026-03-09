import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  it("renders OURFLIX logo", () => {
    render(<Navbar />);
    expect(screen.getByText("OURFLIX")).toBeInTheDocument();
  });

  it("renders all nav links", () => {
    render(<Navbar />);
    for (const item of ["Home", "Series", "Movies", "Games", "Popular", "My List"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders profile avatar image", () => {
    render(<Navbar />);
    const avatar = screen.getByAltText("Profile");
    expect(avatar).toBeInTheDocument();
    expect(avatar.tagName).toBe("IMG");
  });
});
