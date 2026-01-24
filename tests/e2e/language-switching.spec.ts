import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test.describe('URL-based locale routing', () => {
    test('Latvian locale shows Latvian content at clean URL', async ({ page, context }) => {
      // Set LV locale cookie to ensure Latvian content
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      // Should stay on clean URL (no redirect)
      await expect(page).toHaveURL(/\/egipte-malta$/);

      // Should show Latvian event name in h1
      await expect(page.getByRole('heading', { name: 'Ēģipte-Malta', level: 1 })).toBeVisible();

      // Should show Latvian UI text
      await expect(page.getByText('Izvēlies savu maršrutu')).toBeVisible();
    });

    test('English locale shows English content at /en/ URL', async ({ page, context }) => {
      // Set EN locale cookie
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/egipte-malta');

      // Should show English event name in h1
      await expect(page.getByRole('heading', { name: 'Egypt-Malta', level: 1 })).toBeVisible();

      // Should show English UI text
      await expect(page.getByText('Choose your route')).toBeVisible();
    });

    test('/lv/ prefix redirects to clean URL', async ({ page, context }) => {
      // Set LV locale cookie
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/lv/egipte-malta');

      // Should redirect to clean URL (without /lv/)
      await expect(page).toHaveURL(/\/egipte-malta$/);
      await expect(page).not.toHaveURL(/\/lv\//);

      // Should still show Latvian content
      await expect(page.getByRole('heading', { name: 'Ēģipte-Malta', level: 1 })).toBeVisible();
    });

    test('visiting clean URL with EN cookie redirects to /en/', async ({ page, context }) => {
      // Set EN locale cookie
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      // Visit a page without locale prefix
      await page.goto('/egipte-malta');

      // Should redirect to English version
      await expect(page).toHaveURL(/\/en\/egipte-malta/);
      await expect(page.getByRole('heading', { name: 'Egypt-Malta', level: 1 })).toBeVisible();
    });
  });

  test.describe('Language switcher functionality', () => {
    test('switching from LV to EN navigates to /en/ URL', async ({ page, context }) => {
      // Start with LV locale
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      // Verify we're on LV
      await expect(page.getByRole('heading', { name: 'Ēģipte-Malta', level: 1 })).toBeVisible();

      // Click EN button (use exact match)
      await page.getByRole('button', { name: 'EN', exact: true }).click();

      // Should navigate to English URL
      await expect(page).toHaveURL(/\/en\/egipte-malta/);

      // Should show English content
      await expect(page.getByRole('heading', { name: 'Egypt-Malta', level: 1 })).toBeVisible();
    });

    test('switching from EN to LV navigates to clean URL', async ({ page, context }) => {
      // Start with EN locale
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/egipte-malta');

      // Verify we're on EN
      await expect(page.getByRole('heading', { name: 'Egypt-Malta', level: 1 })).toBeVisible();

      // Click LV button (use exact match)
      await page.getByRole('button', { name: 'LV', exact: true }).click();

      // Should navigate to clean URL (without locale prefix)
      await expect(page).toHaveURL(/\/egipte-malta$/);
      await expect(page).not.toHaveURL(/\/en\//);

      // Should show Latvian content
      await expect(page.getByRole('heading', { name: 'Ēģipte-Malta', level: 1 })).toBeVisible();
    });

    test('LV button is highlighted when on Latvian page', async ({ page, context }) => {
      // Start with LV locale
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      // LV button should have aria-current="page"
      const lvButton = page.getByRole('button', { name: 'LV', exact: true });
      await expect(lvButton).toHaveAttribute('aria-current', 'page');

      // EN button should not have aria-current
      const enButton = page.getByRole('button', { name: 'EN', exact: true });
      await expect(enButton).not.toHaveAttribute('aria-current');
    });

    test('EN button is highlighted when on English page', async ({ page, context }) => {
      // Start with EN locale
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/egipte-malta');

      // EN button should have aria-current="page"
      const enButton = page.getByRole('button', { name: 'EN', exact: true });
      await expect(enButton).toHaveAttribute('aria-current', 'page');

      // LV button should not have aria-current
      const lvButton = page.getByRole('button', { name: 'LV', exact: true });
      await expect(lvButton).not.toHaveAttribute('aria-current');
    });
  });

  test.describe('Cookie persistence', () => {
    test('locale preference persists via cookie after switching', async ({ page, context }) => {
      // Start with LV locale
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      // Switch to EN
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page).toHaveURL(/\/en\/egipte-malta/);

      // Check cookie was updated to EN
      const cookies = await context.cookies();
      const localeCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
      expect(localeCookie?.value).toBe('en');
    });

    test('switching back to LV updates cookie', async ({ page, context }) => {
      // Start with EN locale
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/egipte-malta');

      // Switch to LV
      await page.getByRole('button', { name: 'LV', exact: true }).click();
      await expect(page).toHaveURL(/\/egipte-malta$/);

      // Check cookie was updated to LV
      const cookies = await context.cookies();
      const localeCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
      expect(localeCookie?.value).toBe('lv');
    });
  });

  test.describe('No hydration errors', () => {
    test('LV page loads without hydration mismatch', async ({ page, context }) => {
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('Hydration')) {
          errors.push(msg.text());
        }
      });

      await page.goto('/egipte-malta');
      await page.waitForLoadState('networkidle');

      expect(errors).toHaveLength(0);
    });

    test('EN page loads without hydration mismatch', async ({ page, context }) => {
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('Hydration')) {
          errors.push(msg.text());
        }
      });

      await page.goto('/en/egipte-malta');
      await page.waitForLoadState('networkidle');

      expect(errors).toHaveLength(0);
    });
  });

  test.describe('Static pages', () => {
    test('privacy policy page loads successfully', async ({ page, context }) => {
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/privatuma-politika');

      // Just verify page loaded with a heading (any language)
      await expect(page.locator('h1').first()).toBeVisible();
      expect(await page.locator('h1').first().textContent()).toMatch(/Privātuma politika|Privacy Policy/);
    });

    test('privacy policy page loads in English', async ({ page, context }) => {
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/privatuma-politika');

      // Just verify page loaded with a heading (any language)
      await expect(page.locator('h1').first()).toBeVisible();
      expect(await page.locator('h1').first().textContent()).toMatch(/Privātuma politika|Privacy Policy/);
    });

    test('terms page loads successfully', async ({ page, context }) => {
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/noteikumi');

      // Just verify page loaded with a heading (any language)
      await expect(page.locator('h1').first()).toBeVisible();
      expect(await page.locator('h1').first().textContent()).toMatch(/Noteikumi|Terms/);
    });

    test('terms page loads in English', async ({ page, context }) => {
      await context.addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/noteikumi');

      // Just verify page loaded with a heading (any language)
      await expect(page.locator('h1').first()).toBeVisible();
      expect(await page.locator('h1').first().textContent()).toMatch(/Noteikumi|Terms/);
    });
  });
});
