import { test } from "@playwright/test";

test.describe("Reference Comparison Screenshots", () => {
  test.describe("Clone screenshots", () => {
    test("profile page", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: "test-reports/screenshots/clone-01-profile.png" });
    });

    test("browse page hero", async ({ page }) => {
      await page.goto("/browse");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: "test-reports/screenshots/clone-02-browse-hero.png" });
    });

    test("content rows", async ({ page }) => {
      await page.goto("/browse");
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-reports/screenshots/clone-03-content-rows.png" });
    });

    test("full browse page", async ({ page }) => {
      await page.goto("/browse");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: "test-reports/screenshots/clone-04-browse-full.png",
        fullPage: true,
      });
    });
  });

  test.describe("Reference site screenshots", () => {
    test("profile page", async ({ page }) => {
      await page.goto("https://app.kahaania.com/akhil-anushka-journey");
      await page.waitForTimeout(3000);
      await page.screenshot({ path: "test-reports/screenshots/ref-01-profile.png" });
    });

    test("browse page", async ({ page }) => {
      await page.goto("https://app.kahaania.com/akhil-anushka-journey");
      await page.waitForTimeout(3000);
      const profileButton = page.locator("button").first();
      await profileButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: "test-reports/screenshots/ref-02-browse.png" });
    });

    test("full browse page", async ({ page }) => {
      await page.goto("https://app.kahaania.com/akhil-anushka-journey");
      await page.waitForTimeout(3000);
      const profileButton = page.locator("button").first();
      await profileButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: "test-reports/screenshots/ref-03-browse-full.png",
        fullPage: true,
      });
    });
  });
});
