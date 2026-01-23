import { test, expect } from "@playwright/test";

test.describe("Checkout Success Page", () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test to ensure clean state
    await context.clearCookies();
  });

  // This test makes a real Stripe API call, so add retry for flakiness
  test("displays error for invalid session ID", async ({ page, context }) => {
    test.slow(); // Mark as slow test that needs more time

    // Set English cookie and use English URL for consistent behavior
    await context.addCookies([
      {
        name: "PARAGLIDE_LOCALE",
        value: "en",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Mock session ID (Stripe will reject this as invalid)
    const sessionId = "cs_test_abc123";
    await page.goto(`/en/egipte-malta/checkout/success?session_id=${sessionId}`);

    // Wait for page to load fully (Stripe API call may take time under load)
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500); // Extra buffer for API response processing

    // Should show error message since session is invalid
    await expect(page.locator("h1")).toContainText("Error", { timeout: 15000 });
    await expect(page.getByText(/Unable to verify/i)).toBeVisible({ timeout: 15000 });
  });

  test("handles missing session ID", async ({ page, context }) => {
    // Set English cookie and use English URL for consistent behavior
    await context.addCookies([
      {
        name: "PARAGLIDE_LOCALE",
        value: "en",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/en/egipte-malta/checkout/success");

    // Should show error message for missing session
    await expect(page.locator("h1")).toContainText("Error");
    await expect(page.getByText(/No session found/i)).toBeVisible();
  });

  test("shows error page structure correctly", async ({ page, context }) => {
    // This test verifies the error page has proper structure
    await context.addCookies([
      {
        name: "PARAGLIDE_LOCALE",
        value: "en",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/en/egipte-malta/checkout/success");

    // Page should have glass card styling
    await expect(page.locator(".glass")).toBeVisible();

    // Should have an h1 heading
    await expect(page.locator("h1")).toBeVisible();

    // Should have error description text
    await expect(page.locator("p.text-cream-light")).toBeVisible();
  });
});
