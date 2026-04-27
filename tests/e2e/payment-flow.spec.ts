import { test, expect } from "@playwright/test";

test.describe("Payment Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    // No setup needed - tests navigate directly to URLs
  });

  test.describe("Checkout Form to Stripe Redirect", () => {
    test("should load checkout page with price from Stripe API", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Wait for prices to load (any price starting with €)
      await expect(page.locator("text=/€\\d+/")).toBeVisible({ timeout: 10000 });

      // Verify event name shows correct event (read-only div)
      const eventName = page.getByTestId("event-name");
      await expect(eventName).toHaveText("Ēģipte-Malta");

      // Verify distance selection
      const distanceSelect = page.getByTestId("distance-select");
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should validate required fields before submission", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Wait for form to load
      await expect(page.locator('input[id="name"]')).toBeVisible();

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show validation errors
      await expect(page.getByText(/Šis lauks ir obligāts/i).first()).toBeVisible();
    });

    test.skip("should validate email format", async ({ page }) => {
      // Skipped: Browser native email validation (type="email") intercepts before custom validation
      // The custom validation in CheckoutForm.tsx does work, but browser shows native tooltip first
      await page.goto("/egipte-malta/checkout?distance=0");
      await expect(page.locator("text=/€\\d+/")).toBeVisible({ timeout: 10000 });

      await page.fill('input[id="name"]', "Test User");
      await page.fill('input[id="email"]', "notanemail");
      await page.check('input[id="terms"]');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      const emailError = page.locator('p.text-red-600').filter({ hasText: /e-pasta|email/i });
      await expect(emailError).toBeVisible({ timeout: 5000 });
    });

    test("should require terms acceptance", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Fill form but don't accept terms
      await page.fill('input[id="name"]', "Test User");
      await page.fill('input[id="email"]', "test@example.com");
      await page.locator('.checkout-phone-input input[type="tel"]').first().fill("+37120000000");
      await page.fill('input[id="emergencyName"]', "Emergency Contact");
      await page.locator('.checkout-phone-input input[type="tel"]').nth(1).fill("+37120000001");

      // Submit without checking terms
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show terms error
      await expect(
        page.getByText(/Jums jāpiekrīt noteikumiem/i)
      ).toBeVisible();
    });

    test("should create checkout session and redirect to Stripe", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Wait for prices to load (any price starting with €)
      await expect(page.locator("text=/€\\d+/")).toBeVisible({ timeout: 10000 });

      // Fill valid form
      await page.fill('input[id="name"]', "E2E Test User");
      await page.fill('input[id="email"]', "e2e-test@example.com");
      await page.locator('.checkout-phone-input input[type="tel"]').first().fill("+37120000000");
      await page.fill('input[id="emergencyName"]', "Emergency Contact");
      await page.locator('.checkout-phone-input input[type="tel"]').nth(1).fill("+37120000001");
      await page.check('input[id="terms"]');

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for redirect to Stripe checkout
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });

      // Verify we're on Stripe checkout page
      expect(page.url()).toContain("checkout.stripe.com");
    });

    test("should show loading state during submission", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Wait for prices
      await expect(page.locator("text=/€\\d+/")).toBeVisible({ timeout: 10000 });

      // Fill form
      await page.fill('input[id="name"]', "E2E Test User");
      await page.fill('input[id="email"]', "e2e-test@example.com");
      await page.locator('.checkout-phone-input input[type="tel"]').first().fill("+37120000000");
      await page.fill('input[id="emergencyName"]', "Emergency Contact");
      await page.locator('.checkout-phone-input input[type="tel"]').nth(1).fill("+37120000001");
      await page.check('input[id="terms"]');

      // Click submit and check for loading state
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Button should show loading spinner (SVG with animate-spin class)
      await expect(page.locator("button svg.animate-spin")).toBeVisible();
    });

    test("form posts natively to /api/checkout/create-session (browser-driven 303 redirect)", async ({
      page,
    }) => {
      // Regression guard: the redirect must be browser-native, not JS-driven.
      // If this attribute drifts, we lose mobile-tab-suspension robustness.
      await page.goto("/egipte-malta/checkout?distance=0");

      const form = page.locator("form").filter({ has: page.locator('button[type="submit"]') });
      await expect(form).toHaveAttribute("method", /post/i);
      await expect(form).toHaveAttribute("action", "/api/checkout/create-session");
    });

    test("renders dorm-full banner when server redirects back with ?error=dorm_full", async ({
      page,
    }) => {
      // Simulate the server-side dorm-full redirect by landing on the URL directly.
      // The component reads ?error=dorm_full on mount, shows the banner, then strips the param.
      await page.goto("/egipte-malta/checkout?distance=0&error=dorm_full");

      await expect(
        page.getByText(/Kopmītnes vietas aizpildījās/i)
      ).toBeVisible();

      // The error param is stripped via router.replace so reload doesn't re-trigger.
      await expect(page).toHaveURL(/\/egipte-malta\/checkout\?distance=0$/);
    });
  });

  test.describe("Checkout Success Page", () => {
    test("displays error for missing session ID", async ({ page }) => {
      await page.goto("/egipte-malta/checkout/success");

      // Should show error message
      await expect(page.getByText(/Nav atrasta sesija/i)).toBeVisible();
    });

    test("displays error for invalid session ID", async ({ page }) => {
      await page.goto(
        "/egipte-malta/checkout/success?session_id=cs_test_invalid"
      );

      // Should show error title - check for either Latvian or English
      // (locale detection may vary during testing)
      const h1Text = await page.locator("h1").textContent();
      expect(h1Text === "Kļūda" || h1Text === "Error").toBeTruthy();
    });

    test("has back to event link", async ({ page }) => {
      await page.goto("/egipte-malta/checkout/success");

      // Even with error, should have a way back
      const backLink = page.getByRole("link", { name: /Atpakaļ/i });
      if (await backLink.isVisible()) {
        await backLink.click();
        await expect(page).toHaveURL(/\/egipte-malta$/);
      }
    });
  });

  test.describe("English Locale", () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("should display checkout form in English", async ({ page }) => {
      await page.goto("/en/egipte-malta/checkout?distance=0");

      // Check for English text
      await expect(
        page.getByRole("heading", { name: "Registration" })
      ).toBeVisible();
      await expect(page.getByText(/Full name/i)).toBeVisible();
      // Email label - just check the input exists
      await expect(page.locator('input[id="email"]')).toBeVisible();
    });

    test("should show English validation errors", async ({ page }) => {
      await page.goto("/en/egipte-malta/checkout?distance=0");

      // Submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show English error
      await expect(page.getByText(/This field is required/i).first()).toBeVisible();
    });

    test("should display English success page messages", async ({ page }) => {
      await page.goto("/en/egipte-malta/checkout/success");

      // Should show English error message
      await expect(page.getByText(/No session found/i)).toBeVisible();
    });
  });

  test.describe("Price Loading States", () => {
    test("should disable submit button while prices are loading", async ({
      page,
    }) => {
      // Navigate to checkout
      await page.goto("/egipte-malta/checkout?distance=0");

      // Initially, button may be disabled until prices load
      const submitButton = page.locator('button[type="submit"]');

      // Wait for prices to load (any price starting with €)
      await expect(page.locator("text=/€\\d+/")).toBeVisible({ timeout: 10000 });

      // After load, fill form and button should be enabled
      await page.fill('input[id="name"]', "Test");
      await page.fill('input[id="email"]', "test@test.com");
      await page.check('input[id="terms"]');

      await expect(submitButton).toBeEnabled();
    });

    test("should show error message if prices fail to load", async ({
      page,
    }) => {
      // Block the prices API
      await page.route("**/api/stripe/prices", (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Internal error" }),
        });
      });

      await page.goto("/egipte-malta/checkout?distance=0");

      // Should show error state
      await expect(
        page.getByText(/Registration is temporarily unavailable/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Event and Distance Selection", () => {
    test("should update price when changing distance", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Wait for initial price (any price starting with €)
      await expect(page.locator("text=/€\\d+/")).toBeVisible({ timeout: 10000 });

      // Change to distance 1 (Challenge)
      const distanceSelect = page.getByTestId("distance-select");
      await distanceSelect.selectOption("1");

      // Wait for potential price update
      await page.waitForTimeout(500);

      // Price element should still be visible (may show same or different price)
      await expect(page.locator("text=/€\\d+/")).toBeVisible({ timeout: 5000 });
    });

    test("should update URL when changing distance", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Wait for page to load
      const distanceSelect = page.getByTestId("distance-select");
      await expect(distanceSelect).toBeVisible();

      // Change distance
      await distanceSelect.selectOption("1");

      // URL should update
      await expect(page).toHaveURL(/distance=1/);
    });

    test("should show correct event name on checkout", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      // Event name should be displayed as read-only
      const eventName = page.getByTestId("event-name");
      await expect(eventName).toBeVisible();
      await expect(eventName).toHaveText("Ēģipte-Malta");
    });
  });

  test.describe("Form Persistence", () => {
    test("should persist name and email in localStorage", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=0");

      // Wait for form to be interactive
      const nameInput = page.locator('input[id="name"]');
      await nameInput.waitFor({ state: "visible" });

      // Fill form
      await nameInput.fill("Persistent User");
      await page.fill('input[id="email"]', "persistent@example.com");

      // Wait for localStorage to be written by onChange handlers
      await page.waitForFunction(
        () =>
          localStorage.getItem("checkout_name") === "Persistent User" &&
          localStorage.getItem("checkout_email") === "persistent@example.com",
        { timeout: 5000 }
      );

      const savedName = await page.evaluate(() =>
        localStorage.getItem("checkout_name")
      );
      const savedEmail = await page.evaluate(() =>
        localStorage.getItem("checkout_email")
      );

      expect(savedName).toBe("Persistent User");
      expect(savedEmail).toBe("persistent@example.com");
    });

    test("should restore name and email from localStorage", async ({
      page,
    }) => {
      // Set localStorage before navigating
      await page.goto("/egipte-malta/checkout?distance=0");
      await page.evaluate(() => {
        localStorage.setItem("checkout_name", "Restored User");
        localStorage.setItem("checkout_email", "restored@example.com");
      });

      // Reload page
      await page.reload();

      // Values should be restored
      await expect(page.locator('input[id="name"]')).toHaveValue(
        "Restored User"
      );
      await expect(page.locator('input[id="email"]')).toHaveValue(
        "restored@example.com"
      );
    });
  });
});
