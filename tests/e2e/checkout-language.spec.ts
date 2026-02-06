import { test, expect } from "@playwright/test";

test.describe("Checkout - Language Switching", () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test to ensure clean state
    await context.clearCookies();
  });

  test.describe("Language Switching with URL Preservation", () => {
    test("should preserve event slug when switching from LV to EN", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Should be on Latvian checkout
      await expect(page).toHaveURL(/^(?!.*\/en\/).*\/egipte-malta\/checkout/);

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Should be on English checkout for same event
      await expect(page).toHaveURL(/\/en\/egipte-malta\/checkout/);
    });

    test("should preserve event slug when switching from EN to LV", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout");

      // Should be on English checkout
      await expect(page).toHaveURL(/\/en\/egipte-malta\/checkout/);

      // Switch to Latvian
      await page.getByRole("button", { name: "LV", exact: true }).click();

      // Should be on Latvian checkout (no /en/ prefix, but may have query params)
      await expect(page).toHaveURL(/\/egipte-malta\/checkout/);
      await expect(page).not.toHaveURL(/\/en\//);
    });

    test("should preserve distance parameter when switching to English", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
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

      // Verify distance is still selected
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");
    });

    test("should preserve distance parameter when switching to Latvian", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout?distance=0");

      // Switch to Latvian
      await page.getByRole("button", { name: "LV", exact: true }).click();

      // Should preserve distance parameter
      await expect(page).toHaveURL(/\/egipte-malta\/checkout\?distance=0/);
      await expect(page).not.toHaveURL(/\/en\//);

      // Verify distance is still selected
      const distanceSelect = page.locator("select").nth(1);
      await expect(distanceSelect).toHaveValue("0");
    });
  });

  test.describe("UI Text Translation", () => {
    test("should translate page title when switching languages", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Should show Latvian title
      await expect(
        page.getByRole("heading", { name: "Reģistrācija", level: 1 })
      ).toBeVisible();

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Should show English title
      await expect(
        page.getByRole("heading", { name: "Registration", level: 1 })
      ).toBeVisible();
    });

    test("should translate form labels when switching languages", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Should show Latvian labels
      await expect(page.getByText("Vārds, uzvārds")).toBeVisible();
      await expect(page.getByText("E-pasts")).toBeVisible();

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Should show English labels
      await expect(page.getByText("Full name")).toBeVisible();
      await expect(page.getByText("Email")).toBeVisible();
    });

    test("should translate event name when switching languages", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Should show Latvian event name in select dropdown
      const eventSelect = page.locator("select").first();
      await expect(eventSelect).toHaveValue("egipte-malta");

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Event select should still have same value (slug doesn't change)
      await expect(eventSelect).toHaveValue("egipte-malta");
    });

    test("should translate distance names when switching languages", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout?distance=0");

      // Should have Latvian distance selected
      const distanceSelectBefore = page.locator("select").nth(1);
      await expect(distanceSelectBefore).toHaveValue("0");

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Should still have distance 0 selected (just in English now)
      await page.waitForURL(/\/en\/egipte-malta\/checkout/);
      const distanceSelectAfter = page.locator("select").nth(1);
      await expect(distanceSelectAfter).toHaveValue("0");
    });

    test("should translate submit button when switching languages", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Should show Latvian button text
      await expect(
        page.getByRole("button", { name: /Turpināt uz maksājumu/ })
      ).toBeVisible();

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Should show English button text
      await expect(
        page.getByRole("button", { name: /Continue to payment/ })
      ).toBeVisible();
    });

  });

  test.describe("Form State Preservation", () => {
    test("should preserve name field when switching languages", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Fill name field
      await page.locator('input[id="name"]').fill("Jānis Bērziņš");

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Name should be preserved
      const nameInput = page.locator('input[id="name"]');
      await expect(nameInput).toHaveValue("Jānis Bērziņš");
    });

    test("should preserve email field when switching languages", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Fill email field
      await page.locator('input[id="email"]').fill("janis@example.com");

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Email should be preserved
      const emailInput = page.locator('input[id="email"]');
      await expect(emailInput).toHaveValue("janis@example.com");
    });

    test("should preserve terms checkbox when switching languages", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Check terms
      await page.locator('input[id="terms"]').check();

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Terms should still be checked
      const termsCheckbox = page.locator('input[id="terms"]');
      await expect(termsCheckbox).toBeChecked();
    });

    test("should preserve all form fields when switching to English", async ({
      page,
    }) => {
      // Start from Latvian page (no cookie to avoid race condition)
      await page.goto("/egipte-malta/checkout");

      // Fill all fields
      await page.locator('input[id="name"]').fill("Jānis Bērziņš");
      await page.locator('input[id="email"]').fill("janis@example.com");
      await page.locator('input[id="terms"]').check();

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Verify fields preserved after language switch
      await expect(page.locator('input[id="name"]')).toHaveValue(
        "Jānis Bērziņš"
      );
      await expect(page.locator('input[id="email"]')).toHaveValue(
        "janis@example.com"
      );
      await expect(page.locator('input[id="terms"]')).toBeChecked();
    });
  });

  test.describe("Terms Link Locale", () => {
    test("should point terms link to Latvian terms page", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      const termsLink = page.getByRole("link", { name: /noteikumiem/ });
      await expect(termsLink).toHaveAttribute("href", "/noteikumi");
    });

    test("should point terms link to English terms page", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout");

      const termsLink = page.getByRole("link", { name: /terms/ });
      await expect(termsLink).toHaveAttribute("href", "/en/noteikumi");
    });

    test("should update terms link when switching to English", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Terms link should point to English terms
      const termsLink = page.getByRole("link", { name: /terms/ });
      await expect(termsLink).toHaveAttribute("href", "/en/noteikumi");
    });
  });

  test.describe("Cookie Persistence", () => {
    test("should update locale cookie when switching to English", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      // Switch to English
      await page.getByRole("button", { name: "EN", exact: true }).click();

      // Wait for cookie to update
      await page.waitForTimeout(100);

      // Check cookie was updated
      const cookies = await context.cookies();
      const localeCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
      expect(localeCookie?.value).toBe("en");
    });

    test("should update locale cookie when switching to Latvian", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout");

      // Switch to Latvian
      await page.getByRole("button", { name: "LV", exact: true }).click();

      // Wait for cookie to update
      await page.waitForTimeout(100);

      // Check cookie was updated
      const cookies = await context.cookies();
      const localeCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
      expect(localeCookie?.value).toBe("lv");
    });
  });

  test.describe("Language Switcher State", () => {
    test("should highlight LV button on Latvian checkout page", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      const lvButton = page.getByRole("button", { name: "LV", exact: true });
      const enButton = page.getByRole("button", { name: "EN", exact: true });

      // LV should be highlighted
      await expect(lvButton).toHaveAttribute("aria-current", "page");

      // EN should not be highlighted
      await expect(enButton).not.toHaveAttribute("aria-current");
    });

    test("should highlight EN button on English checkout page", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/en/egipte-malta/checkout");

      const lvButton = page.getByRole("button", { name: "LV", exact: true });
      const enButton = page.getByRole("button", { name: "EN", exact: true });

      // EN should be highlighted
      await expect(enButton).toHaveAttribute("aria-current", "page");

      // LV should not be highlighted
      await expect(lvButton).not.toHaveAttribute("aria-current");
    });
  });

  test.describe("HTML Lang Attribute", () => {
    test("should have lv lang attribute on Latvian checkout", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "lv",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/egipte-malta/checkout");

      const langAttr = await page.locator("html").getAttribute("lang");
      expect(langAttr).toBe("lv");
    });

    test("should have en lang attribute on English checkout", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "NEXT_LOCALE",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

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
