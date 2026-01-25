# Pasaules Tūre

Ultra cycling events website built with Next.js 16 and Tailwind CSS v4.

## Setup

```bash
npm install
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `forest-deep` | #1a3a2f | Primary dark, headers, buttons |
| `forest-medium` | #2d5a47 | Secondary backgrounds |
| `forest-light` | #3d7a5f | Accents, borders |
| `amber` | #e07b39 | CTA buttons, highlights |
| `amber-light` | #f4a261 | Icons, accent text |
| `cream` | #f5f0e6 | Section backgrounds |
| `cream-light` | #faf8f3 | Page background |
| `earth-dark` | #2c2416 | Body text |
| `stone` | #8b7355 | Muted text |
| `sand` | #d4c4a8 | Borders, dividers |

### Typography

- **Display**: Archivo Black (headings)
- **Body**: DM Sans (content)

### Components

All sections use `rounded-3xl` corners with `mt-6 mx-2` spacing for a friendly, card-based layout.

## Testing Stripe Payments Locally

### Prerequisites
- Stripe account (free)
- Stripe CLI installed: `brew install stripe/stripe-cli/stripe`

### Setup Steps

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get Test API Keys:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - **Top left menu** → Switch to **Test Mode** (sandbox)
   - Navigate to **Developers** → **API Keys**
   - Copy both keys to `.env.local`:
     ```bash
     STRIPE_SECRET_KEY=sk_test_...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```

3. **Create Test Products:**
   - In Stripe Dashboard (Test Mode)
   - Go to **Products** → **+ Add product**
   - Create product with name and price
   - **After creating**, click **Edit product**
   - Scroll to **Metadata** section → **Add metadata**
   - Add two keys (see `stripe-products.txt` for values):
     - Key: `event_slug` → Value: `egipte-malta` or `parize-dakara`
     - Key: `distance_index` → Value: `0`, `1`, etc.
   - Click **Save**
   - Repeat for all event distances

   > **Tip:** Keep a `.gitignored` file (e.g., `stripe-products.txt`) with your product metadata mapping for reference.

4. **Run Database Migration:**
   ```bash
   npm run db:migrate
   ```
   This creates the `registrations` table in your Postgres database.

   **Alternative methods:**
   - **Vercel Console:** Copy contents of `app/db/migrations/001_create_registrations.sql` and run in Vercel Postgres query console
   - **psql:** `psql "$POSTGRES_URL" < app/db/migrations/001_create_registrations.sql`

5. **Set up Webhook Listener:**
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the `whsec_...` secret to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

6. **Start Development Server:**
   ```bash
   npm run dev
   ```

7. **Test a Transaction:**
   - Navigate to `http://localhost:3000/egipte-malta/checkout`
   - Fill out the form
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date and CVC
   - Complete payment

8. **Verify:**
   - Check Stripe CLI terminal for webhook event
   - Check Stripe Dashboard → Payments for transaction
   - Check your database for registration entry

### Product Metadata Reference

Create a file `stripe-products.txt` (gitignored) with this content:

```
Ēģipte-Malta - Piedzīvojums (200km):
  event_slug: egipte-malta
  distance_index: 0

Ēģipte-Malta - Izaicinājums (370km):
  event_slug: egipte-malta
  distance_index: 1

Parīze-Dakāra - Garā distance (380km):
  event_slug: parize-dakara
  distance_index: 0
```

For complete setup guide, see [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md).

## Adding Events

1. Add event data in `app/data/events.ts`
2. Add images to `public/events/{slug}/`
3. Create corresponding Stripe products with metadata
