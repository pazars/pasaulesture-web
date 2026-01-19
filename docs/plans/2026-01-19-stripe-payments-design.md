# Stripe Payments Integration Design

**Date:** 2026-01-19
**Status:** Approved
**Reference:** [Stripe Checkout One-Time Payments](https://github.com/stripe-samples/checkout-one-time-payments)

## Overview

Integrate Stripe Checkout (hosted payment page) to accept event registrations with full database persistence and webhook handling.

## Architecture

### Tech Stack
- **Payment Provider:** Stripe Checkout (Hosted)
- **Database:** Vercel Postgres
- **Webhook Handler:** Next.js API Route
- **Price Source:** Stripe Products API (single source of truth)

### Payment Flow

1. **Checkout Page Load** (`/[locale]/[slug]/checkout`)
   - Fetch active Stripe prices via API route (`/api/stripe/prices`)
   - Match prices to event distances using metadata (`event_slug`, `distance_index`)
   - Display matched price
   - If no price found: block checkout, show error message

2. **User Submits Form**
   - Validate form client-side (name, email, terms)
   - POST to `/api/checkout/create-session` with:
     - `eventSlug`, `distanceIndex`, `name`, `email`
   - API creates Stripe Checkout Session with:
     - Price ID from Stripe
     - Customer metadata (all registration data)
     - Success URL: `/[locale]/[slug]/checkout/success?session_id={CHECKOUT_SESSION_ID}`
     - Cancel URL: `/[locale]/[slug]/checkout` (back to form)
   - Returns `{sessionId, url}`

3. **Stripe Checkout Redirect**
   - User redirected to Stripe's hosted payment page
   - Stripe handles payment collection, validation, 3D Secure

4. **Post-Payment**
   - **Success:** Redirect to success page, webhook fires
   - **Cancel:** Return to checkout form (no charge)

5. **Webhook Processing** (`checkout.session.completed`)
   - Verify webhook signature
   - Extract customer data from session metadata
   - Insert registration into Postgres `registrations` table
   - Stripe sends confirmation email (configured in Dashboard)

## Component Structure

### New Files

#### 1. `/app/api/stripe/prices/route.ts` (GET)
- Fetches all active Stripe prices
- Filters products with metadata: `event_slug` and `distance_index`
- Returns: `[{priceId, eventSlug, distanceIndex, amount}]`
- Cached for 5 minutes (Next.js revalidate)

#### 2. `/app/api/checkout/create-session/route.ts` (POST)
**Request Body:**
```json
{
  "eventSlug": "egipte-malta",
  "distanceIndex": 0,
  "name": "Jānis Bērziņš",
  "email": "janis@example.com"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Logic:**
- Look up price ID from Stripe API (by metadata match)
- Create Stripe Checkout Session with:
  - `line_items`: matched price
  - `customer_email`: pre-fill from form
  - `metadata`: all registration data (event, distance, participant info, locale)
  - `success_url` and `cancel_url` with locale
- Return session ID and redirect URL

#### 3. `/app/api/webhooks/stripe/route.ts` (POST)
- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- Handles `checkout.session.completed` event
- Extracts metadata from session
- Inserts registration into `registrations` table
- Returns 200 OK (always, even on error to prevent retries)

#### 4. `/app/[locale]/[slug]/checkout/success/page.tsx` (New)
- Server component
- Retrieves `session_id` from query params
- Fetches session from Stripe API to display confirmation
- Shows: participant name, event name, distance, amount paid
- Handles expired/invalid session gracefully (generic success message)
- Includes link back to event page

### Modified Files

#### 5. `/app/components/CheckoutForm.tsx`
**Changes:**
- Remove mock `alert()` submission
- Fetch price from `/api/stripe/prices` on mount
- Display Stripe price (no fallback to `events.ts`)
- If price not found: disable submit, show error
- On submit: POST to `/api/checkout/create-session`
- On success: redirect to `session.url` (Stripe Checkout)
- Show loading state during API call
- Handle API errors gracefully

#### 6. `/app/data/events.ts`
**Changes:**
- Remove `price` field from `EventDistance` interface (no longer used)
- Prices managed exclusively in Stripe Dashboard

## Database Schema

### Postgres Table: `registrations`

```sql
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,

  -- Stripe data
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  amount_paid INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'eur',

  -- Event data
  event_slug VARCHAR(100) NOT NULL,
  distance_index INTEGER NOT NULL,

  -- Participant data
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,

  -- Metadata
  locale VARCHAR(5) DEFAULT 'lv',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_slug ON registrations(event_slug);
CREATE INDEX idx_participant_email ON registrations(participant_email);
CREATE INDEX idx_created_at ON registrations(created_at);
```

**Design Decisions:**
- `stripe_session_id` is unique to prevent duplicate registrations
- Store `distance_index` (not distance name) to handle translation changes
- Amount stored in cents (Stripe's format) to avoid floating-point issues
- Timestamps for audit trail and sorting
- Indexes on common query fields

**Migration File:** `/app/db/migrations/001_create_registrations.sql`

## Stripe Configuration

### Products and Prices Setup

For each event distance, create a Stripe Product with:

**Product Metadata:**
```json
{
  "event_slug": "egipte-malta",
  "distance_index": "0"
}
```

**Price:**
- Amount: 6900 (€69.00)
- Currency: EUR
- Type: One-time
- Active: true

**Example Products:**
1. Product: "Ēģipte-Malta - Adventure"
   - Metadata: `{event_slug: "egipte-malta", distance_index: "0"}`
   - Price: €69

2. Product: "Ēģipte-Malta - Challenge"
   - Metadata: `{event_slug: "egipte-malta", distance_index: "1"}`
   - Price: €69

3. Product: "Parīze-Dakara - Long"
   - Metadata: `{event_slug: "parize-dakara", distance_index: "0"}`
   - Price: €69

### Webhook Configuration

**Production:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**Local Development:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
- Copy webhook secret from CLI output
- Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Environment Variables

### Required Variables

Create `.env.local` with the following:

```bash
# Stripe API Keys (from Stripe Dashboard → Developers → API keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (from Stripe Dashboard → Webhooks or Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel Postgres (from Vercel Dashboard → Storage → Postgres)
POSTGRES_URL=postgres://...
```

### Getting the Keys

**Stripe Keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy "Secret key" → `STRIPE_SECRET_KEY`
4. Use test keys for development, live keys for production

**Webhook Secret:**
- **Production:** From Stripe Dashboard → Webhooks → endpoint details
- **Local:** From `stripe listen` CLI output

**Postgres URL:**
1. Create Vercel Postgres database in Vercel Dashboard
2. Go to Storage → Postgres → .env.local tab
3. Copy `POSTGRES_URL` value

## Webhook Handling

### Security
- Verify Stripe signature using `stripe.webhooks.constructEvent()`
- Return 400 if signature invalid (prevents replay attacks)
- Use raw request body (not parsed JSON)

### Event Processing

```typescript
switch (event.type) {
  case 'checkout.session.completed':
    const session = event.data.object;

    // Extract metadata
    const {
      event_slug,
      distance_index,
      participant_name,
      participant_email,
      locale
    } = session.metadata;

    // Insert into database
    await sql`
      INSERT INTO registrations (
        stripe_session_id,
        stripe_payment_intent_id,
        amount_paid,
        currency,
        event_slug,
        distance_index,
        participant_name,
        participant_email,
        locale
      ) VALUES (
        ${session.id},
        ${session.payment_intent},
        ${session.amount_total},
        ${session.currency},
        ${event_slug},
        ${parseInt(distance_index)},
        ${participant_name},
        ${participant_email},
        ${locale}
      )
      ON CONFLICT (stripe_session_id) DO NOTHING
    `;

    break;
}
```

### Idempotency
- Use `ON CONFLICT (stripe_session_id) DO NOTHING`
- Handles duplicate webhook deliveries gracefully
- Stripe may send same webhook multiple times

### Error Handling
- Catch database errors, log them
- Always return 200 OK to prevent Stripe retries
- Failed inserts logged for manual review

### Testing Locally

**1. Start Stripe CLI listener:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**2. Copy webhook secret to `.env.local`:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_...  # from CLI output
```

**3. Trigger test events:**
```bash
stripe trigger checkout.session.completed
```

**4. Test full flow:**
- Run dev server: `npm run dev`
- Navigate to checkout page
- Use test card: `4242 4242 4242 4242` (any future date, any CVC)
- Complete payment
- Check webhook logs in CLI
- Verify database insert

## Error Handling

### 1. Price Not Found in Stripe
- Block checkout form submission
- Show error message: "Registration is temporarily unavailable. Please contact us at pasaulesture@gmail.com"
- Don't display price field
- Admin must configure Stripe products correctly

### 2. Checkout Session Creation Fails
- Show user-friendly error: "Unable to start checkout. Please try again."
- Log detailed error server-side
- Keep form data intact (localStorage)
- Retry button available

### 3. User Closes Stripe Checkout (Cancel)
- Redirect back to checkout form
- Preserve form data via localStorage (already implemented)
- No charge made, no registration created
- User can retry

### 4. Payment Fails at Stripe
- Stripe handles error UI (card declined, insufficient funds, etc.)
- User can retry with different payment method
- No webhook fires, no database entry

### 5. Webhook Delivery Fails
- Payment succeeds, but webhook doesn't reach server
- User sees success page (payment completed)
- Admin must manually check Stripe Dashboard
- Future: admin panel to sync Stripe → database

### 6. Database Connection Failure
- Webhook returns 500, Stripe retries automatically
- Log error for investigation
- Check Vercel Postgres status

### 7. Duplicate Webhook Delivery
- `ON CONFLICT DO NOTHING` prevents duplicate registrations
- Idempotent by design

### 8. Session ID Invalid/Expired (Success Page)
- Stripe sessions expire after 24 hours
- Show generic success message: "Thank you for registering!"
- Don't fail if session can't be retrieved
- Log warning for investigation

### 9. Session Doesn't Match Event (Success Page)
- Validate `event_slug` in session metadata matches URL
- Redirect to correct event if mismatch
- Prevents URL manipulation

## Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "stripe": "^17.6.0",
    "@vercel/postgres": "^0.10.0"
  }
}
```

## Testing Strategy

### Unit Tests (Vitest)
- Price matching logic (metadata → event/distance)
- Metadata extraction from Stripe sessions
- Error handling for missing prices

### E2E Tests (Playwright)
- Full checkout flow (use Stripe test mode)
- Success page rendering
- Cancel flow (return to checkout)
- Error states (price not found, API failure)

### Manual Testing Checklist
- [ ] Create Stripe test products with metadata
- [ ] Test checkout with test card (4242...)
- [ ] Verify webhook fires locally (Stripe CLI)
- [ ] Verify database insert
- [ ] Test success page displays correctly
- [ ] Test cancel flow (no charge)
- [ ] Test invalid session ID on success page
- [ ] Test both locales (LV, EN)
- [ ] Test multiple events and distances

## Local Development Setup

### Step 1: Install Dependencies
```bash
npm install stripe @vercel/postgres
```

### Step 2: Create Vercel Postgres Database
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Storage → Create Database → Postgres
4. Copy connection string to `.env.local`

### Step 3: Run Database Migration
```sql
-- Run in Vercel Postgres console or via psql
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  amount_paid INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'eur',
  event_slug VARCHAR(100) NOT NULL,
  distance_index INTEGER NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,
  locale VARCHAR(5) DEFAULT 'lv',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_slug ON registrations(event_slug);
CREATE INDEX idx_participant_email ON registrations(participant_email);
CREATE INDEX idx_created_at ON registrations(created_at);
```

### Step 4: Configure Stripe Test Mode
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. Toggle to "Test mode" (top right)
3. Create test products with metadata (see "Stripe Configuration" section)
4. Copy API keys to `.env.local`

### Step 5: Set Up Stripe CLI
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Step 6: Start Development Server
```bash
npm run dev
```

### Step 7: Test Checkout Flow
1. Navigate to `http://localhost:3000/egipte-malta/checkout`
2. Fill out form
3. Use test card: `4242 4242 4242 4242`
4. Expiry: any future date
5. CVC: any 3 digits
6. Complete payment
7. Check Stripe CLI logs for webhook
8. Verify database insert in Vercel Postgres console

## Production Deployment

### Step 1: Environment Variables
Add to Vercel project settings:
- `STRIPE_SECRET_KEY` (live key: `sk_live_...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key: `pk_live_...`)
- `STRIPE_WEBHOOK_SECRET` (from production webhook endpoint)
- `POSTGRES_URL` (automatically set by Vercel)

### Step 2: Create Live Stripe Products
1. Switch to "Live mode" in Stripe Dashboard
2. Create products with same metadata structure
3. Verify prices are correct (live money!)

### Step 3: Configure Production Webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`
4. Copy webhook signing secret to Vercel env vars

### Step 4: Deploy
```bash
git push origin main  # or deploy via Vercel Dashboard
```

### Step 5: Verify Production
- [ ] Test checkout with live card (small amount)
- [ ] Verify webhook fires (check Stripe Dashboard → Webhooks → endpoint logs)
- [ ] Verify database insert
- [ ] Test success page
- [ ] Verify Stripe sends confirmation email

## Future Enhancements

1. **Admin Dashboard**
   - View all registrations
   - Export to CSV
   - Sync Stripe → database (for missed webhooks)

2. **Email Notifications**
   - Custom confirmation emails (via SendGrid, Resend, etc.)
   - Admin notification on new registration

3. **Rate Limiting**
   - Prevent abuse (5 sessions per email per hour)
   - Use Vercel Edge Config or Redis

4. **Refunds**
   - Handle `charge.refunded` webhook
   - Update registration status in database

5. **Payment Status**
   - Add `status` field to registrations (paid, refunded, canceled)
   - Handle partial refunds

6. **Multi-currency Support**
   - EUR, USD, GBP based on user location
   - Automatic conversion via Stripe

7. **Promo Codes**
   - Stripe Checkout supports promo codes
   - Enable in Stripe Dashboard

## Success Criteria

- [x] Users can complete payment via Stripe Checkout
- [x] Registrations stored in Postgres database
- [x] Webhooks process successfully
- [x] Success page displays confirmation
- [x] Prices managed exclusively in Stripe Dashboard
- [x] Both locales (LV, EN) work correctly
- [x] Idempotent webhook handling (no duplicates)
- [x] Graceful error handling for all edge cases
- [x] Local development workflow documented
- [x] Production deployment checklist provided

## References

- [Stripe Checkout Quickstart](https://docs.stripe.com/checkout/quickstart)
- [Stripe Webhooks Guide](https://docs.stripe.com/webhooks)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Stripe Testing Cards](https://docs.stripe.com/testing#cards)
