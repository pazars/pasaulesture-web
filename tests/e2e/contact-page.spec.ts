import { test, expect } from "@playwright/test";
import { CONTACT_INFO } from "@/app/data/contact";

test.describe("Contact Page", () => {
  test.describe("Latvian", () => {
    test("should display all contact information", async ({ page, context }) => {
      // Set Latvian locale preference
      await context.addCookies([{
        name: "PARAGLIDE_LOCALE",
        value: "lv",
        domain: "localhost",
        path: "/"
      }]);

      await page.goto("/kontakti");

      // Check page title
      await expect(page.locator("h1")).toContainText("Kontakti");

      // Check email is displayed and clickable
      const emailLink = page.locator(`a[href="mailto:${CONTACT_INFO.email}"]`);
      await expect(emailLink).toBeVisible();
      await expect(emailLink).toHaveText(CONTACT_INFO.email);

      // Check registration number is displayed
      await expect(page.getByText(CONTACT_INFO.registrationNumber)).toBeVisible();

      // Check organization name is displayed
      await expect(page.getByText(CONTACT_INFO.organizationName)).toBeVisible();

      // Check bank account is displayed
      await expect(page.getByText(CONTACT_INFO.bankAccount)).toBeVisible();

      // Check phone note is displayed
      await expect(
        page.getByText("Biedrībai nav kontakttālruņa", { exact: false })
      ).toBeVisible();
    });

    test("should have back to home button", async ({ page, context }) => {
      // Set Latvian locale preference
      await context.addCookies([{
        name: "PARAGLIDE_LOCALE",
        value: "lv",
        domain: "localhost",
        path: "/"
      }]);

      await page.goto("/kontakti");

      const backButton = page.locator('a[aria-label="Atpakaļ uz sākumu"]');
      await expect(backButton).toBeVisible();
      await expect(backButton).toHaveAttribute("href", "/");
    });

    test("email link should be clickable", async ({ page, context }) => {
      // Set Latvian locale preference
      await context.addCookies([{
        name: "PARAGLIDE_LOCALE",
        value: "lv",
        domain: "localhost",
        path: "/"
      }]);

      await page.goto("/kontakti");

      const emailLink = page.locator(`a[href="mailto:${CONTACT_INFO.email}"]`);
      await expect(emailLink).toBeVisible();

      // Verify mailto link format
      const href = await emailLink.getAttribute("href");
      expect(href).toBe(`mailto:${CONTACT_INFO.email}`);
    });
  });

  test.describe("English", () => {
    test("should display all contact information", async ({ page }) => {
      await page.goto("/en/kontakti");

      // Check page title
      await expect(page.locator("h1")).toContainText("Contact");

      // Check email is displayed and clickable
      const emailLink = page.locator(`a[href="mailto:${CONTACT_INFO.email}"]`);
      await expect(emailLink).toBeVisible();
      await expect(emailLink).toHaveText(CONTACT_INFO.email);

      // Check registration number is displayed
      await expect(page.getByText(CONTACT_INFO.registrationNumber)).toBeVisible();

      // Check organization name is displayed
      await expect(page.getByText(CONTACT_INFO.organizationName)).toBeVisible();

      // Check bank account is displayed
      await expect(page.getByText(CONTACT_INFO.bankAccount)).toBeVisible();

      // Check phone note is displayed
      await expect(
        page.getByText("does not have a contact telephone number", { exact: false })
      ).toBeVisible();
    });

    test("should have back to home button", async ({ page }) => {
      await page.goto("/en/kontakti");

      const backButton = page.locator('a[aria-label="Back to home"]');
      await expect(backButton).toBeVisible();
      await expect(backButton).toHaveAttribute("href", "/en");
    });

    test("email link should be clickable", async ({ page }) => {
      await page.goto("/en/kontakti");

      const emailLink = page.locator(`a[href="mailto:${CONTACT_INFO.email}"]`);
      await expect(emailLink).toBeVisible();

      // Verify mailto link format
      const href = await emailLink.getAttribute("href");
      expect(href).toBe(`mailto:${CONTACT_INFO.email}`);
    });
  });

  test.describe("Navigation", () => {
    test("should be accessible from footer (Latvian)", async ({ page, context }) => {
      // Set Latvian locale preference
      await context.addCookies([{
        name: "PARAGLIDE_LOCALE",
        value: "lv",
        domain: "localhost",
        path: "/"
      }]);

      await page.goto("/egipte-malta");

      // Wait for the footer to be visible
      await page.waitForSelector("footer");

      // Click contact link in footer
      const contactLink = page.locator('footer a:has-text("Kontakti")');
      await contactLink.click();

      // Should navigate to contact page (Latvian uses clean URLs without /lv/)
      await expect(page).toHaveURL("/kontakti");
      await expect(page.locator("h1")).toContainText("Kontakti");
    });

    test("should be accessible from footer (English)", async ({ page }) => {
      await page.goto("/en/egipte-malta");

      // Wait for the footer to be visible
      await page.waitForSelector("footer");

      // Click contact link in footer
      const contactLink = page.locator('footer a:has-text("Contact")');
      await contactLink.click();

      // Should navigate to contact page
      await expect(page).toHaveURL("/en/kontakti");
      await expect(page.locator("h1")).toContainText("Contact");
    });
  });
});
