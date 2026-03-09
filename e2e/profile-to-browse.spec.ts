import { test, expect } from "@playwright/test";

test.describe("Profile Selector → Browse", () => {
  test("shows Who's watching page and navigates to browse", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Who's watching?")).toBeVisible();
    await expect(page.getByText("Tushar ❤️ Sheetal")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/01-profile-selector.png" });

    await page.getByText("Tushar ❤️ Sheetal").click();
    await page.waitForURL("/browse");

    await expect(page.getByText("NETFLIX")).toBeVisible();
    await page.screenshot({ path: "test-reports/screenshots/02-browse-page.png" });
  });
});
