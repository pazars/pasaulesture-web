import { test, expect } from "@playwright/test";
import { CONTACT_INFO } from "@/app/data/contact";

test.describe("Contact Information Consistency", () => {
  test.describe("Email Consistency", () => {
    test("should use same email in privacy policy (Latvian)", async ({ page }) => {
      await page.goto("/privatuma-politika");

      // Email should be mentioned in the privacy policy
      await expect(page.getByText(CONTACT_INFO.email)).toBeVisible();

      // Should have mailto link
      const emailLink = page.locator(`a[href="mailto:${CONTACT_INFO.email}"]`);
      await expect(emailLink).toBeVisible();
    });

    test("should use same email in privacy policy (English)", async ({ page }) => {
      await page.goto("/en/privatuma-politika");

      // Email should be mentioned in the privacy policy
      await expect(page.getByText(CONTACT_INFO.email)).toBeVisible();

      // Should have mailto link
      const emailLink = page.locator(`a[href="mailto:${CONTACT_INFO.email}"]`);
      await expect(emailLink).toBeVisible();
    });

    test("should use same email in terms page (Latvian)", async ({ page }) => {
      await page.goto("/noteikumi");

      // Email should be mentioned in the terms (multiple times is ok)
      await expect(page.getByText(CONTACT_INFO.email).first()).toBeVisible();
    });

    test("should use same email in terms page (English)", async ({ page }) => {
      await page.goto("/en/noteikumi");

      // Email should be mentioned in the terms (multiple times is ok)
      await expect(page.getByText(CONTACT_INFO.email).first()).toBeVisible();
    });
  });

  test.describe("Organization Details Consistency", () => {
    test("should use same organization name across pages (Latvian)", async ({ page }) => {
      const pages = ["/kontakti", "/privatuma-politika", "/noteikumi"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await expect(page.getByText(CONTACT_INFO.organizationName)).toBeVisible();
      }
    });

    test("should use same organization name across pages (English)", async ({ page }) => {
      const pages = ["/en/kontakti", "/en/privatuma-politika", "/en/noteikumi"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await expect(page.getByText(CONTACT_INFO.organizationName)).toBeVisible();
      }
    });

    test("should use same registration number across pages (Latvian)", async ({ page }) => {
      const pages = ["/kontakti", "/privatuma-politika", "/noteikumi"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await expect(page.getByText(CONTACT_INFO.registrationNumber)).toBeVisible();
      }
    });

    test("should use same registration number across pages (English)", async ({ page }) => {
      const pages = ["/en/kontakti", "/en/privatuma-politika", "/en/noteikumi"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await expect(page.getByText(CONTACT_INFO.registrationNumber)).toBeVisible();
      }
    });

    test("should use same bank account across pages (Latvian)", async ({ page }) => {
      const pages = ["/kontakti", "/privatuma-politika", "/noteikumi"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await expect(page.getByText(CONTACT_INFO.bankAccount)).toBeVisible();
      }
    });

    test("should use same bank account across pages (English)", async ({ page }) => {
      const pages = ["/en/kontakti", "/en/privatuma-politika", "/en/noteikumi"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await expect(page.getByText(CONTACT_INFO.bankAccount)).toBeVisible();
      }
    });

    test("should use same address across pages (Latvian)", async ({ page }) => {
      const pages = ["/privatuma-politika", "/noteikumi"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await expect(page.getByText(CONTACT_INFO.address)).toBeVisible();
      }
    });

    test("should use same address across pages (English)", async ({ page }) => {
      const pages = ["/en/privatuma-politika", "/en/noteikumi"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await expect(page.getByText(CONTACT_INFO.address)).toBeVisible();
      }
    });
  });

  test.describe("Centralized Configuration Validation", () => {
    test("should have no hardcoded email addresses different from CONTACT_INFO", async ({
      page,
    }) => {
      // This test verifies that we're not using any other email addresses
      const pages = [
        "/kontakti",
        "/egipte-malta",
        "/privatuma-politika",
        "/noteikumi",
        "/en/kontakti",
        "/en/egipte-malta",
        "/en/privatuma-politika",
        "/en/noteikumi",
      ];

      // Common email patterns that might be hardcoded
      const otherEmailPatterns = [
        "info@pasaulesture.lv",
        "contact@pasaulesture.lv",
        "hello@pasaulesture.lv",
      ];

      for (const pagePath of pages) {
        await page.goto(pagePath);

        // Check that none of the other email patterns appear
        for (const emailPattern of otherEmailPatterns) {
          const wrongEmail = page.getByText(emailPattern, { exact: true });
          await expect(wrongEmail).not.toBeVisible();
        }

        // Verify the correct email is used
        const correctEmail = page.getByText(CONTACT_INFO.email);
        // Not all pages have email, but if they do, it should be the correct one
        const emailCount = await correctEmail.count();
        if (emailCount > 0) {
          await expect(correctEmail.first()).toBeVisible();
        }
      }
    });
  });
});
