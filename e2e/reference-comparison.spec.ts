import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const SCREENSHOT_DIR = "test-reports/screenshots";
const REF_URL = "https://app.kahaania.com/akhil-anushka-journey";

test.setTimeout(120_000);

test.beforeAll(() => {
  fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
});

/**
 * Extract computed CSS values from key UI elements.
 */
async function extractCssReport(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const cs = (el: Element | null) =>
      el ? window.getComputedStyle(el) : null;

    const heading = document.querySelector("h2");
    const headingStyles = cs(heading);

    const cardContainer = heading?.parentElement?.querySelector(
      'div[class*="flex"]'
    );
    const containerStyles = cs(cardContainer);

    const firstCard = cardContainer?.querySelector("button");
    const cardStyles = cs(firstCard);

    const cardImageContainer = firstCard?.querySelector("div");
    const imageContainerStyles = cs(cardImageContainer);

    const hasGradientOverlay = Array.from(
      cardImageContainer?.children ?? []
    ).some((child) => {
      const bg = window.getComputedStyle(child).backgroundImage;
      return bg && bg.includes("gradient");
    });

    // Find tag element
    const allEls = firstCard?.querySelectorAll("p, span") ?? [];
    let tagEl: Element | null = null;
    for (const el of allEls) {
      const text = el.textContent?.trim() ?? "";
      if (
        text.match(
          /^(100% Match|Hero|New Season|Action|Drama|Nostalgia|New Character|Guest Star)/i
        )
      ) {
        tagEl = el;
        break;
      }
    }
    const tagStyles = cs(tagEl);

    const section = heading?.closest("section") ?? heading?.parentElement;
    const sectionStyles = cs(section);

    return {
      heading: {
        fontFamily: headingStyles?.fontFamily ?? "",
        fontSize: headingStyles?.fontSize ?? "",
        fontWeight: headingStyles?.fontWeight ?? "",
        marginBottom: headingStyles?.marginBottom ?? "",
      },
      cardContainer: {
        gap: containerStyles?.gap ?? "",
        paddingLeft: containerStyles?.paddingLeft ?? "",
        paddingRight: containerStyles?.paddingRight ?? "",
      },
      card: { width: cardStyles?.width ?? "" },
      cardImageContainer: {
        aspectRatio: imageContainerStyles?.aspectRatio ?? "",
        borderRadius: imageContainerStyles?.borderRadius ?? "",
        hasGradientOverlay,
      },
      cardTag: {
        color: tagStyles?.color ?? "",
        fontSize: tagStyles?.fontSize ?? "",
        fontWeight: tagStyles?.fontWeight ?? "",
        backgroundColor: tagStyles?.backgroundColor ?? "",
        position: tagStyles?.position ?? "",
        tagText: tagEl?.textContent?.trim() ?? "",
      },
      section: {
        paddingTop: sectionStyles?.paddingTop ?? "",
        paddingBottom: sectionStyles?.paddingBottom ?? "",
        paddingLeft: sectionStyles?.paddingLeft ?? "",
        paddingRight: sectionStyles?.paddingRight ?? "",
      },
    };
  });
}

// ============================================================
// Clone — single test, navigate once, capture all screenshots
// ============================================================
test("Clone - all screenshots + CSS", async ({ page }) => {
  // 01 - Profile page
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/clone-01-profile-page.png`,
  });

  // Navigate to browse once
  await page.goto("/browse");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(5000); // Wait for Mux tokens + images

  // 02 - Browse hero
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/clone-02-browse-hero.png`,
  });

  // 03 - Navbar
  const nav = page.locator("nav");
  await nav.screenshot({ path: `${SCREENSHOT_DIR}/clone-03-navbar.png` });

  // 04 - Hero metadata
  const heroContent = page.locator("h1").first().locator("..").locator("..");
  await heroContent.screenshot({
    path: `${SCREENSHOT_DIR}/clone-04-hero-metadata.png`,
  });

  // 05 - Content row 1
  const section1 = page.locator("section").first();
  await section1.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await section1.screenshot({
    path: `${SCREENSHOT_DIR}/clone-05-content-row-1.png`,
  });

  // 06 - Content row 2
  const section2 = page.locator("section").nth(1);
  await section2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await section2.screenshot({
    path: `${SCREENSHOT_DIR}/clone-06-content-row-2.png`,
  });

  // 07 - Content row 3
  const section3 = page.locator("section").nth(2);
  const hasSection3 = (await section3.count()) > 0;
  if (hasSection3) {
    await section3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await section3.screenshot({
      path: `${SCREENSHOT_DIR}/clone-07-content-row-3.png`,
    });
  }

  // 08 - Episode card close-up
  const firstCard = page.locator("section").first().locator("button").first();
  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await firstCard.screenshot({
    path: `${SCREENSHOT_DIR}/clone-08-episode-card.png`,
  });

  // CSS report (before opening modal)
  await page.locator("section").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const report = await extractCssReport(page);
  fs.writeFileSync(
    path.resolve(`${SCREENSHOT_DIR}/clone-css-report.json`),
    JSON.stringify(report, null, 2)
  );

  // 10 - Full page (before modal)
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/clone-10-full-page.png`,
    fullPage: true,
  });

  // 09 - More Info modal (last — modal stays open, no need to close)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.getByText("More Info").click();
  await page.waitForTimeout(1500);
  const modal = page.locator('[class*="fixed"][class*="z-50"]');
  await modal.screenshot({
    path: `${SCREENSHOT_DIR}/clone-09-more-info-modal.png`,
  });
});

// ============================================================
// Reference — single test, navigate once, capture all screenshots
// ============================================================
test("Reference - all screenshots + CSS", async ({ page }) => {
  // 01 - Profile page
  await page.goto(REF_URL);
  await page.waitForTimeout(4000);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/ref-01-profile-page.png`,
  });

  // Click profile to enter browse
  const profileButton = page.locator("button").first();
  await profileButton.click();
  await page.waitForTimeout(6000);

  // 02 - Browse hero
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/ref-02-browse-hero.png`,
  });

  // 03 - Navbar
  const nav = page.locator("nav");
  await nav.screenshot({ path: `${SCREENSHOT_DIR}/ref-03-navbar.png` });

  // 04 - Hero metadata
  const heroContent = page.locator("h1").first().locator("..").locator("..");
  await heroContent.screenshot({
    path: `${SCREENSHOT_DIR}/ref-04-hero-metadata.png`,
  });

  // 05 - Content row 1
  const section1 = page.locator("section").first();
  await section1.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await section1.screenshot({
    path: `${SCREENSHOT_DIR}/ref-05-content-row-1.png`,
  });

  // 06 - Content row 2
  const section2 = page.locator("section").nth(1);
  await section2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await section2.screenshot({
    path: `${SCREENSHOT_DIR}/ref-06-content-row-2.png`,
  });

  // 07 - Content row 3
  const section3 = page.locator("section").nth(2);
  const hasSection3 = (await section3.count()) > 0;
  if (hasSection3) {
    await section3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await section3.screenshot({
      path: `${SCREENSHOT_DIR}/ref-07-content-row-3.png`,
    });
  }

  // 08 - Episode card close-up
  const firstCard = page.locator("section").first().locator("button").first();
  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await firstCard.screenshot({
    path: `${SCREENSHOT_DIR}/ref-08-episode-card.png`,
  });

  // CSS report (before modal)
  await page.locator("section").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const report = await extractCssReport(page);
  fs.writeFileSync(
    path.resolve(`${SCREENSHOT_DIR}/ref-css-report.json`),
    JSON.stringify(report, null, 2)
  );

  // 10 - Full page (before modal)
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/ref-10-full-page.png`,
    fullPage: true,
  });

  // 09 - More Info modal (last)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.getByText("More Info").click();
  await page.waitForTimeout(2000);
  // Reference site may have multiple fixed z-50 elements; take the last (content modal)
  const modal = page.locator('[class*="fixed"][class*="z-50"]').last();
  await modal.screenshot({
    path: `${SCREENSHOT_DIR}/ref-09-more-info-modal.png`,
  });
});
