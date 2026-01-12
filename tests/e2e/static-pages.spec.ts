import { test, expect } from "@playwright/test";

test.describe("Static Pages Navigation", () => {
  test.describe("Footer Links", () => {
    test("should navigate to Latvian privacy policy from Latvian event page", async ({
      page,
      context,
    }) => {
      // Set Latvian locale cookie
      await context.addCookies([
        {
          name: "PARAGLIDE_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);
      await page.goto("/egipte-malta");

      // Click privacy policy link in footer
      const privacyLink = page.locator('a[href="/privatuma-politika"]');
      await expect(privacyLink).toBeVisible();
      await privacyLink.click();

      // Should be on Latvian privacy policy page
      await page.waitForURL("/privatuma-politika");
      expect(page.url()).toMatch(/\/privatuma-politika$/);

      // Check page title is in Latvian
      await expect(page.locator("h1")).toContainText("Privātuma politika");
    });

    test("should navigate to English privacy policy from English event page", async ({
      page,
    }) => {
      await page.goto("/en/egipte-malta");

      // Click privacy policy link in footer
      const privacyLink = page.locator('a[href="/en/privatuma-politika"]');
      await expect(privacyLink).toBeVisible();
      await privacyLink.click();

      // Should be on English privacy policy page
      await page.waitForURL("/en/privatuma-politika");
      expect(page.url()).toMatch(/\/en\/privatuma-politika$/);

      // Check page title is in English
      await expect(page.locator("h1")).toContainText("Privacy Policy");
    });

    test("should navigate to Latvian terms from Latvian event page", async ({
      page,
      context,
    }) => {
      // Set Latvian locale cookie
      await context.addCookies([
        {
          name: "PARAGLIDE_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);
      await page.goto("/egipte-malta");

      // Click terms link in footer
      const termsLink = page.locator('a[href="/noteikumi"]');
      await expect(termsLink).toBeVisible();
      await termsLink.click();

      // Should be on Latvian terms page
      await page.waitForURL("/noteikumi");
      expect(page.url()).toMatch(/\/noteikumi$/);

      // Check page title is in Latvian
      await expect(page.locator("h1")).toContainText("Noteikumi");
    });

    test("should navigate to English terms from English event page", async ({
      page,
    }) => {
      await page.goto("/en/egipte-malta");

      // Click terms link in footer
      const termsLink = page.locator('a[href="/en/noteikumi"]');
      await expect(termsLink).toBeVisible();
      await termsLink.click();

      // Should be on English terms page
      await page.waitForURL("/en/noteikumi");
      expect(page.url()).toMatch(/\/en\/noteikumi$/);

      // Check page title is in English
      await expect(page.locator("h1")).toContainText("Terms");
    });
  });

  test.describe("Privacy Policy Page", () => {
    test("should have back button that links to Latvian home from /privatuma-politika", async ({
      page,
      context,
    }) => {
      // Set Latvian locale cookie to ensure proper routing
      await context.addCookies([
        {
          name: "PARAGLIDE_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);
      await page.goto("/privatuma-politika");

      // Find the back button (circular button with arrow SVG at top of page)
      const backButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await expect(backButton).toBeVisible();

      // Check it links to home
      await expect(backButton).toHaveAttribute("href", "/");
    });

    test("should have back button that links to English home from /en/privatuma-politika", async ({
      page,
    }) => {
      await page.goto("/en/privatuma-politika");

      // Find the back button
      const backButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await expect(backButton).toBeVisible();

      // Check it links to English home
      await expect(backButton).toHaveAttribute("href", "/en");
    });

    test("should navigate to correct locale home when clicked (Latvian)", async ({
      page,
      context,
    }) => {
      // Set Latvian locale cookie
      await context.addCookies([
        {
          name: "PARAGLIDE_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);
      await page.goto("/privatuma-politika");

      // Click the back button
      const backButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await backButton.click();

      // Should be on home page and stay in Latvian
      await page.waitForURL(/\/(egipte-malta|parize-dakara)$/);
      expect(page.url()).toMatch(/\/(egipte-malta|parize-dakara)$/);
    });

    test("should navigate to correct locale home when clicked (English)", async ({
      page,
    }) => {
      await page.goto("/en/privatuma-politika");

      // Click the back button
      const backButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await backButton.click();

      // Should be on English home page
      await page.waitForURL(/\/en\/(egipte-malta|parize-dakara)$/);
      expect(page.url()).toMatch(/\/en\/(egipte-malta|parize-dakara)$/);
    });
  });

  test.describe("Terms Page", () => {
    test("should have back button that links to Latvian home from /noteikumi", async ({
      page,
      context,
    }) => {
      // Set Latvian locale cookie
      await context.addCookies([
        {
          name: "PARAGLIDE_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);
      await page.goto("/noteikumi");

      // Find the back button
      const backButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await expect(backButton).toBeVisible();

      // Check it links to home
      await expect(backButton).toHaveAttribute("href", "/");
    });

    test("should have back button that links to English home from /en/noteikumi", async ({
      page,
    }) => {
      await page.goto("/en/noteikumi");

      // Find the back button
      const backButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await expect(backButton).toBeVisible();

      // Check it links to English home
      await expect(backButton).toHaveAttribute("href", "/en");
    });

    test("should navigate to correct locale home when clicked (Latvian)", async ({
      page,
      context,
    }) => {
      // Set Latvian locale cookie
      await context.addCookies([
        {
          name: "PARAGLIDE_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);
      await page.goto("/noteikumi");

      // Click the back button
      const backButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await backButton.click();

      // Should be on home page and stay in Latvian
      await page.waitForURL(/\/(egipte-malta|parize-dakara)$/);
      expect(page.url()).toMatch(/\/(egipte-malta|parize-dakara)$/);
    });

    test("should navigate to correct locale home when clicked (English)", async ({
      page,
    }) => {
      await page.goto("/en/noteikumi");

      // Click the back button
      const backButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await backButton.click();

      // Should be on English home page
      await page.waitForURL(/\/en\/(egipte-malta|parize-dakara)$/);
      expect(page.url()).toMatch(/\/en\/(egipte-malta|parize-dakara)$/);
    });
  });
});
