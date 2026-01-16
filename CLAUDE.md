# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pasaules Tūre website - a Next.js 16 application for ultra cycling events in Latvia.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing
- `npm test` - Run unit tests (Vitest)
- `npm run test:e2e` - Run E2E tests (Playwright, all browsers)
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e -- --project=chromium` - Run E2E tests in Chromium only

### Internationalization
- `npm run build:i18n` - Compile translations (run after changing messages/*.json)
- `npm run machine-translate` - Auto-translate missing keys using inlang

## Architecture

- **Framework**: Next.js 16 with App Router (Turbopack)
- **Styling**: Tailwind CSS v4 (via PostCSS)
- **i18n**: Paraglide-js with URL-based routing (compiled files committed)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Path alias**: `@/*` maps to project root

## Project Structure

```
app/
├── layout.tsx           # Root layout (imports globals.css)
├── [locale]/            # Locale-based routing
│   ├── layout.tsx       # Locale layout (html/body tags, fonts, metadata)
│   ├── page.tsx         # Home page (redirects to nearest event)
│   ├── [slug]/page.tsx  # Dynamic event pages
│   ├── privatuma-politika/  # Privacy policy page
│   ├── noteikumi/       # Terms page
│   ├── kontakti/        # Contact page
│   └── components/
│       ├── EventPage.tsx        # Main event page component
│       ├── Header.tsx           # Navigation header with event buttons
│       ├── FAQ.tsx              # FAQ accordion component
│       ├── Icons.tsx            # SVG icon components
│       ├── LanguageSwitcher.tsx # LV/EN language toggle
│       └── LocaleProvider.tsx   # Client-side locale sync
├── data/
│   ├── events.ts        # Event data and types
│   ├── events.server.ts # Server-side image utilities
│   └── contact.ts       # Centralized contact information
└── globals.css          # Design system (colors, animations, patterns)

messages/
├── lv.json              # Latvian translations
└── en.json              # English translations

paraglide/
└── runtime.ts           # Generated i18n runtime (auto-generated)

proxy.ts                 # Locale detection and URL routing
project.inlang/          # Inlang i18n configuration

tests/
├── unit/                # Vitest unit tests
│   ├── proxy.test.ts
│   └── translations.test.ts
└── e2e/                 # Playwright E2E tests
    ├── language-switching.spec.ts
    ├── navigation.spec.ts
    └── seo-metadata.spec.ts
```

## Design System

### Colors (CSS variables in globals.css)

- **Forest palette**: `forest-deep`, `forest-medium`, `forest-light`, `moss`
- **Accent**: `amber`, `amber-light`, `amber-glow`
- **Neutrals**: `earth-dark`, `earth-warm`, `stone`, `sand`, `cream`, `cream-light`

### Typography

- **Display font**: Archivo Black (`.font-display` class)
- **Body font**: DM Sans (default)

### CSS Utilities (globals.css)

- `.hero-overlay` - Gradient overlay for hero images
- `.topo-pattern` / `.topo-pattern-light` - Topographic line backgrounds
- `.noise-overlay` - Subtle grain texture
- `.glass` / `.glass-dark` - Glassmorphism effects
- `.btn-primary` / `.btn-secondary` - Button styles
- `.card-elevated` - Elevated card with hover effect
- `.section-divider` - Gradient divider line
- Animation classes: `.animate-fade-in-up`, `.animate-float`, `.animate-pulse-glow`

### Layout Patterns

- All sections use `rounded-3xl` corners
- Section spacing: `mt-6 mx-2`
- Content constrained to `max-w-5xl` on desktop

## Internationalization (i18n)

### URL Structure
- **Latvian (default)**: Clean URLs without locale prefix
  - `/egipte-malta` (Latvian)
  - `/privatuma-politika` (Latvian)
- **English**: URLs with `/en/` prefix
  - `/en/egipte-malta` (English)
  - `/en/privatuma-politika` (English)
- **Redirect behavior**: `/lv/...` always redirects to clean URL

### Locale Detection Priority (proxy.ts)
1. `PARAGLIDE_LOCALE` cookie
2. `Accept-Language` header
3. Default to Latvian (`lv`)

### Translation Files
- Located in `messages/lv.json` and `messages/en.json`
- Keys must exist in both files (enforced by tests)
- Use `m.key_name()` to access translations (imported from `@/paraglide/messages`)

### Adding Translations
1. Add key to both `messages/lv.json` and `messages/en.json`
2. Import and use: `import * as m from "@/paraglide/messages";`
3. Use in code: `m.your_key_name()`
4. Run tests to verify: `npm test`

### Components
- **LanguageSwitcher**: Client component for LV/EN toggle
  - Sets cookie before navigation to prevent redirects
  - Uses `router.push()` for client-side navigation
- **LocaleProvider**: Syncs locale between server and client
  - Prevents hydration mismatches
  - Required wrapper in `[locale]/layout.tsx`

### Long-Form Content Pages

For pages with extensive content (like privacy policies or terms), use **locale-specific component files** instead of translation keys:

**Structure:**
```
app/[locale]/page-name/
├── page.tsx                    # Main page (imports locale-specific content)
├── content/
│   ├── Content.lv.tsx         # Latvian content
│   └── Content.en.tsx         # English content
```

**Example:** Privacy Policy (`privatuma-politika`)
- Title uses translation key: `m.page_privacy_title()`
- Full content in separate components: `PrivacyContent.lv.tsx` / `PrivacyContent.en.tsx`
- Benefits: Better formatting, type safety, no translation file bloat

**Note:** Only `page_privacy_title` exists in `messages/*.json` - the full policy content is handled in component files.

## Key Patterns

- Event images stored in `public/events/{slug}/`
- Home page redirects to closest upcoming event
- Distance selection defaults to full distance (last item)
- Facts bar shows: Surface type (row 1), Location/Date/Time limit (row 2)
- Distance buttons show: Name, Distance (km), Elevation (m)
- HTML lang attribute set in `app/[locale]/layout.tsx` (not root layout)
- Metadata (title, description) generated per-locale in `generateMetadata()`

## Contact Information

**Centralized Configuration**: All contact information is stored in `app/data/contact.ts` as a single source of truth.

### CONTACT_INFO Object
```typescript
{
  email: "pasaulesture@gmail.com",
  organizationName: "Biedrība \"Pasaules Tūre\"",
  registrationNumber: "40008345302",
  address: "Vestienas iela 43, Rīga LV-1035",
  bankAccount: "LV50HABA0551060828205",
}
```

### Usage
Import and use the `CONTACT_INFO` object wherever contact details are needed:

```typescript
import { CONTACT_INFO } from "@/app/data/contact";

// Email example
<a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>

// Organization name example
<p>{CONTACT_INFO.organizationName}</p>
```

### Where It's Used
- **Contact Page** (`app/[locale]/kontakti/`) - Displays all contact info
- **Privacy Policy** - Organization details and contact email
- **Terms Page** - Seller information and complaint email
- **FAQ Component** - "Contact us" mailto link
- **Footer** - Contact page link

### Updating Contact Info
1. Edit values in `app/data/contact.ts`
2. Changes automatically propagate to all pages
3. Run `npm test` to verify consistency
4. Tests will catch any missed hardcoded values

## Testing

See [tests/CLAUDE.md](tests/CLAUDE.md) for comprehensive testing documentation.

### Quick Start
```bash
# Run all unit tests
npm test

# Run all E2E tests (Chromium only, faster)
npm run test:e2e -- --project=chromium

# Run specific test file
npm run test:e2e -- tests/e2e/language-switching.spec.ts
```

### Test Coverage
- **250 total tests** (43 unit + 207 E2E)
- Proxy routing logic
- Translation completeness
- Language switching functionality
- SEO metadata (lang, title, description)
- Navigation between pages
- Cookie persistence
- Contact page functionality
- Contact information consistency across all pages
- Centralized configuration validation

## Deployment

### Committed Paraglide Files

The `paraglide/` directory is **committed to git** (not gitignored) to avoid build-time compilation issues on Vercel.

**Workflow:**
1. Edit translations in `messages/lv.json` or `messages/en.json`
2. Run `npm run build:i18n` to recompile paraglide files
3. Commit both the message files and the regenerated paraglide files
4. Push to deploy

**Why this approach:**
- ❌ Build-time compilation (`paraglide-js compile`) was hanging on Vercel
- ❌ The inlang plugins need to be fetched from CDN during compilation, causing timeouts
- ✅ Committing compiled files bypasses the compilation step entirely
- ✅ Faster builds on Vercel
- ✅ More reliable deployments
