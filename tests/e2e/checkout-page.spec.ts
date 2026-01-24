import { test, expect } from "@playwright/test";

test.describe("Checkout Page - Loading & Routing", () => {
  test.describe("Page Loading", () => {
    test("should load checkout page for valid event slug in Latvian", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Should show checkout title in Latvian
      await expect(
        page.getByRole("heading", { name: "Reģistrācija", level: 1 })
      ).toBeVisible();

      // Should have the event selection dropdown
      const eventSelect = page.locator("select").first();
      await expect(eventSelect).toBeVisible();
      await expect(eventSelect).toHaveValue("egipte-malta");
    });

    test("should load checkout page for valid event slug in English", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout");

      // Should show checkout title in English
      await expect(
        page.getByRole("heading", { name: "Registration", level: 1 })
      ).toBeVisible();

      // Should have the event selection dropdown
      const eventSelect = page.locator("select").first();
      await expect(eventSelect).toBeVisible();
      await expect(eventSelect).toHaveValue("egipte-malta");
    });

    test("should show 404 for invalid event slug", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      const response = await page.goto("/invalid-event/checkout");

      // Should return 404 status
      expect(response?.status()).toBe(404);
    });
  });

  test.describe("Distance Parameter Handling", () => {
    test("should default to last distance option when no parameter provided", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // For Ēģipte-Malta, there are 2 distances (index 0 and 1)
      // Should default to last one (index 1)
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toBeVisible();
      await expect(distanceSelect).toHaveValue("1");
    });

    test("should select correct distance when valid parameter provided", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout?distance=0");

      // Should select distance at index 0
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toBeVisible();
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should select first distance (index 0) correctly", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout?distance=0");

      // Verify distance 0 is selected (Piedzīvojums)
      const distanceSelect = page.locator('select').nth(1); // Second select is distance
      await expect(distanceSelect).toHaveValue("0");

      // Verify the correct distance name is shown in dropdown (option is not visible, but selected)
      const selectedOption = distanceSelect.locator('option[value="0"]');
      await expect(selectedOption).toHaveAttribute("selected", "");
    });

    test("should fallback to last distance for invalid parameter", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout?distance=999");

      // Should fallback to last distance (index 1)
      const distanceSelect = page.locator('select').nth(1);
      await expect(distanceSelect).toHaveValue("1");
    });

    test("should fallback to last distance for negative parameter", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout?distance=-1");

      // Should fallback to last distance (index 1)
      const distanceSelect = page.locator('select').nth(1);
      await expect(distanceSelect).toHaveValue("1");
    });

    test("should fallback to last distance for non-numeric parameter", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout?distance=abc");

      // Should fallback to last distance (index 1)
      const distanceSelect = page.locator('select').nth(1);
      await expect(distanceSelect).toHaveValue("1");
    });
  });

  test.describe("Distance Persistence Across Languages", () => {
    test("should preserve distance parameter when switching to English", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout?distance=0");

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Should preserve distance parameter
      await expect(page).toHaveURL(/\/en\/egipte-malta\/checkout\?distance=0/);

      // Verify distance is still 0
      const distanceSelect = page.locator('select').nth(1);
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should preserve distance parameter when switching to Latvian", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout?distance=0");

      // Wait for page to load
      await page.waitForTimeout(200);

      // Switch to Latvian
      await page.getByRole("button", { name: "LV", exact: true }).click();

      // Wait for navigation
      await page.waitForURL(/\/egipte-malta\/checkout/, { timeout: 10000 });
      await expect(page).not.toHaveURL(/\/lv\//);
      await page.waitForTimeout(200);

      // Should eventually have distance=0
      await page.waitForURL(/distance=0/, { timeout: 5000 });

      // Verify distance is still 0
      const distanceSelect = page.locator('select').nth(1);
      await expect(distanceSelect).toHaveValue("0");
    });
  });

  test.describe("UI Elements Presence", () => {
    test("should show home button linking to correct locale", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Home button should link to Latvian home
      const homeButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await expect(homeButton).toBeVisible();
      await expect(homeButton).toHaveAttribute("href", "/");
    });

    test("should show home button linking to English home", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "language_preference",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout");

      // Home button should link to English home
      const homeButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await expect(homeButton).toBeVisible();
      await expect(homeButton).toHaveAttribute("href", "/en");
    });

  });
});
