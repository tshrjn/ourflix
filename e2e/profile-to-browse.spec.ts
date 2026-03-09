import { test, expect } from "@playwright/test";

test.describe("Profile Selector → Browse", () => {
  test("shows Who's watching page and navigates to browse", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Who's watching?")).toBeVisible();
    await expect(page.getByText("Tushar ❤️ Sheetal")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/01-profile-selector.png" });

    await page.getByText("Tushar ❤️ Sheetal").click();
    await page.waitForURL("/browse");

    await expect(page.getByText("OURFLIX")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/02-browse-page.png" });
  });

  test("profile avatar renders without broken image", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Avatar container should be visible
    const avatarContainer = page.locator("button >> div").first();
    await expect(avatarContainer).toBeVisible();

    // Should either show a loaded image or the SVG fallback — not a broken img
    const brokenImg = page.locator('img[alt*="Profile"]');
    const fallbackSvg = page.locator("svg");

    // Wait for image to either load or error
    await page.waitForTimeout(2000);

    const imgCount = await brokenImg.count();
    const svgCount = await fallbackSvg.count();

    // Either the image loaded successfully, or the SVG fallback rendered
    expect(imgCount + svgCount).toBeGreaterThan(0);

    // If img is present, verify it actually loaded (naturalWidth > 0)
    if (imgCount > 0) {
      const loaded = await brokenImg.evaluate(
        (img: HTMLImageElement) => img.naturalWidth > 0
      );
      if (!loaded) {
        // Image failed — SVG fallback should have replaced it
        expect(svgCount).toBeGreaterThan(0);
      }
    }
  });
});
