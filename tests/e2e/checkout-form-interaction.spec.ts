import { test, expect } from "@playwright/test";

test.describe("Checkout Form - Interaction & Validation", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/egipte-malta/checkout");
    await page.evaluate(() => localStorage.clear());
  });

  test.describe("Form Field Interaction", () => {
    test("should update name field on input", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      const nameInput = page.locator('input[id="name"]');
      await nameInput.fill("Jānis Bērziņš");

      await expect(nameInput).toHaveValue("Jānis Bērziņš");
    });

    test("should update email field on input", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      const emailInput = page.locator('input[id="email"]');
      await emailInput.fill("janis@example.com");

      await expect(emailInput).toHaveValue("janis@example.com");
    });

    test("should toggle terms checkbox on click", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      const termsCheckbox = page.locator('input[id="terms"]');

      // Initially unchecked
      await expect(termsCheckbox).not.toBeChecked();

      // Click to check
      await termsCheckbox.check();
      await expect(termsCheckbox).toBeChecked();

      // Click to uncheck
      await termsCheckbox.uncheck();
      await expect(termsCheckbox).not.toBeChecked();
    });
  });

  test.describe("Event & Distance Selection", () => {
    test("should display event name as read-only", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      // Event is now a read-only div, not a select
      const eventName = page.getByTestId("event-name");
      await expect(eventName).toBeVisible();
      await expect(eventName).toHaveText("Ēģipte-Malta");
    });

    test("should change distance selection", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=1");

      const distanceSelect = page.getByTestId("distance-select");

      // Initially should be distance 1
      await expect(distanceSelect).toHaveValue("1");

      // Change to distance 0
      await distanceSelect.selectOption("0");

      // URL should update
      await expect(page).toHaveURL(/distance=0/);

      // Distance should be selected
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should not scroll page when changing distance", async ({ page }) => {
      await page.goto("/egipte-malta/checkout?distance=1");

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 200));
      const scrollBefore = await page.evaluate(() => window.scrollY);

      // Change distance
      const distanceSelect = page.getByTestId("distance-select");
      await distanceSelect.selectOption("0");

      // Wait a bit for any potential scroll
      await page.waitForTimeout(100);

      const scrollAfter = await page.evaluate(() => window.scrollY);

      // Scroll position should remain the same
      expect(scrollAfter).toBe(scrollBefore);
    });
  });

  test.describe("Form Validation - Empty Fields", () => {
    test("should show error when submitting with empty name", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      // Fill email and accept terms but leave name empty
      await page.locator('input[id="email"]').fill("test@example.com");
      await page.locator('input[id="terms"]').check();

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Should show error message
      await expect(page.getByText("Šis lauks ir obligāts")).toBeVisible();
    });

    test("should show error when submitting with empty email", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      // Fill name and accept terms but leave email empty
      await page.locator('input[id="name"]').fill("Jānis Bērziņš");
      await page.locator('input[id="terms"]').check();

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Should show error message
      await expect(page.getByText("Šis lauks ir obligāts")).toBeVisible();
    });

    test("should show error when submitting without terms acceptance", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      // Fill name and email but don't accept terms
      await page.locator('input[id="name"]').fill("Jānis Bērziņš");
      await page.locator('input[id="email"]').fill("test@example.com");

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Should show terms error
      await expect(
        page.getByText("Jums jāpiekrīt noteikumiem")
      ).toBeVisible();
    });
  });

  test.describe("Form Validation - Invalid Email", () => {
    test("should have HTML5 email validation on email field", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      const emailInput = page.locator('input[id="email"]');

      // Verify input has type="email" for HTML5 validation
      await expect(emailInput).toHaveAttribute("type", "email");
    });
  });

  test.describe("Form Validation - Multiple Errors", () => {
    test("should show multiple errors simultaneously", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      // Submit completely empty form
      await page.locator('button[type="submit"]').click();

      // Should show all three errors
      const obligatoryErrors = page.getByText("Šis lauks ir obligāts");
      expect(await obligatoryErrors.count()).toBeGreaterThanOrEqual(2); // name and email

      await expect(
        page.getByText("Jums jāpiekrīt noteikumiem")
      ).toBeVisible();
    });

    test("should clear error when field is corrected", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      // Submit with empty name to trigger error
      await page.locator('input[id="email"]').fill("test@example.com");
      await page.locator('input[id="terms"]').check();
      await page.locator('button[type="submit"]').click();

      // Error should be visible
      await expect(page.getByText("Šis lauks ir obligāts")).toBeVisible();

      // Fill in the name
      await page.locator('input[id="name"]').fill("Jānis");

      // Error should disappear
      await expect(page.getByText("Šis lauks ir obligāts")).not.toBeVisible();
    });
  });

  test.describe("Form Submission", () => {
    test("should redirect to Stripe checkout on valid submission", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      // Fill all required fields
      await page.locator('input[id="name"]').fill("Jānis Bērziņš");
      await page.locator('input[id="email"]').fill("janis@example.com");
      await page.locator('.checkout-phone-input input[type="tel"]').first().fill("+37120000000");
      await page.locator('input[id="terms"]').check();

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Should redirect to Stripe checkout
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
      expect(page.url()).toContain("checkout.stripe.com");
    });

    test("should disable button during submission", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      // Fill all required fields
      await page.locator('input[id="name"]').fill("Jānis Bērziņš");
      await page.locator('input[id="email"]').fill("janis@example.com");
      await page.locator('.checkout-phone-input input[type="tel"]').first().fill("+37120000000");
      await page.locator('input[id="terms"]').check();

      // Click submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Button should be disabled during submission (before redirect)
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe("Terms Link", () => {
    test("should open terms page in new tab", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      const termsLink = page.getByRole("link", { name: /noteikumiem/ });

      // Link should have target="_blank"
      await expect(termsLink).toHaveAttribute("target", "_blank");

      // Link should point to terms page
      await expect(termsLink).toHaveAttribute("href", "/noteikumi");
    });

    test("should have external link indicator icon", async ({ page }) => {
      await page.goto("/egipte-malta/checkout");

      const termsLink = page.getByRole("link", { name: /noteikumiem/ });

      // Should contain an SVG icon
      const svg = termsLink.locator("svg");
      await expect(svg).toBeVisible();
    });
  });

  test.describe("Distance Dropdown Disabled State", () => {
    test("should disable distance dropdown when only one distance available", async ({
      page,
    }) => {
      await page.goto("/parize-dakara/checkout");

      // Paris-Dakar only has one distance
      const distanceSelect = page.getByTestId("distance-select");

      // Should be disabled
      await expect(distanceSelect).toBeDisabled();

      // Should still show the value
      await expect(distanceSelect).toBeVisible();
    });

    test("should enable distance dropdown when multiple distances available", async ({
      page,
    }) => {
      await page.goto("/egipte-malta/checkout");

      // Egypt-Malta has two distances
      const distanceSelect = page.getByTestId("distance-select");

      // Should be enabled
      await expect(distanceSelect).toBeEnabled();
    });
  });
});
