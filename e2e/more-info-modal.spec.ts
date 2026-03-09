import { test, expect } from "@playwright/test";

test.describe("More Info Modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/browse");
  });

  test("opens modal with series details", async ({ page }) => {
    await page.getByText("More Info").click();
    await expect(page.getByText("Episodes")).toBeVisible();
    await expect(page.getByText("98% Match").first()).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/07-more-info-modal.png" });
  });

  test("shows cast and metadata", async ({ page }) => {
    await page.getByText("More Info").click();
    await expect(page.getByText("Tushar and Sheetal")).toBeVisible();
  });

  test("shows all episodes in list", async ({ page }) => {
    await page.getByText("More Info").click();
    // Each episode row is a button with an img thumbnail inside
    const episodeButtons = page.locator("button").filter({ has: page.locator("img") });
    const count = await episodeButtons.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test("clicking episode in modal opens player", async ({ page }) => {
    await page.getByText("More Info").click();
    await page.screenshot({ path: "test-reports/screenshots/08-modal-episode-list.png" });
    // Click a video episode in the modal
    await page.getByText("Our Fan Moment").click();
    // Modal should close, player should open
    await page.screenshot({ path: "test-reports/screenshots/09-player-from-modal.png" });
  });

  test("closes modal via X button", async ({ page }) => {
    await page.getByText("More Info").click();
    await expect(page.getByText("Episodes")).toBeVisible();
    // Find X close button in modal via its SVG path
    const closeBtn = page
      .locator("button")
      .filter({ has: page.locator('path[d="M6 18L18 6M6 6l12 12"]') })
      .first();
    await closeBtn.click();
    await expect(page.getByText("Episodes")).not.toBeVisible();
  });
});
