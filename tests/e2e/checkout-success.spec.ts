import { test, expect } from "@playwright/test";

test.describe("Checkout Success Page", () => {
  test("displays confirmation for valid session", async ({ page }) => {
    // Mock session ID (in real test, create actual session)
    const sessionId = "cs_test_abc123";
    await page.goto(`/en/egipte-malta/checkout/success?session_id=${sessionId}`);

    // Should show success message
    await expect(page.locator("h1")).toContainText("Registration Complete");
    await expect(page.getByText(/confirmation email/i)).toBeVisible();
  });

  test("handles invalid session gracefully", async ({ page }) => {
    await page.goto("/en/egipte-malta/checkout/success?session_id=invalid");

    // Should show error message
    await expect(page.getByText(/unable to verify/i)).toBeVisible();
  });

  test("handles missing session ID", async ({ page }) => {
    await page.goto("/en/egipte-malta/checkout/success");

    // Should show error message
    await expect(page.getByText(/no session found/i)).toBeVisible();
  });
});
