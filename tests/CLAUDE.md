# Test Suite Documentation

This directory contains all tests for the Pasaules Tūre website, covering both unit tests (Vitest) and end-to-end tests (Playwright).

## Test Structure

```
tests/
├── unit/                    # Unit tests (Vitest)
│   ├── proxy.test.ts       # Proxy middleware logic tests
│   └── translations.test.ts # Translation coverage tests
└── e2e/                     # End-to-end tests (Playwright)
    ├── language-switching.spec.ts  # Language functionality tests
    ├── navigation.spec.ts          # Navigation and routing tests
    └── seo-metadata.spec.ts        # SEO and metadata tests
```

## Running Tests

### Unit Tests (Vitest)
```bash
npm test              # Run all unit tests
npm test -- --watch   # Run in watch mode
npm test -- --ui      # Run with UI
```

### E2E Tests (Playwright)
```bash
npm run test:e2e             # Run all E2E tests (all browsers)
npm run test:e2e:ui          # Run with Playwright UI
npm run test:e2e -- --project=chromium  # Run only in Chromium
npm run test:e2e -- --headed # Run with browser visible
```

### Run All Tests
```bash
npm test && npm run test:e2e -- --project=chromium
```

## Test Coverage

### Unit Tests (34 tests)

**Proxy Tests** (`tests/unit/proxy.test.ts`) - 19 tests
- Static file and API route exclusion
- Locale detection from URL path
- Cookie-based locale preference
- Accept-Language header parsing
- Default locale fallback
- URL redirects and rewrites
- Cookie setting behavior
- Edge cases (root path, invalid locales, complex headers)

**Translation Tests** (`tests/unit/translations.test.ts`) - 15 tests
- Key parity between `lv.json` and `en.json`
- No empty translations
- Translation completeness for all UI sections
- No placeholder text (TODO, FIXME, etc.)
- Quality checks for duplicate values

### E2E Tests (43 tests)

**Language Switching** (`tests/e2e/language-switching.spec.ts`) - 16 tests
- URL-based locale routing (LV clean URLs, EN `/en/` prefix)
- `/lv/` prefix redirects to clean URLs
- Language switcher functionality (LV ↔ EN)
- Active button highlighting
- Cookie persistence
- No hydration errors
- Static pages (privacy policy, terms)

**Navigation** (`tests/e2e/navigation.spec.ts`) - 14 tests
- Event-to-event navigation maintains locale
- Footer link navigation (privacy, terms)
- Browser back/forward buttons work correctly
- Direct URL access respects locale cookie
- External links (mailto, Google Maps)

**SEO & Metadata** (`tests/e2e/seo-metadata.spec.ts`) - 13 tests
- HTML `lang` attribute correctness
- Page titles (with/without macrons for LV/EN)
- Meta descriptions (localized)
- Viewport and charset tags
- Favicon presence
- Heading hierarchy (single h1)
- ARIA labels for navigation

## Test Configuration

### Vitest (`vitest.config.ts`)
- **Include**: `**/*.test.ts` (unit tests only)
- **Exclude**: E2E tests (`**/*.spec.ts`), node_modules
- **Path alias**: `@/` maps to project root
- **Globals**: Enabled for cleaner test syntax

### Playwright (`playwright.config.ts`)
- **Test match**: `**/*.spec.ts` (E2E tests only)
- **Base URL**: `http://localhost:3000`
- **Auto-start dev server**: Yes (via `webServer` config)
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 on CI, 0 locally
- **Parallel**: Full parallel execution

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = processInput(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should show correct language', async ({ page, context }) => {
  // Set up locale preference
  await context.addCookies([{
    name: 'PARAGLIDE_LOCALE',
    value: 'lv',
    domain: 'localhost',
    path: '/',
  }]);

  // Navigate
  await page.goto('/egipte-malta');

  // Assert
  const langAttr = await page.locator('html').getAttribute('lang');
  expect(langAttr).toBe('lv');
});
```

## Cookie Setup for E2E Tests

All E2E tests should set the locale cookie before navigation:

```typescript
await context.addCookies([{
  name: 'PARAGLIDE_LOCALE',
  value: 'lv', // or 'en'
  domain: 'localhost',
  path: '/',
}]);
```

This ensures consistent behavior and avoids race conditions with Accept-Language header detection.

## Common Patterns

### Testing Language Switching
1. Set initial locale cookie
2. Navigate to page
3. Click language switcher button
4. Assert URL changed
5. Assert `lang` attribute updated
6. Assert content is in correct language

### Testing Locale Persistence
1. Set locale cookie
2. Navigate between pages
3. Assert locale cookie persists
4. Assert all pages show same language

### Testing Translations
1. Check both `lv.json` and `en.json` have same keys
2. Verify no empty values
3. Check for specific translation categories (FAQ, events, etc.)

## Debugging Tests

### Playwright Debugging
```bash
# Run with UI for interactive debugging
npm run test:e2e:ui

# Run headed to see browser
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- tests/e2e/navigation.spec.ts

# Run specific test by line number
npm run test:e2e -- tests/e2e/navigation.spec.ts:28

# Debug mode (pauses on failure)
npm run test:e2e -- --debug
```

### Vitest Debugging
```bash
# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- tests/unit/proxy.test.ts

# Run with UI
npm test -- --ui
```

## CI/CD Integration

Tests are designed to run in CI environments:

- **Vitest**: Fast, runs in Node.js without browser
- **Playwright**: Auto-installs browsers on CI
- **No flakiness**: All tests use proper waits and cookies
- **Parallel execution**: Tests run in parallel for speed
- **Retries**: Playwright retries 2 times on CI only

### GitHub Actions Example
```yaml
- name: Run unit tests
  run: npm test

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e -- --project=chromium
```

## Test Maintenance

### When Adding New Translations
1. Add keys to both `messages/lv.json` and `messages/en.json`
2. Run `npm test` - translation coverage tests will fail if keys don't match
3. Fix any missing keys

### When Changing Routes
1. Update E2E navigation tests if route structure changes
2. Update proxy tests if locale detection logic changes

### When Adding New Pages
1. Add SEO tests for new pages (lang, title, description)
2. Add navigation tests if page is linked from other pages

### When Changing Locale Logic
1. Update proxy unit tests
2. Update E2E tests that depend on locale detection
3. Verify cookie behavior still works correctly

## Performance

- **Unit tests**: ~300ms (34 tests)
- **E2E tests**: ~28s (43 tests, Chromium only)
- **Total**: ~28.3s for full test suite

## Known Limitations

1. **E2E tests require dev server**: Tests automatically start `npm run dev`
2. **Browser tests only**: E2E tests require browser context
3. **English default in tests**: Playwright's Accept-Language defaults to English, so tests always set cookies explicitly
