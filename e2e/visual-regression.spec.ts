import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("profile selector page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("profile-selector.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("browse page hero", async ({ page }) => {
    await page.goto("/browse");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("browse-hero.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("browse page content rows", async ({ page }) => {
    await page.goto("/browse");
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("browse-content-rows.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("more info modal", async ({ page }) => {
    await page.goto("/browse");
    await page.getByText("More Info").click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("more-info-modal.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("full browse page", async ({ page }) => {
    await page.goto("/browse");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("browse-full.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
