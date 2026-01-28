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

## Architecture

- **Framework**: Next.js 16 with App Router (Turbopack)
- **Styling**: Tailwind CSS v4 (via PostCSS)
- **i18n**: next-intl with URL-based routing and middleware
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
│       └── LanguageSwitcher.tsx # LV/EN language toggle
├── data/
│   ├── events.ts        # Event data and types
│   ├── events.server.ts # Server-side image utilities
│   └── contact.ts       # Centralized contact information
└── globals.css          # Design system (colors, animations, patterns)

i18n/
└── request.ts           # next-intl configuration

messages/
├── lv.json              # Latvian translations
└── en.json              # English translations

proxy.ts                 # Locale detection and URL routing (exports next-intl middleware)

tests/
├── unit/                # Vitest unit tests
│   ├── proxy.test.ts
│   └── translations.test.ts
└── e2e/                 # Playwright E2E tests
    ├── language-switching.spec.ts
    ├── navigation.spec.ts
    └── seo-metadata.spec.ts
```

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
1. `language_preference` cookie (expires after 30 days)
2. Default to Latvian (`lv`)

### Translation Files
- Located in `messages/lv.json` and `messages/en.json`
- Keys must exist in both files (enforced by tests)
- JSON format with simple key-value pairs

### Adding Translations
1. Add key to both `messages/lv.json` and `messages/en.json`
2. **Server components**:
   ```tsx
   import { getTranslations } from "next-intl/server";

   const t = await getTranslations();
   <h1>{t("your_key_name")}</h1>
   ```
3. **Client components**:
   ```tsx
   import { useTranslations } from "next-intl";

   const t = useTranslations();
   <button>{t("your_key_name")}</button>
   ```
4. Run tests to verify: `npm test`

### Utilities
- **LanguageSwitcher**: Client component for LV/EN toggle
  - Sets cookie before navigation to prevent redirects
  - Uses `router.push()` for client-side navigation
  - Uses `useLocale()` hook to get current locale
- **useLocale()**: Hook to get current locale in client components
- **getTranslations()**: Async function to get translations in server components

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
- Title uses translation key: `t("page_privacy_title")`
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

## Stripe Payments

### Architecture
- **Payment Flow**: Stripe Checkout (hosted payment page)
- **Database**: Neon Postgres (`registrations` table)
- **Price Management**: Stripe Dashboard (single source of truth)
- **Webhooks**: `checkout.session.completed` → insert registration

### API Routes
- `GET /api/stripe/prices` - Fetch prices with event metadata
- `POST /api/checkout/create-session` - Create checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Environment Variables
```bash
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgres://...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Getting environment variables:**
- Vercel integration: `vercel env pull --environment development`