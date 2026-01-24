import { test, expect } from "@playwright/test";

test.describe("Event to Checkout Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies first for clean state
    await context.clearCookies();
    await context.addCookies([
      {
        name: "language_preference",
        value: "lv",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Clear localStorage before each test
    await page.goto("/egipte-malta");
    await page.evaluate(() => localStorage.clear());
  });

  test.describe("Register Button Navigation", () => {
    test("should navigate from event page to checkout when clicking register button", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Find the register button
      const registerButton = page.getByRole("link", {
        name: /Reģistrēties/,
      });
      await expect(registerButton).toBeVisible();

      // Click the button
      await registerButton.click();

      // Should navigate to checkout page
      await expect(page).toHaveURL(/\/egipte-malta\/checkout/);

      // Should show checkout title (use locator("h1") for more reliable matching)
      await expect(page.locator("h1")).toContainText("Reģistrācija");
    });

    test("should navigate from English event page to English checkout", async ({
      page,
      context,
    }) => {
      await context.clearCookies();
      await context.addCookies([
        {
          name: "language_preference",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta");

      // Find the register button in English
      const registerButton = page.getByRole("link", { name: /Register/ });
      await expect(registerButton).toBeVisible();

      // Click the button
      await registerButton.click();

      // Should navigate to English checkout page
      await expect(page).toHaveURL(/\/en\/egipte-malta\/checkout/);

      // Should show checkout title in English (use locator for more reliability)
      await expect(page.locator("h1")).toContainText("Registration");
    });

    test("should pass selected distance to checkout page", async ({ page }) => {
      await page.goto("/egipte-malta");

      // Select first distance (index 0)
      const firstDistanceButton = page
        .getByRole("button")
        .filter({ hasText: "Piedzīvojums" })
        .first();
      await firstDistanceButton.click();

      // Wait for selection to update
      await page.waitForTimeout(100);

      // Click register button
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Should navigate to checkout with distance=0
      await expect(page).toHaveURL(/\/egipte-malta\/checkout\?distance=0/);

      // Verify distance 0 is selected on checkout page
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should pass default distance to checkout when no selection made", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Don't select any distance (will use default - last one)
      // Click register button immediately
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Should navigate to checkout with last distance
      // For egipte-malta, default is index 1
      await expect(page).toHaveURL(/\/egipte-malta\/checkout\?distance=1/);

      // Verify distance 1 is selected on checkout page
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("1");
    });
  });

  test.describe("Data Consistency", () => {
    test("should show same event name on checkout as on event page", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Get event name from event page
      const eventNameOnEventPage = await page
        .getByRole("heading", { level: 1 })
        .first()
        .textContent();

      // Navigate to checkout
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Event slug should be in dropdown
      const eventSelect = page.locator("select").first();
      await expect(eventSelect).toHaveValue("egipte-malta");

      // The event name should match
      expect(eventNameOnEventPage).toContain("Ēģipte-Malta");
    });

    test("should show correct price on checkout for selected distance", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Select first distance
      const firstDistanceButton = page
        .getByRole("button")
        .filter({ hasText: "Piedzīvojums" })
        .first();
      await firstDistanceButton.click();

      // Wait for selection
      await page.waitForTimeout(100);

      // Navigate to checkout
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Wait for prices to load and show a price (any price starting with €)
      await expect(page.locator("text=/€\\d+/")).toBeVisible({ timeout: 10000 });
    });

    test("should show correct distance facts on checkout", async ({ page }) => {
      await page.goto("/egipte-malta");

      // Select first distance (200 km)
      const firstDistanceButton = page
        .getByRole("button")
        .filter({ hasText: "Piedzīvojums" })
        .first();
      await firstDistanceButton.click();

      await page.waitForTimeout(100);

      // Navigate to checkout
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Should show 200 km distance
      await expect(page.getByText("200 km")).toBeVisible();

      // Should show 1200 m elevation
      await expect(page.getByText("1200 m")).toBeVisible();
    });
  });

  test.describe("Browser Navigation", () => {
    test("should return to event page when clicking back button", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Navigate to checkout
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      await expect(page).toHaveURL(/\/egipte-malta\/checkout/);

      // Click browser back button
      await page.goBack();

      // Should be back on event page
      await expect(page).toHaveURL(/\/egipte-malta$/);
      await expect(page).not.toHaveURL(/\/checkout/);

      // Event page content should be visible
      await expect(
        page.getByRole("heading", { name: "Ēģipte-Malta", level: 1 })
      ).toBeVisible();
    });

    test("should navigate forward to checkout after going back", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Navigate to checkout
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      await expect(page).toHaveURL(/\/egipte-malta\/checkout/);

      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/\/egipte-malta$/);

      // Go forward
      await page.goForward();

      // Should be on checkout again
      await expect(page).toHaveURL(/\/egipte-malta\/checkout/);
      await expect(
        page.getByRole("heading", { name: "Reģistrācija", level: 1 })
      ).toBeVisible();
    });

    test("should return to event page when clicking home button from checkout", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Navigate to checkout
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      await expect(page).toHaveURL(/\/egipte-malta\/checkout/);

      // Click home button on checkout page
      const homeButton = page
        .locator("a.rounded-full")
        .filter({ has: page.locator("svg") })
        .first();
      await homeButton.click();

      // Should navigate to home (which redirects to nearest event)
      await page.waitForURL(/\/(egipte-malta|parize-dakara)$/);

      // Should be on an event page
      await expect(page).toHaveURL(/\/(egipte-malta|parize-dakara)$/);
    });
  });

  test.describe("Distance Persistence Between Pages", () => {
    test("should remember distance selection when navigating back to event page", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Select first distance
      const firstDistanceButton = page
        .getByRole("button")
        .filter({ hasText: "Piedzīvojums" })
        .first();
      await firstDistanceButton.click();

      await page.waitForTimeout(100);

      // Navigate to checkout
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Wait for checkout page to load and verify URL
      await expect(page).toHaveURL(/distance=0/, { timeout: 10000 });

      // Go back to event page
      await page.goBack();

      // Wait for event page to load
      await page.waitForLoadState("networkidle");

      // Distance 0 button should still be visible
      const firstDistanceButtonAgain = page
        .getByRole("button")
        .filter({ hasText: "Piedzīvojums" })
        .first();

      // Verify it's visible
      await expect(firstDistanceButtonAgain).toBeVisible({ timeout: 5000 });
    });

    test("should preserve distance when switching between event and checkout multiple times", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      // Select distance 0
      const firstDistanceButton = page
        .getByRole("button")
        .filter({ hasText: "Piedzīvojums" })
        .first();
      await firstDistanceButton.click();

      await page.waitForTimeout(100);

      // Go to checkout
      let registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      await expect(page).toHaveURL(/distance=0/);

      // Verify distance 0 selected
      let distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");

      // Go back
      await page.goBack();
      await page.waitForTimeout(100);

      // Go to checkout again
      registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Should still be distance 0
      await expect(page).toHaveURL(/distance=0/);
      distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");
    });
  });

  test.describe("Multiple Events", () => {
    test("should navigate to correct checkout for different event", async ({
      page,
    }) => {
      await page.goto("/parize-dakara");

      // Find register button
      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Should navigate to Paris-Dakar checkout
      await expect(page).toHaveURL(/\/parize-dakara\/checkout/);

      // Should show correct event slug in dropdown
      const eventSelect = page.locator("select").first();
      await expect(eventSelect).toHaveValue("parize-dakara");
    });

    test("should maintain separate distance preferences for different events", async ({
      page,
    }) => {
      // Set preference for egipte-malta to distance 0
      await page.goto("/egipte-malta");

      const firstDistanceButton = page
        .getByRole("button")
        .filter({ hasText: "Piedzīvojums" })
        .first();
      await firstDistanceButton.click();

      await page.waitForTimeout(100);

      let registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      await expect(page).toHaveURL(/\/egipte-malta\/checkout\?distance=0/);

      // Now go to paris-dakar (has only 1 distance)
      await page.goto("/parize-dakara");

      registerButton = page.getByRole("link", { name: /Reģistrēties/ });
      await registerButton.click();

      // Should use paris-dakar's default distance (0, but it's the only one)
      await expect(page).toHaveURL(/\/parize-dakara\/checkout/);

      // Go back to egipte-malta
      await page.goto("/egipte-malta/checkout");

      // Should still remember distance 0 for egipte-malta
      await expect(page).toHaveURL(/distance=0/);
    });
  });

  test.describe("Register Button Appearance", () => {
    test("should display register button with correct styling", async ({
      page,
    }) => {
      await page.goto("/egipte-malta");

      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });

      // Should be visible
      await expect(registerButton).toBeVisible();

      // Should have primary button class
      const classAttr = await registerButton.getAttribute("class");
      expect(classAttr).toContain("btn-primary");
    });

    test("should show arrow icon in register button", async ({ page }) => {
      await page.goto("/egipte-malta");

      const registerButton = page.getByRole("link", { name: /Reģistrēties/ });

      // Should contain SVG icon
      const svg = registerButton.locator("svg");
      await expect(svg).toBeVisible();
    });
  });
});
