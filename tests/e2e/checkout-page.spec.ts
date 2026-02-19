import { test, expect } from "@playwright/test";

test.describe("Checkout Page - Loading & Routing", () => {
  test.describe("Page Loading", () => {
    test("should load checkout page for valid event slug in Latvian", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      // Should show checkout title in Latvian
      await expect(
        page.getByRole("heading", { name: "Reģistrācija", level: 1 })
      ).toBeVisible();

      // Should have the event name displayed (not a dropdown)
      const eventName = page.getByTestId("event-name");
      await expect(eventName).toBeVisible();
      await expect(eventName).toHaveText("Ēģipte-Malta");
    });

    test("should load checkout page for valid event slug in English", async ({
      page,
    }) => {
      await page.goto("/en/egipte-malta/checkout");

      // Should show checkout title in English
      await expect(
        page.getByRole("heading", { name: "Registration", level: 1 })
      ).toBeVisible();

      // Should have the event name displayed (not a dropdown)
      const eventName = page.getByTestId("event-name");
      await expect(eventName).toBeVisible();
      await expect(eventName).toHaveText("Egypt-Malta");
    });

    test("should show 404 for invalid event slug", async ({
      page,
    }) => {

      const response = await page.goto("/invalid-event/checkout");

      // Should return 404 status
      expect(response?.status()).toBe(404);
    });
  });

  test.describe("Distance Parameter Handling", () => {
    test("should default to last distance option when no parameter provided", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // For Ēģipte-Malta, there are 2 distances (index 0 and 1)
      // Should default to last one (index 1)
      const distanceSelect = page.getByTestId("distance-select");
      await expect(distanceSelect).toBeVisible();
      await expect(distanceSelect).toHaveValue("1");
    });

    test("should select correct distance when valid parameter provided", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout?distance=0");

      // Should select distance at index 0
      const distanceSelect = page.getByTestId("distance-select");
      await expect(distanceSelect).toBeVisible();
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should select first distance (index 0) correctly", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout?distance=0");

      // Verify distance 0 is selected (Piedzīvojums)
      const distanceSelect = page.getByTestId('distance-select'); // Second select is distance
      await expect(distanceSelect).toHaveValue("0");

      // Verify the correct distance name is shown in dropdown (option is not visible, but selected)
      const selectedOption = distanceSelect.locator('option[value="0"]');
      await expect(selectedOption).toHaveAttribute("selected", "");
    });

    test("should fallback to last distance for invalid parameter", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout?distance=999");

      // Should fallback to last distance (index 1)
      const distanceSelect = page.getByTestId('distance-select');
      await expect(distanceSelect).toHaveValue("1");
    });

    test("should fallback to last distance for negative parameter", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout?distance=-1");

      // Should fallback to last distance (index 1)
      const distanceSelect = page.getByTestId('distance-select');
      await expect(distanceSelect).toHaveValue("1");
    });

    test("should fallback to last distance for non-numeric parameter", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout?distance=abc");

      // Should fallback to last distance (index 1)
      const distanceSelect = page.getByTestId('distance-select');
      await expect(distanceSelect).toHaveValue("1");
    });
  });

  test.describe("UI Elements Presence", () => {
    test("should show back button linking to event page in Latvian", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Back button should link to event page
      const backButton = page.getByRole("link", { name: /Atpakaļ|back/i });
      await expect(backButton).toBeVisible();
      await expect(backButton).toHaveAttribute("href", "/egipte-malta");
    });

    test("should show back button linking to event page in English", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      // Back button should link to event page
      const backButton = page.getByRole("link", { name: /Atpakaļ|back/i });
      await expect(backButton).toBeVisible();
      await expect(backButton).toHaveAttribute("href", "/en/egipte-malta");
    });

  });
});
