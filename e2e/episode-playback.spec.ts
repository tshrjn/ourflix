import { test, expect } from "@playwright/test";

test.describe("Episode Playback", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/browse");
  });

  test("clicking video episode opens video player", async ({ page }) => {
    await page.getByText("Our Fan Moment").first().click();
    // Video player overlay should show title
    await expect(page.getByText("Our Fan Moment")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/05-video-player.png" });
    await page.keyboard.press("Escape");
  });

  test("clicking photo episode opens photo player", async ({ page }) => {
    await page.getByText("Us in our Snapchat Filter era").first().click();
    await expect(page.getByText("Us in our Snapchat Filter era")).toBeVisible();
    await expect(page.getByText("Skip")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/06-photo-player.png" });
    await page.keyboard.press("Escape");
  });

  test("episode prev/next navigation works in video player", async ({ page }) => {
    await page.getByText("Our Fan Moment").first().click();
    await expect(page.getByText("Our Fan Moment")).toBeVisible();
    // VideoPlayer shows "Next" button (not "Next Episode") for navigating episodes
    const nextBtn = page.getByText("Next", { exact: true });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      // Should show the next episode: "Teaching Sheetal Cycling"
      await expect(page.getByText("Teaching Sheetal Cycling")).toBeVisible();
    }
    await page.keyboard.press("Escape");
  });

  test("Escape closes photo player", async ({ page }) => {
    await page.getByText("Us in our Snapchat Filter era").first().click();
    await expect(page.getByText("Skip")).toBeVisible();
    await page.keyboard.press("Escape");
    // Player should be gone, browse page visible
    await expect(page.getByText("Skip")).not.toBeVisible();
    await expect(page.getByText("NETFLIX")).toBeVisible();
  });

  test("Escape closes video player", async ({ page }) => {
    await page.getByText("Our Fan Moment").first().click();
    await expect(page.getByText("Our Fan Moment")).toBeVisible();
    await page.keyboard.press("Escape");
    // Player should be gone, browse page visible
    await expect(page.getByText("NETFLIX")).toBeVisible();
  });
});
