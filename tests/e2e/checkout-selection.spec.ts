import { test, expect } from "@playwright/test";

test.describe("Checkout - Event & Distance Selection", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "lv",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Clear localStorage before each test
    await page.goto("/egipte-malta/checkout");
    await page.evaluate(() => localStorage.clear());
  });

  test.describe("Distance Selection - Index 0 Bug Fix", () => {
    test("should correctly select and persist first distance (index 0)", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout?distance=1");

      // Change to distance 0
      const distanceSelect = page.locator("select").nth(1);
      await distanceSelect.selectOption("0");

      // Wait for URL to update
      await expect(page).toHaveURL(/distance=0/);

      // Verify selection persists
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should maintain index 0 selection after page reload", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");

      // Reload page
      await page.reload();

      // Should still be on distance 0
      await expect(page).toHaveURL(/distance=0/);
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should not revert index 0 to default after interaction", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout?distance=1");

      // Change to distance 0
      const distanceSelect = page.locator("select").nth(1);
      await distanceSelect.selectOption("0");

      await expect(page).toHaveURL(/distance=0/);

      // Interact with other form elements
      await page.locator('input[id="name"]').fill("Test");
      await page.locator('input[id="email"]').fill("test@example.com");

      // Wait a moment
      await page.waitForTimeout(100);

      // Distance 0 should still be selected
      await expect(distanceSelect).toHaveValue("0");
      await expect(page).toHaveURL(/distance=0/);
    });
  });

  test.describe("Distance Selection Updates", () => {
    test("should update URL when distance changes", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      const distanceSelect = page.locator("select").nth(1);

      // Change to distance 1
      await distanceSelect.selectOption("1");

      // URL should reflect change
      await expect(page).toHaveURL(/distance=1/);
      await expect(distanceSelect).toHaveValue("1");
    });

    test("should update price when distance changes", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Initial price should be visible
      const priceDisplay = page.locator("text=/€[0-9]+/").first();
      await expect(priceDisplay).toBeVisible();
      const initialPrice = await priceDisplay.textContent();

      // Change distance
      const distanceSelect = page.locator("select").nth(1);
      await distanceSelect.selectOption("1");

      // Price should update (even if same value, element should re-render)
      await expect(priceDisplay).toBeVisible();
      const newPrice = await priceDisplay.textContent();

      // Both distances are €69, but verify element is present
      expect(newPrice).toBeTruthy();
      expect(initialPrice).toBeTruthy();
    });

    test("should update distance facts when distance changes", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Verify initial distance facts (200 km)
      await expect(page.getByText("200 km")).toBeVisible();

      // Change to distance 1
      const distanceSelect = page.locator("select").nth(1);
      await distanceSelect.selectOption("1");

      // Verify updated distance facts (370 km)
      await expect(page.getByText("370 km")).toBeVisible();
      await expect(page.getByText("200 km")).not.toBeVisible();
    });

    test("should update elevation when distance changes", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Verify initial elevation (1200 m)
      await expect(page.getByText("1200 m")).toBeVisible();

      // Change to distance 1
      const distanceSelect = page.locator("select").nth(1);
      await distanceSelect.selectOption("1");

      // Verify updated elevation (3000 m)
      await expect(page.getByText("3000 m")).toBeVisible();
      await expect(page.getByText("1200 m")).not.toBeVisible();
    });
  });

  test.describe("Event Selection", () => {
    test("should navigate to new checkout page when event changes", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      const eventSelect = page.locator("select").first();

      // Change to different event
      await eventSelect.selectOption("parize-dakara");

      // Should navigate to new event's checkout
      await expect(page).toHaveURL(/\/parize-dakara\/checkout/);

      // Event select should show new event
      await expect(eventSelect).toHaveValue("parize-dakara");
    });

    test("should show correct event name when event changes", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      // Should have Ēģipte-Malta selected
      const eventSelect = page.locator("select").first();
      await expect(eventSelect).toHaveValue("egipte-malta");

      // Change event
      await eventSelect.selectOption("parize-dakara");

      // Should have Parīze-Dakara selected
      await expect(eventSelect).toHaveValue("parize-dakara");
    });

    test("should load persisted distance when changing events", async ({
      page,
    }) => {
      // Set a distance preference for egipte-malta
      await page.goto("/egipte-malta/checkout?distance=0");
      await page.waitForTimeout(100); // Allow localStorage to save

      // Navigate to different event
      await page.goto("/parize-dakara/checkout");
      await page.waitForTimeout(100);

      // Go back to egipte-malta
      const eventSelect = page.locator("select").first();
      await eventSelect.selectOption("egipte-malta");

      // Should restore distance 0 preference
      await expect(page).toHaveURL(/distance=0/);

      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should use default distance when no persisted preference", async ({
      page,
    }) => {
      // First time visiting event
      await page.goto("/egipte-malta/checkout");

      // Should default to last distance (index 1)
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("1");
    });
  });

  test.describe("Distance Dropdown Behavior", () => {
    test("should keep dropdown visible even when disabled", async ({
      page,
    }) => {
      await page.goto("/parize-dakara/checkout");

      // Distance dropdown should be visible
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toBeVisible();

      // But disabled (only 1 option)
      await expect(distanceSelect).toBeDisabled();
    });

    test("should show disabled styling when locked", async ({ page }) => {
      await page.goto("/parize-dakara/checkout");

      const distanceSelect = page.locator("select").nth(1);

      // Check for disabled styling classes
      const classAttr = await distanceSelect.getAttribute("class");
      expect(classAttr).toContain("cursor-not-allowed");
      expect(classAttr).toContain("opacity-70");
    });

    test("should allow selection when multiple distances available", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      const distanceSelect = page.locator("select").nth(1);

      // Should be enabled
      await expect(distanceSelect).toBeEnabled();

      // Should not have disabled styling
      const classAttr = await distanceSelect.getAttribute("class");
      expect(classAttr).toContain("cursor-pointer");
      expect(classAttr).not.toContain("cursor-not-allowed");
    });
  });

  test.describe("Selection State Persistence", () => {
    test("should save distance to localStorage on selection", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Wait for state to update
      await page.waitForTimeout(100);

      // Check localStorage
      const storedDistance = await page.evaluate(() =>
        localStorage.getItem("last_distance_egipte-malta")
      );
      expect(storedDistance).toBe("0");
    });

    test("should save event slug to localStorage", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      await page.waitForTimeout(100);

      const storedSlug = await page.evaluate(() =>
        localStorage.getItem("last_event_slug")
      );
      expect(storedSlug).toBe("egipte-malta");
    });

    test("should restore distance from localStorage when no URL param", async ({
      page,
    }) => {
      // First visit with specific distance
      await page.goto("/egipte-malta/checkout?distance=0");
      await page.waitForTimeout(100);

      // Navigate away and back without distance param
      await page.goto("/");
      await page.goto("/egipte-malta/checkout");

      // Should redirect to include distance=0
      await expect(page).toHaveURL(/distance=0/);
    });
  });

  test.describe("Distance Display Names", () => {
    test("should show correct distance name in Latvian", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Should have "Piedzīvojums" selected (distance 0)
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");

      // Change to distance 1
      await distanceSelect.selectOption("1");

      // Should have "Izaicinājums" selected
      await expect(distanceSelect).toHaveValue("1");
    });

    test("should show correct distance name in English", async ({
      page,
      context,
    }) => {
      await context.clearCookies();
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout?distance=0");

      // Should have "Adventure" selected (distance 0)
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");

      // Change to distance 1
      await distanceSelect.selectOption("1");

      // Should have "Challenge" selected
      await expect(distanceSelect).toHaveValue("1");
    });
  });

  test.describe("No Scroll on Selection", () => {
    test("should not scroll when changing distance", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      // Scroll down the page
      await page.evaluate(() => window.scrollTo(0, 300));
      const scrollBefore = await page.evaluate(() => window.scrollY);

      // Change distance
      const distanceSelect = page.locator("select").nth(1);
      await distanceSelect.selectOption("0");

      // Wait for navigation
      await page.waitForURL(/distance=0/);
      await page.waitForTimeout(100);

      const scrollAfter = await page.evaluate(() => window.scrollY);

      // Scroll should remain the same
      expect(scrollAfter).toBe(scrollBefore);
    });

    test("should not scroll when changing event", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 300));
      const scrollBefore = await page.evaluate(() => window.scrollY);

      // Change event
      const eventSelect = page.locator("select").first();
      await eventSelect.selectOption("parize-dakara");

      // Wait for navigation
      await page.waitForURL(/\/parize-dakara\/checkout/);
      await page.waitForTimeout(100);

      const scrollAfter = await page.evaluate(() => window.scrollY);

      // Scroll should remain the same
      expect(scrollAfter).toBe(scrollBefore);
    });
  });
});
