# Stripe Integration - Local Development Setup

This guide will help you set up and test Stripe payments locally.

## Prerequisites

- Stripe account (free test mode)
- Vercel Postgres database
- Stripe CLI installed

## Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up
2. Verify your email
3. Stay in **Test Mode** (toggle in top right)

## Step 2: Get API Keys

1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal test key")

## Step 3: Create Test Products

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click "+ Add product"
3. For each event distance, create a product:

**Example: Ēģipte-Malta - Adventure**
- Name: `Ēģipte-Malta - Adventure`
- Description: `200km gravel adventure`
- Pricing:
  - Model: One time
  - Price: `69` EUR
- Metadata (click "Add metadata"):
  - Key: `event_slug` → Value: `egipte-malta`
  - Key: `distance_index` → Value: `0`
- Click "Save product"

Repeat for all events and distances (see `app/data/events.ts` for full list).

## Step 4: Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your keys:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...  # Get this from Step 5
   POSTGRES_URL=postgres://...  # From Vercel
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

## Step 5: Install and Configure Stripe CLI

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login:
   ```bash
   stripe login
   ```
   This opens your browser to authenticate.

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret from the CLI output:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```

5. Add it to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Step 6: Run Database Migration

1. Run the SQL migration in Vercel Postgres console:
   ```sql
   -- Copy contents from app/db/migrations/001_create_registrations.sql
   ```

Or use psql:
```bash
psql $POSTGRES_URL < app/db/migrations/001_create_registrations.sql
```

## Step 7: Start Development Server

1. Start Next.js dev server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start Stripe webhook listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Step 8: Test Full Flow

1. Open [http://localhost:3000/egipte-malta/checkout](http://localhost:3000/egipte-malta/checkout)

2. Fill out the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Accept terms

3. Click "Register and Pay"

4. Use test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. Click "Pay"

6. You should be redirected to success page

7. Check Stripe CLI terminal - you should see webhook event logged

8. Verify database insert in Vercel Postgres console:
   ```sql
   SELECT * FROM registrations ORDER BY created_at DESC LIMIT 1;
   ```

## Test Cards

Stripe provides many test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Card declined |
| 4000 0025 0000 3155 | 3D Secure required |
| 4000 0000 0000 0002 | Charge declined |

Full list: [https://docs.stripe.com/testing#cards](https://docs.stripe.com/testing#cards)

## Trigger Test Webhooks

You can manually trigger webhooks:

```bash
stripe trigger checkout.session.completed
```

This sends a test event to your local server.

## Troubleshooting

### Webhook not firing
- Make sure `stripe listen` is running
- Check webhook secret matches in `.env.local`
- Check Next.js dev server console for errors

### Price not found
- Verify product metadata in Stripe Dashboard
- Check `event_slug` and `distance_index` match exactly
- Refresh `/api/stripe/prices` endpoint

### Database connection error
- Verify `POSTGRES_URL` in `.env.local`
- Check Vercel Postgres is running
- Test connection: `psql $POSTGRES_URL -c "SELECT 1;"`

### Session expired on success page
- Stripe sessions expire after 24 hours
- Success page shows generic message for expired sessions
- Check Stripe Dashboard for session details

## Next Steps

Once local testing works:
1. Deploy to production
2. Configure production webhook endpoint in Stripe Dashboard
3. Create live products with same metadata
4. Update environment variables in Vercel
5. Test with real card (small amount)

See [design document](plans/2026-01-19-stripe-payments-design.md) for production deployment checklist.
