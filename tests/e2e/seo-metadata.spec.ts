import { test, expect } from '@playwright/test';

test.describe('SEO and Metadata', () => {
  test.describe('HTML lang attribute', () => {
    test('should have lang="lv" for Latvian pages', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('lv');
    });

    test('should have lang="en" for English pages', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/egipte-malta');

      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBe('en');
    });
  });

  test.describe('Page titles', () => {
    test('should have consistent title for LV pages', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      const title = await page.title();
      expect(title).toBe('Pasaules Tūre');
    });

    test('should have title without macron for EN pages', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/egipte-malta');

      const title = await page.title();
      expect(title).toBe('Pasaules Ture');
    });

    test('should have title for static pages in LV', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/privatuma-politika');

      const title = await page.title();
      expect(title).toBe('Pasaules Tūre');
    });

    test('should have title for static pages in EN', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/privatuma-politika');

      const title = await page.title();
      expect(title).toBe('Pasaules Ture');
    });
  });

  test.describe('Meta descriptions', () => {
    test('should have Latvian meta description for LV pages', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      // Event pages include event name in description
      expect(metaDescription).toContain('Ultra riteņbraukšanas pasākumi Latvijā');
    });

    test('should have English meta description for EN pages', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/egipte-malta');

      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      // Event pages include event name in description
      expect(metaDescription).toContain('Ultra cycling events in Latvia');
    });
  });

  test.describe('Viewport and charset', () => {
    test('should have viewport meta tag', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
    });

    test('should have UTF-8 charset', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      const charset = await page.locator('meta[charset]').getAttribute('charset');
      expect(charset?.toLowerCase()).toBe('utf-8');
    });
  });

  test.describe('Favicon', () => {
    test('should have favicon link', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
      expect(favicon).toBeTruthy();
      expect(favicon).toContain('favicon.ico');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy in LV', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // h1 should be visible
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('should have proper heading hierarchy in EN', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/en/egipte-malta');

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // h1 should be visible
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('should have ARIA labels for navigation elements', async ({ page, context }) => {
      await context.addCookies([{
        name: 'language_preference',
        value: 'lv',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/egipte-malta');

      // Check for buttons with aria labels or text content
      const prevButton = page.getByRole('button', { name: /previous|iepriekšējais/i });
      const nextButton = page.getByRole('button', { name: /next|nākamais/i });

      // At least one navigation element should exist
      const hasPrevOrNext = (await prevButton.count()) > 0 || (await nextButton.count()) > 0;
      expect(hasPrevOrNext).toBe(true);
    });
  });
});
