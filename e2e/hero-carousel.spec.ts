import { test, expect } from "@playwright/test";

test.describe("Hero Carousel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/browse");
  });

  test("displays series info with metadata", async ({ page }) => {
    await expect(page.getByText("98% Match").first()).toBeVisible();
    await expect(page.getByText("Play").first()).toBeVisible();
    await expect(page.getByText("More Info")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/03-hero-carousel.png" });
  });

  test("navigates between series with arrows", async ({ page }) => {
    const firstTitle = await page.locator("h1").first().textContent();
    // Find and click the right arrow button via its SVG path
    const rightArrow = page.locator("button").filter({
      has: page.locator('path[d="M9 5l7 7-7 7"]'),
    });
    await rightArrow.click();
    const secondTitle = await page.locator("h1").first().textContent();
    expect(secondTitle).not.toBe(firstTitle);
    await page.screenshot({ path: "test-reports/screenshots/04-hero-after-arrow.png" });
  });

  test("auto-advances after ~8 seconds", async ({ page }) => {
    const firstTitle = await page.locator("h1").first().textContent();
    await page.waitForTimeout(8500);
    const nextTitle = await page.locator("h1").first().textContent();
    expect(nextTitle).not.toBe(firstTitle);
  });
});
