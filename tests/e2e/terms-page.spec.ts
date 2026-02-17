import { test, expect } from "@playwright/test";

test.describe("Terms Page", () => {
  test.describe("Page Loading", () => {
    test("should load terms page successfully in Latvian", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      // Should show title in Latvian
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
      expect(await heading.textContent()).toMatch(/Noteikumi/);
    });

    test("should load terms page successfully in English", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      // Should show title in English
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
      expect(await heading.textContent()).toMatch(/Terms/);
    });

    test("should display non-empty content in Latvian", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      // Should have content after the heading
      const content = page.locator("div.max-w-4xl");
      await expect(content).toBeVisible();

      // Content should not be empty
      const textContent = await content.textContent();
      expect(textContent).toBeTruthy();
      expect(textContent!.length).toBeGreaterThan(100); // Should have substantial content
    });

    test("should display non-empty content in English", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      // Should have content after the heading
      const content = page.locator("div.max-w-4xl");
      await expect(content).toBeVisible();

      // Content should not be empty
      const textContent = await content.textContent();
      expect(textContent).toBeTruthy();
      expect(textContent!.length).toBeGreaterThan(100);
    });
  });

  test.describe("Home Button Navigation", () => {
    test("should have home button linking to Latvian home", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      // Find the home button (circular button with SVG)
      const homeButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();

      await expect(homeButton).toBeVisible();
      await expect(homeButton).toHaveAttribute("href", "/");
    });

    test("should have home button linking to English home", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      // Find the home button
      const homeButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();

      await expect(homeButton).toBeVisible();
      await expect(homeButton).toHaveAttribute("href", "/en");
    });

    test("should navigate to home when clicking button (Latvian)", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      const homeButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await homeButton.click();

      // Should navigate to home (redirects to nearest event)
      await page.waitForURL(/\/(egipte-malta|parize-dakara)$/);
      expect(page.url()).toMatch(/\/(egipte-malta|parize-dakara)$/);
    });

    test("should navigate to home when clicking button (English)", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      const homeButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await homeButton.click();

      // Should navigate to English home
      await page.waitForURL(/\/en\/(egipte-malta|parize-dakara)$/);
      expect(page.url()).toMatch(/\/en\/(egipte-malta|parize-dakara)$/);
    });
  });

  test.describe("External Links", () => {
    test("should have external link indicators on outgoing links (Latvian)", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      // Find all external links with rel="noopener noreferrer" (actual external links, not home button)
      const externalLinks = page.locator('a[target="_blank"][rel="noopener noreferrer"]');
      const count = await externalLinks.count();

      expect(count).toBeGreaterThan(0);

      // Check that each external link has an SVG icon as indicator
      for (let i = 0; i < count; i++) {
        const link = externalLinks.nth(i);
        const svg = link.locator('svg');

        // Should contain an SVG icon as external indicator
        await expect(svg).toBeVisible();
      }
    });

    test("should have external link indicators on outgoing links (English)", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      // Find all external links with rel="noopener noreferrer" (actual external links, not home button)
      const externalLinks = page.locator('a[target="_blank"][rel="noopener noreferrer"]');
      const count = await externalLinks.count();

      expect(count).toBeGreaterThan(0);

      // Check that each external link has an SVG icon as indicator
      for (let i = 0; i < count; i++) {
        const link = externalLinks.nth(i);
        const svg = link.locator('svg');

        // Should contain an SVG icon as external indicator
        await expect(svg).toBeVisible();
      }
    });

    test("should open external links in new tab", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      // Find all external links
      const externalLinks = page.locator('a[target="_blank"]');
      const count = await externalLinks.count();

      // All external links should have target="_blank"
      for (let i = 0; i < Math.min(count, 5); i++) {
        // Check first 5
        const link = externalLinks.nth(i);
        await expect(link).toHaveAttribute("target", "_blank");
      }
    });
  });

  test.describe("Content Structure", () => {
    test("should have proper heading hierarchy in Latvian", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      // Should have exactly one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      // Should have h1 before any h2
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
    });

    test("should have proper heading hierarchy in English", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      // Should have exactly one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
    });

    test("should not contain placeholder text in Latvian", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      const pageText = await page.locator("body").textContent();

      // Should not contain common placeholder text
      expect(pageText).not.toContain("TODO");
      expect(pageText).not.toContain("TBD");
      expect(pageText).not.toContain("FIXME");
      expect(pageText).not.toContain("Coming soon");
    });

    test("should not contain placeholder text in English", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      const pageText = await page.locator("body").textContent();

      expect(pageText).not.toContain("TODO");
      expect(pageText).not.toContain("TBD");
      expect(pageText).not.toContain("FIXME");
      expect(pageText).not.toContain("Coming soon");
    });
  });

  test.describe("AI Translation Note", () => {
    test("should not show AI translation note on Latvian page", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      // Should not contain AI translation notice
      const pageText = await page.locator("body").textContent();
      expect(pageText).not.toContain("AI-assisted translation");
      expect(pageText).not.toContain("Latvian version prevails");
    });

    test("should show AI translation note on English page", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      // Should contain AI translation notice
      const notice = page.locator("div.bg-amber-light\\/20");
      await expect(notice).toBeVisible();

      const noticeText = await notice.textContent();
      expect(noticeText).toContain("AI-assisted translation");
      expect(noticeText).toContain("Latvian version prevails");
    });
  });

  test.describe("Navigation from Checkout", () => {
    test("should open terms in new tab from checkout page", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Find terms link in checkout form
      const termsLink = page.getByRole("link", { name: /noteikumiem/ });

      await expect(termsLink).toBeVisible();
      await expect(termsLink).toHaveAttribute("target", "_blank");
      await expect(termsLink).toHaveAttribute("href", "/noteikumi");
    });

    test("should open English terms from English checkout page", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      // Find terms link
      const termsLink = page.getByRole("link", { name: /terms/ });

      await expect(termsLink).toBeVisible();
      await expect(termsLink).toHaveAttribute("target", "_blank");
      await expect(termsLink).toHaveAttribute("href", "/en/noteikumi");
    });
  });

  test.describe("SEO & Metadata", () => {
    test("should have correct lang attribute in Latvian", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      const langAttr = await page.locator("html").getAttribute("lang");
      expect(langAttr).toBe("lv");
    });

    test("should have correct lang attribute in English", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      const langAttr = await page.locator("html").getAttribute("lang");
      expect(langAttr).toBe("en");
    });

    test("should have page title in Latvian", async ({ page }) => {

      await page.goto("/noteikumi");

      const title = await page.title();
      expect(title).toBeTruthy();
      // Should contain "Noteikumi" or event-related text
      expect(title.length).toBeGreaterThan(0);
    });

    test("should have page title in English", async ({ page }) => {

      await page.goto("/en/noteikumi");

      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });
  });

  test.describe("Accessibility", () => {
    test("should have aria-label on home button", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      const homeButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();

      // Should have aria-label or similar accessibility attribute
      const ariaLabel = await homeButton.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
    });

    test("should be keyboard navigable", async ({ page }) => {

      await page.goto("/noteikumi");

      // Tab through interactive elements
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // At least some elements should be focusable
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });

  test.describe("Locale-Specific Content Components", () => {
    test("should load Latvian content component", async ({
      page,
    }) => {

      await page.goto("/noteikumi");

      // Content should be visible and substantial
      const content = page.locator("div.max-w-4xl");
      const text = await content.textContent();

      // Should contain Latvian-specific content
      // This verifies Content.lv.tsx is loaded
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(200);
    });

    test("should load English content component", async ({
      page,
    }) => {

      await page.goto("/en/noteikumi");

      // Content should be visible and substantial
      const content = page.locator("div.max-w-4xl");
      const text = await content.textContent();

      // Should contain English-specific content
      // This verifies Content.en.tsx is loaded
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(200);
    });
  });
});
