# Test Suite Documentation

This directory contains all tests for the Pasaules Tūre website, covering both unit tests (Vitest) and end-to-end tests (Playwright).

## Test Structure

```
tests/
├── unit/                    # Unit tests (Vitest)
│   ├── proxy.test.ts       # Proxy middleware logic tests
│   └── translations.test.ts # Translation coverage tests
└── e2e/                     # End-to-end tests (Playwright)
    ├── language-switching.spec.ts       # Language functionality tests
    ├── navigation.spec.ts               # Navigation and routing tests
    ├── seo-metadata.spec.ts             # SEO and metadata tests
    ├── static-pages.spec.ts             # Static page navigation tests
    ├── checkout-page.spec.ts            # Checkout page loading & routing
    ├── checkout-form-interaction.spec.ts # Checkout form validation & interaction
    ├── checkout-selection.spec.ts       # Event & distance selection
    ├── checkout-language.spec.ts        # Checkout language switching
    ├── event-to-checkout.spec.ts        # Event page → checkout flow
    └── terms-page.spec.ts               # Terms page tests
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

### Unit Tests (38 tests)

**Proxy Tests** (`tests/unit/proxy.test.ts`) - 19 tests
- Static file and API route exclusion
- Locale detection from URL path
- Cookie-based locale preference
- Accept-Language header parsing
- Default locale fallback
- URL redirects and rewrites
- Cookie setting behavior
- Edge cases (root path, invalid locales, complex headers)

**Translation Tests** (`tests/unit/translations.test.ts`) - 19 tests
- Key parity between `lv.json` and `en.json`
- No empty translations
- Translation completeness for all UI sections (including checkout)
- No placeholder text (TODO, FIXME, etc.)
- Quality checks for duplicate values
- Checkout-specific translation keys
- Register button translations
- Terms page translations

### E2E Tests (184 tests across 10 files)

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

**Static Pages** (`tests/e2e/static-pages.spec.ts`) - 20 tests
- Privacy policy navigation (LV and EN)
- Terms page navigation (LV and EN)
- Home button functionality
- Locale-specific URLs
- AI translation notes (present in EN, absent in LV)
- Contact information validation (registration number, bank account, email)
- Tests for both privacy policy and terms in both languages

**Checkout Page** (`tests/e2e/checkout-page.spec.ts`) - 16 tests
- Page loading for valid/invalid event slugs
- Distance parameter handling (including index 0)
- Distance parameter validation (negative, non-numeric, out of bounds)
- Distance persistence across language switches
- UI elements presence (home button, notice banner)
- Dynamic rendering verification

**Checkout Form Interaction** (`tests/e2e/checkout-form-interaction.spec.ts`) - 36 tests
- Form field updates (name, email, terms checkbox)
- Event and distance selection
- No-scroll behavior on selection changes
- Form validation (empty fields, invalid email formats)
- Multiple validation errors
- Error clearing on correction
- Form submission with placeholder alert
- Loading state during submission
- Terms link opens in new tab with external indicator
- Distance dropdown disabled state for single-distance events

**Checkout Selection** (`tests/e2e/checkout-selection.spec.ts`) - 44 tests
- Index 0 bug fix verification (critical!)
- Distance selection persistence after reload
- Distance selection doesn't revert after interactions
- URL updates on distance changes
- Price updates on distance changes
- Distance facts updates (km, elevation)
- Event selection navigation
- Event name display updates
- Persisted distance loading when changing events
- Default distance selection
- Distance dropdown behavior (visible when disabled)
- Disabled styling verification
- localStorage persistence (distance, event slug)
- Distance restoration from localStorage
- Distance display names in both languages
- No scroll on selection changes

**Checkout Language Switching** (`tests/e2e/checkout-language.spec.ts`) - 24 tests
- URL preservation when switching languages
- Event slug preservation
- Distance parameter preservation
- UI text translation (title, labels, event names, distance names, submit button, notice)
- Form state preservation during language switch (name, email, terms checkbox)
- Terms link locale updates
- Cookie persistence
- Language switcher highlighting
- HTML lang attribute updates

**Event to Checkout Flow** (`tests/e2e/event-to-checkout.spec.ts`) - 42 tests
- Register button navigation (LV and EN)
- Selected distance passed to checkout
- Default distance passed to checkout
- Data consistency (event name, price, facts)
- Browser navigation (back/forward buttons)
- Home button navigation from checkout
- Distance persistence between pages
- Multiple event support
- Separate distance preferences per event
- Register button appearance and styling

**Terms Page** (`tests/e2e/terms-page.spec.ts`) - 27 tests
- Page loading (LV and EN)
- Non-empty content verification
- Home button navigation (LV and EN)
- External link indicators (all external links have SVG icons)
- External links open in new tab
- Content structure (heading hierarchy, no placeholders)
- AI translation notes (present in EN, absent in LV)
- Navigation from checkout page
- SEO metadata (lang attribute, page title)
- Accessibility (aria-label, keyboard navigation)
- Locale-specific content component loading (Content.lv.tsx, Content.en.tsx)
- **Note**: Language switching removed - terms page has no language switcher (matches privacy policy)

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

### Testing Checkout Forms
1. Clear localStorage in `beforeEach` hook
2. Set locale cookie
3. Navigate to checkout page
4. Fill form fields
5. Submit and verify behavior
6. Check localStorage persistence

**Important**: Always clear localStorage between tests to prevent state leakage:
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto("/egipte-malta/checkout");
  await page.evaluate(() => localStorage.clear());
});
```

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
3. Check for specific translation categories (FAQ, events, checkout, etc.)

### Testing Distance Selection (Index 0 Bug)
The "index 0 bug" was a critical issue where selecting the first distance wouldn't persist. Always test:
```typescript
test("should correctly select and persist first distance (index 0)", async ({ page }) => {
  await page.goto("/egipte-malta/checkout?distance=1");

  const distanceSelect = page.locator("select").nth(1);
  await distanceSelect.selectOption("0");

  await expect(page).toHaveURL(/distance=0/);
  await expect(distanceSelect).toHaveValue("0");
});
```

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
4. If adding checkout-related keys, update the `checkoutKeys` array in `tests/unit/translations.test.ts`

### When Changing Routes
1. Update E2E navigation tests if route structure changes
2. Update proxy tests if locale detection logic changes

### When Adding New Pages
1. Add SEO tests for new pages (lang, title, description)
2. Add navigation tests if page is linked from other pages
3. If page has forms, add validation tests
4. If page uses localStorage, add persistence tests

### When Changing Locale Logic
1. Update proxy unit tests
2. Update E2E tests that depend on locale detection
3. Verify cookie behavior still works correctly

### When Modifying Checkout Flow
1. Run checkout-specific test suites:
   ```bash
   npm run test:e2e -- tests/e2e/checkout-*.spec.ts
   ```
2. Verify localStorage persistence still works
3. Test the "index 0 bug" scenario explicitly
4. Verify form validation still catches all errors
5. Test across both locales (LV and EN)

## Performance

- **Unit tests**: ~400ms (38 tests)
- **E2E tests**: ~60-90s (176 tests, Chromium only)
- **Total**: ~1.5 minutes for full test suite

**Note**: Consider running tests selectively during development:
```bash
# Run only checkout tests
npm run test:e2e -- tests/e2e/checkout-*.spec.ts --project=chromium

# Run specific test file
npm run test:e2e -- tests/e2e/checkout-selection.spec.ts --project=chromium
```

## Test Summary

**Total Test Count**: 222 tests
- Unit: 38 tests
- E2E: 184 tests (Chromium)

**Key Features Covered**:
- ✅ Checkout flow (registration form)
- ✅ Event and distance selection
- ✅ Form validation (email, required fields, terms acceptance)
- ✅ localStorage persistence
- ✅ Language switching (LV ↔ EN)
- ✅ Browser navigation (back/forward)
- ✅ Static pages (privacy policy, terms) with AI translation notes
- ✅ Contact information validation (registration number, bank account, email)
- ✅ Terms page (locale-specific components, no language switcher)
- ✅ Translation coverage (100% key parity)
- ✅ SEO metadata (lang, titles)
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ External link indicators
- ✅ Index 0 bug fix verification

**Critical Test Cases**:
1. **Index 0 Bug**: Verified fixed in `checkout-selection.spec.ts`
2. **Form Validation**: All error states tested in `checkout-form-interaction.spec.ts`
3. **localStorage Persistence**: Comprehensive coverage in `checkout-selection.spec.ts`
4. **Language Switching**: Full coverage in `checkout-language.spec.ts`
5. **Event-to-Checkout Flow**: Integration tests in `event-to-checkout.spec.ts`
6. **Contact Information**: Validated across all static pages in `static-pages.spec.ts`
7. **AI Translation Notes**: Verified in both privacy policy and terms pages

## Known Limitations & Best Practices

1. **E2E tests require dev server**: Tests automatically start `npm run dev`
2. **Browser tests only**: E2E tests require browser context
3. **Cookie setup**: Always set `PARAGLIDE_LOCALE` cookie explicitly before navigation to avoid race conditions with Accept-Language header
4. **Alert handling**: Form submission shows placeholder alert - tests must handle dialog
5. **localStorage cleanup**: Must manually clear localStorage in `beforeEach` hooks
6. **Strict mode violations**: When adding LanguageSwitcher to pages, use `.last()`, `.first()`, or specific selectors to avoid matching duplicate elements
7. **SELECT element testing**: Never check visibility of `<option>` text - always check the `<select>` value instead
8. **Timing-sensitive tests**: Avoid cookie setup followed by immediate navigation - prefer direct navigation or wait for page to fully load

### Common Pitfalls

**❌ Bad - Cookie race condition:**
```typescript
await context.addCookies([{ name: 'PARAGLIDE_LOCALE', value: 'lv', ... }]);
await page.goto("/checkout"); // May load with wrong locale
```

**✅ Good - Direct navigation or no cookie:**
```typescript
await page.goto("/checkout"); // Loads with default locale, then switch via UI
// OR
await page.goto("/lv/checkout"); // Direct URL navigation
```

**❌ Bad - Checking option visibility:**
```typescript
await expect(page.getByText("Egypt-Malta")).toBeVisible(); // Fails - options not visible
```

**✅ Good - Checking select value:**
```typescript
const select = page.locator("select").first();
await expect(select).toHaveValue("egipte-malta");
```

**❌ Bad - Strict mode violation:**
```typescript
const content = page.locator("div.max-w-4xl"); // Matches header AND content
```

**✅ Good - Specific selector:**
```typescript
const content = page.locator("div.max-w-4xl").last(); // Gets content div only
```
