import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe('Event navigation', () => {
    test('should maintain locale when navigating between events in LV', async ({ page }) => {

      await page.goto('/egipte-malta');

      // Click on another event link
      const parizeDakaraLink = page.getByRole('link', { name: /Parīze-Dakāra|Paris-Dakar/i });
      await parizeDakaraLink.click();

      // Should stay on clean URL (Latvian)
      await expect(page).toHaveURL(/\/parize-dakara$/);
      await expect(page).not.toHaveURL(/\/en\//);

      // Should show Latvian content
      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('lv');
    });

    test('should maintain locale when navigating between events in EN', async ({ page }) => {

      await page.goto('/en/egipte-malta');

      // Click on another event link
      const parizeDakaraLink = page.getByRole('link', { name: /Parīze-Dakāra|Paris-Dakar/i });
      await parizeDakaraLink.click();

      // Should stay on /en/ URL
      await expect(page).toHaveURL(/\/en\/parize-dakara/);

      // Should show English content
      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('en');
    });
  });

  test.describe('Footer links', () => {
    test('should maintain locale when clicking footer links in LV', async ({ page }) => {

      await page.goto('/egipte-malta');

      // Click privacy policy link in footer
      const privacyLink = page.getByRole('link', { name: /Privātuma politika|Privacy Policy/i });
      await privacyLink.click();

      // Should navigate to clean URL
      await expect(page).toHaveURL(/\/privatuma-politika$/);
      await expect(page).not.toHaveURL(/\/en\//);
    });

    test('should maintain locale when clicking footer links in EN', async ({ page }) => {

      await page.goto('/en/egipte-malta');

      // Click privacy policy link in footer
      const privacyLink = page.getByRole('link', { name: /Privātuma politika|Privacy Policy/i });
      await privacyLink.click();

      // Should navigate to /en/ URL
      await expect(page).toHaveURL(/\/en\/privatuma-politika/);
    });

    test('should navigate to terms page and maintain locale in LV', async ({ page }) => {

      await page.goto('/egipte-malta');

      // Click terms link in footer
      const termsLink = page.getByRole('link', { name: /Noteikumi|Terms/i });
      await termsLink.click();

      // Should navigate to clean URL
      await expect(page).toHaveURL(/\/noteikumi$/);
      await expect(page).not.toHaveURL(/\/en\//);
    });

    test('should navigate to terms page and maintain locale in EN', async ({ page }) => {

      await page.goto('/en/egipte-malta');

      // Click terms link in footer
      const termsLink = page.getByRole('link', { name: /Noteikumi|Terms/i });
      await termsLink.click();

      // Should navigate to /en/ URL
      await expect(page).toHaveURL(/\/en\/noteikumi/);
    });
  });

  test.describe('Browser navigation', () => {
    test('should work correctly with browser back button in LV', async ({ page }) => {

      await page.goto('/egipte-malta');
      const initialHeading = await page.locator('h1').first().textContent();

      // Navigate to another page
      await page.goto('/privatuma-politika');

      // Go back
      await page.goBack();

      // Should be back on event page with same locale
      await expect(page).toHaveURL(/\/egipte-malta$/);
      await expect(page.locator('h1').first()).toHaveText(initialHeading || '');

      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('lv');
    });

    test('should work correctly with browser back button in EN', async ({ page }) => {

      await page.goto('/en/egipte-malta');
      const initialHeading = await page.locator('h1').first().textContent();

      // Navigate to another page
      await page.goto('/en/privatuma-politika');

      // Go back
      await page.goBack();

      // Should be back on event page with same locale
      await expect(page).toHaveURL(/\/en\/egipte-malta/);
      await expect(page.locator('h1').first()).toHaveText(initialHeading || '');

      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('en');
    });

    test('should work correctly with browser forward button', async ({ page }) => {

      await page.goto('/egipte-malta');
      await page.goto('/privatuma-politika');

      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/\/egipte-malta$/);

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/\/privatuma-politika$/);

      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('lv');
    });
  });

  test.describe('Direct URL access', () => {
    test('should handle direct URL access to event page in LV', async ({ page }) => {

      // Direct navigation
      await page.goto('/parize-dakara');

      await expect(page).toHaveURL(/\/parize-dakara$/);

      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('lv');
    });

    test('should handle direct URL access to EN event page', async ({ page }) => {

      // Direct navigation to EN URL
      await page.goto('/en/parize-dakara');

      // Should stay on /en/ version
      await expect(page).toHaveURL(/\/en\/parize-dakara/);

      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('en');
    });
  });

  test.describe('External links', () => {
    test('should have contact link in footer', async ({ page }) => {

      await page.goto('/egipte-malta');

      // Find contact page link in footer
      const contactLink = page.getByRole('link', { name: /Kontakti|Contact/i });
      await expect(contactLink).toBeVisible();

      const href = await contactLink.getAttribute('href');
      expect(href).toMatch(/\/(en\/)?kontakti/);
    });

    test('should have location links with proper Google Maps URLs', async ({ page }) => {

      await page.goto('/egipte-malta');

      // Find location link (if exists)
      const locationLinks = page.getByRole('link').filter({ hasText: /Sarkaņkalns|Rēzekne|Riga/i });
      const count = await locationLinks.count();

      if (count > 0) {
        const href = await locationLinks.first().getAttribute('href');
        expect(href).toMatch(/maps\.(google\.com|app\.goo\.gl)/);
      }
    });
  });
});
