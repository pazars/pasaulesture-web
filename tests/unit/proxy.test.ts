import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '@/proxy';

// Helper to create a mock NextRequest
function createRequest(url: string, options: {
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
} = {}) {
  const request = new NextRequest(new URL(url, 'http://localhost:3000'));

  // Mock cookies
  if (options.cookies) {
    const cookieStore = request.cookies;
    vi.spyOn(cookieStore, 'get').mockImplementation((name: string) => {
      if (options.cookies?.[name]) {
        return { name, value: options.cookies[name] } as any;
      }
      return undefined;
    });
  }

  // Mock headers
  if (options.headers) {
    vi.spyOn(request.headers, 'get').mockImplementation((name: string) => {
      return options.headers?.[name.toLowerCase()] || null;
    });
  }

  return request;
}

describe('Proxy middleware', () => {
  describe('Static files and API routes', () => {
    it('should skip static files', () => {
      const request = createRequest('/_next/static/chunk.js');
      const response = proxy(request);

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('should skip API routes', () => {
      const request = createRequest('/api/events');
      const response = proxy(request);

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('should skip files with extensions', () => {
      const request = createRequest('/favicon.ico');
      const response = proxy(request);

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('should process regular routes', () => {
      const request = createRequest('/egipte-malta');
      const response = proxy(request);

      // Should not be skipped
      expect(response.headers.get('x-middleware-next')).not.toBe('1');
    });
  });

  describe('Locale detection from URL', () => {
    it('should detect /lv/ prefix and redirect to clean URL', () => {
      const request = createRequest('/lv/egipte-malta');
      const response = proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/egipte-malta');

      // Should set cookie to lv
      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('language_preference=lv');
    });

    it('should keep /en/ prefix and set cookie', () => {
      const request = createRequest('/en/egipte-malta');
      const response = proxy(request);

      // Should not redirect
      expect(response.status).toBe(200);

      // Should set cookie to en
      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('language_preference=en');
    });
  });

  describe('Locale preference detection', () => {
    it('should respect cookie preference (LV)', () => {
      const request = createRequest('/egipte-malta', {
        cookies: { language_preference: 'lv' },
      });
      const response = proxy(request);

      // Should rewrite to /lv/ internally (status 200, not redirect)
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toContain('/lv/egipte-malta');
    });

    it('should respect cookie preference (EN)', () => {
      const request = createRequest('/egipte-malta', {
        cookies: { language_preference: 'en' },
      });
      const response = proxy(request);

      // Should redirect to /en/
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/en/egipte-malta');
    });

    it('should default to Latvian when no cookie', () => {
      const request = createRequest('/egipte-malta');
      const response = proxy(request);

      // Should rewrite to /lv/ internally (default locale)
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toContain('/lv/egipte-malta');
    });
  });

  describe('Cookie setting', () => {
    it('should set cookie with correct expiry', () => {
      const request = createRequest('/egipte-malta');
      const response = proxy(request);

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('language_preference=lv');
      expect(setCookie).toContain('Path=/');
      expect(setCookie).toContain('Max-Age=2592000'); // 30 days
    });

    it('should set cookie on redirect', () => {
      const request = createRequest('/lv/egipte-malta');
      const response = proxy(request);

      expect(response.status).toBe(307);
      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('language_preference=lv');
    });

    it('should set cookie on rewrite', () => {
      const request = createRequest('/egipte-malta');
      const response = proxy(request);

      expect(response.status).toBe(200);
      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('language_preference=lv');
    });
  });

  describe('Query parameter preservation', () => {
    it('should preserve query params when rewriting to /lv/', () => {
      const request = createRequest('/egipte-malta/checkout/success?session_id=cs_test_123');
      const response = proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toContain('/lv/egipte-malta/checkout/success');
      expect(response.headers.get('x-middleware-rewrite')).toContain('session_id=cs_test_123');
    });

    it('should preserve query params when redirecting to /en/', () => {
      const request = createRequest('/egipte-malta/checkout/success?session_id=cs_test_123', {
        cookies: { language_preference: 'en' },
      });
      const response = proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/en/egipte-malta/checkout/success?session_id=cs_test_123');
    });

    it('should preserve query params when redirecting from /lv/ to clean URL', () => {
      const request = createRequest('/lv/egipte-malta/checkout/success?session_id=cs_test_123');
      const response = proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/egipte-malta/checkout/success?session_id=cs_test_123');
    });

    it('should preserve multiple query params', () => {
      const request = createRequest('/egipte-malta/checkout?distance=1&promo=test');
      const response = proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toContain('/lv/egipte-malta/checkout');
      expect(response.headers.get('x-middleware-rewrite')).toContain('distance=1');
      expect(response.headers.get('x-middleware-rewrite')).toContain('promo=test');
    });
  });

  describe('Edge cases', () => {
    it('should handle root path', () => {
      const request = createRequest('/');
      const response = proxy(request);

      // Should rewrite to /lv/ by default
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toContain('/lv/');
    });

    it('should handle root path with EN cookie', () => {
      const request = createRequest('/', {
        cookies: { language_preference: 'en' },
      });
      const response = proxy(request);

      // Should redirect to /en/
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/en/');
    });

    it('should ignore invalid locale in cookie', () => {
      const request = createRequest('/egipte-malta', {
        cookies: { language_preference: 'fr' },
      });
      const response = proxy(request);

      // Should default to Latvian
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toContain('/lv/egipte-malta');
    });
  });
});
