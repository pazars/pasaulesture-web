import { test, expect } from "@playwright/test";

test.describe("Static Pages Navigation", () => {
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
