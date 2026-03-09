import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProfileSelector from "@/app/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ProfileSelector", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders "Who\'s watching?" heading', () => {
    render(<ProfileSelector />);
    expect(screen.getByText("Who's watching?")).toBeInTheDocument();
  });

  it("renders the username from PROJECT config", () => {
    render(<ProfileSelector />);
    expect(screen.getByText("Tushar ❤️ Sheetal")).toBeInTheDocument();
  });

  it("renders profile avatar image initially", () => {
    render(<ProfileSelector />);
    const img = screen.getByAltText("Tushar ❤️ Sheetal's Profile");
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe("IMG");
  });

  it("shows smiley fallback when avatar image fails to load", () => {
    render(<ProfileSelector />);
    const img = screen.getByAltText("Tushar ❤️ Sheetal's Profile");

    fireEvent.error(img);

    // Image should be replaced by fallback SVG
    expect(
      screen.queryByAltText("Tushar ❤️ Sheetal's Profile")
    ).not.toBeInTheDocument();
    // Fallback SVG should be rendered
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("navigates to /browse when profile is clicked", () => {
    render(<ProfileSelector />);
    fireEvent.click(screen.getByText("Tushar ❤️ Sheetal"));
    expect(mockPush).toHaveBeenCalledWith("/browse");
  });
});
