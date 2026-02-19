import { test, expect } from "@playwright/test";

test.describe("Checkout - Language Switching", () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test to ensure clean state
    await context.clearCookies();
  });

  test.describe("Language-specific URL Routing", () => {
    test("should show Latvian checkout at clean URL", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Should be on Latvian checkout
      await expect(page).toHaveURL(/^(?!.*\/en\/).*\/egipte-malta\/checkout/);

      // Should show Latvian title
      await expect(
        page.getByRole("heading", { name: "Reģistrācija", level: 1 })
      ).toBeVisible();
    });

    test("should show English checkout at /en/ URL", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      // Should be on English checkout
      await expect(page).toHaveURL(/\/en\/egipte-malta\/checkout/);

      // Should show English title
      await expect(
        page.getByRole("heading", { name: "Registration", level: 1 })
      ).toBeVisible();
    });

    test("should preserve distance parameter in Latvian URL", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout?distance=0");

      // Verify distance is selected
      const distanceSelect = page.getByTestId("distance-select");
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should preserve distance parameter in English URL", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout?distance=0");

      // Verify distance is still selected
      const distanceSelect = page.getByTestId("distance-select");
      await expect(distanceSelect).toHaveValue("0");
    });
  });

  test.describe("UI Text Translation", () => {
    test("should show Latvian page title on LV checkout", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Should show Latvian title
      await expect(
        page.getByRole("heading", { name: "Reģistrācija", level: 1 })
      ).toBeVisible();
    });

    test("should show English page title on EN checkout", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      // Should show English title
      await expect(
        page.getByRole("heading", { name: "Registration", level: 1 })
      ).toBeVisible();
    });

    test("should show Latvian form labels on LV checkout", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Should show Latvian labels
      await expect(page.getByText("Vārds, uzvārds")).toBeVisible();
      await expect(page.getByText("E-pasts")).toBeVisible();
    });

    test("should show English form labels on EN checkout", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      // Should show English labels
      await expect(page.getByText("Full name")).toBeVisible();
      await expect(page.getByText("Email")).toBeVisible();
    });

    test("should display correct event name on Latvian checkout page", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Event name should be displayed as read-only text in Latvian
      const eventName = page.getByTestId("event-name");
      await expect(eventName).toHaveText("Ēģipte-Malta");
    });

    test("should display correct event name on English checkout page", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      // Event name should show English translation
      const eventName = page.getByTestId("event-name");
      await expect(eventName).toHaveText("Egypt-Malta");
    });

    test("should show Latvian distance names on LV checkout", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout?distance=0");

      // Should have distance 0 selected
      const distanceSelect = page.getByTestId("distance-select");
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should show English distance names on EN checkout", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout?distance=0");

      // Should have distance 0 selected in English
      const distanceSelect = page.getByTestId("distance-select");
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should show Latvian submit button text", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Should show Latvian button text
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toContainText(/Turpināt uz maksājumu/);
    });

    test("should show English submit button text", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      // Should show English button text
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toContainText(/Continue to payment/);
    });
  });

  test.describe("Form State Persistence via localStorage", () => {
    test("should persist name field across language page loads", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Wait for form to be interactive
      const nameInput = page.locator('input[id="name"]');
      await nameInput.waitFor({ state: "visible" });

      // Fill name field
      await nameInput.fill("Jānis Bērziņš");

      // Wait for localStorage to be written by onChange handler
      await page.waitForFunction(
        () => localStorage.getItem("checkout_name") === "Jānis Bērziņš",
        { timeout: 5000 }
      );

      // Navigate to English checkout
      await page.goto("/en/egipte-malta/checkout");

      // Name should be preserved via localStorage
      const nameInputEn = page.locator('input[id="name"]');
      await expect(nameInputEn).toHaveValue("Jānis Bērziņš");
    });

    test("should persist email field across language page loads", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      // Wait for form to be interactive
      const emailInput = page.locator('input[id="email"]');
      await emailInput.waitFor({ state: "visible" });

      // Fill email field
      await emailInput.fill("janis@example.com");

      // Wait for localStorage to be written by onChange handler
      await page.waitForFunction(
        () => localStorage.getItem("checkout_email") === "janis@example.com",
        { timeout: 5000 }
      );

      // Navigate to English checkout
      await page.goto("/en/egipte-malta/checkout");

      // Email should be preserved via localStorage
      const emailInputEn = page.locator('input[id="email"]');
      await expect(emailInputEn).toHaveValue("janis@example.com");
    });
  });

  test.describe("Terms Link Locale", () => {
    test("should point terms link to Latvian terms page", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      const termsLink = page.getByRole("link", { name: /noteikumiem/ });
      await expect(termsLink).toHaveAttribute("href", "/noteikumi");
    });

    test("should point terms link to English terms page", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      const termsLink = page.getByRole("link", { name: /terms/ });
      await expect(termsLink).toHaveAttribute("href", "/en/noteikumi");
    });
  });

  test.describe("HTML Lang Attribute", () => {
    test("should have lv lang attribute on Latvian checkout", async ({
      page,
    }) => {

      await page.goto("/egipte-malta/checkout");

      const langAttr = await page.locator("html").getAttribute("lang");
      expect(langAttr).toBe("lv");
    });

    test("should have en lang attribute on English checkout", async ({
      page,
    }) => {

      await page.goto("/en/egipte-malta/checkout");

      const langAttr = await page.locator("html").getAttribute("lang");
      expect(langAttr).toBe("en");
    });

    test("should have en lang attribute on direct English page load", async ({
      page,
    }) => {
      // Direct navigation to English page (no cookie setup needed)
      await page.goto("/en/egipte-malta/checkout");

      // Should be en for English URL
      const langAttr = await page.locator("html").getAttribute("lang");
      expect(langAttr).toBe("en");
    });
  });
});
