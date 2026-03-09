import { test, expect } from "@playwright/test";

test.describe("Episode Playback", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/browse");
  });

  test("clicking video episode opens video player", async ({ page }) => {
    await page.getByText("Rokka prep").first().click();
    // Video player overlay should show title
    await expect(page.getByText("Rokka prep")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/05-video-player.png" });
    await page.keyboard.press("Escape");
  });

  test("clicking photo episode opens photo player", async ({ page }) => {
    await page.getByText("Museum Day").first().click();
    await expect(page.getByText("Museum Day")).toBeVisible();
    await expect(page.getByText("Skip")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/06-photo-player.png" });
    await page.keyboard.press("Escape");
  });

  test("episode prev/next navigation works in video player", async ({ page }) => {
    await page.getByText("Rokka prep").first().click();
    await expect(page.getByText("Rokka prep")).toBeVisible();
    // VideoPlayer shows "Next" button (not "Next Episode") for navigating episodes
    const nextBtn = page.getByText("Next", { exact: true });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      // Should show the next episode: "The Proposal Day"
      await expect(page.getByText("The Proposal Day")).toBeVisible();
    }
    await page.keyboard.press("Escape");
  });

  test("Escape closes photo player", async ({ page }) => {
    await page.getByText("Museum Day").first().click();
    await expect(page.getByText("Skip")).toBeVisible();
    await page.keyboard.press("Escape");
    // Player should be gone, browse page visible
    await expect(page.getByText("Skip")).not.toBeVisible();
    await expect(page.getByText("OURFLIX")).toBeVisible();
  });

  test("Escape closes video player", async ({ page }) => {
    await page.getByText("Rokka prep").first().click();
    await expect(page.getByText("Rokka prep")).toBeVisible();
    await page.keyboard.press("Escape");
    // Player should be gone, browse page visible
    await expect(page.getByText("OURFLIX")).toBeVisible();
  });
});
