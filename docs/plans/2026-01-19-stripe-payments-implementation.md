# Stripe Payments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Stripe Checkout for event registration payments with full database persistence and webhook handling.

**Architecture:** Stripe-hosted checkout sessions redirect users for payment, webhooks fire on completion to store registrations in Vercel Postgres. Prices fetched from Stripe API and matched to events via product metadata.

**Tech Stack:** Stripe API, Vercel Postgres, Next.js App Router API Routes

---

## Prerequisites

Before starting implementation, ensure:
- [ ] Stripe account created (test mode)
- [ ] Vercel Postgres database created
- [ ] Environment variables configured in `.env.local`
- [ ] Stripe CLI installed for webhook testing

See [design document](2026-01-19-stripe-payments-design.md) for complete setup instructions.

---

## Task 1: Install Dependencies and Setup Database

**Files:**
- Modify: `package.json`
- Create: `app/db/migrations/001_create_registrations.sql`
- Create: `.env.example`

**Step 1: Install Stripe and Postgres packages**

```bash
npm install stripe @vercel/postgres
```

**Step 2: Create database migration file**

Create `app/db/migrations/001_create_registrations.sql`:

```sql
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,

  -- Stripe data
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  amount_paid INTEGER NOT NULL,
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

**Step 3: Create .env.example file**

Create `.env.example`:

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (get from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel Postgres (auto-set by Vercel, or get from Vercel Dashboard)
POSTGRES_URL=postgres://...
```

**Step 4: Run database migration**

```bash
# Copy SQL and run in Vercel Postgres console, or:
# psql $POSTGRES_URL < app/db/migrations/001_create_registrations.sql
```

Note: Manual step - verify table created by checking Vercel Postgres console.

**Step 5: Commit**

```bash
git add package.json package-lock.json app/db/migrations/001_create_registrations.sql .env.example
git commit -m "feat: add Stripe dependencies and database schema

- Install stripe and @vercel/postgres packages
- Create registrations table migration
- Add .env.example for required environment variables"
```

---

## Task 2: Create Stripe Price Fetching API Route

**Files:**
- Create: `app/api/stripe/prices/route.ts`
- Create: `app/lib/stripe.ts` (Stripe client singleton)

**Step 1: Write test for Stripe client initialization**

Create `tests/unit/stripe-client.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock_key');
});

describe('Stripe Client', () => {
  it('should initialize with secret key from environment', async () => {
    const { getStripeClient } = await import('@/app/lib/stripe');
    const stripe = getStripeClient();
    expect(stripe).toBeDefined();
  });

  it('should throw error if STRIPE_SECRET_KEY is missing', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');

    await expect(async () => {
      const { getStripeClient } = await import('@/app/lib/stripe');
      getStripeClient();
    }).rejects.toThrow('STRIPE_SECRET_KEY is not set');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/stripe-client.test.ts
```

Expected: FAIL - module not found

**Step 3: Create Stripe client singleton**

Create `app/lib/stripe.ts`:

```typescript
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }

  return stripeClient;
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/stripe-client.test.ts
```

Expected: PASS

**Step 5: Write test for price fetching API route**

Create `tests/unit/api-stripe-prices.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/stripe/prices/route';

// Mock Stripe
vi.mock('@/app/lib/stripe', () => ({
  getStripeClient: () => ({
    prices: {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'price_123',
            unit_amount: 6900,
            product: {
              id: 'prod_123',
              metadata: {
                event_slug: 'egipte-malta',
                distance_index: '0',
              },
            },
          },
          {
            id: 'price_456',
            unit_amount: 6900,
            product: {
              id: 'prod_456',
              metadata: {
                event_slug: 'egipte-malta',
                distance_index: '1',
              },
            },
          },
        ],
      }),
    },
  }),
}));

describe('GET /api/stripe/prices', () => {
  it('should return prices with event metadata', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.prices).toHaveLength(2);
    expect(data.prices[0]).toEqual({
      priceId: 'price_123',
      eventSlug: 'egipte-malta',
      distanceIndex: 0,
      amount: 6900,
    });
  });

  it('should filter out prices without metadata', async () => {
    const { getStripeClient } = await import('@/app/lib/stripe');
    vi.mocked(getStripeClient).mockReturnValue({
      prices: {
        list: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'price_123',
              unit_amount: 6900,
              product: {
                id: 'prod_123',
                metadata: {
                  event_slug: 'egipte-malta',
                  distance_index: '0',
                },
              },
            },
            {
              id: 'price_no_metadata',
              unit_amount: 5000,
              product: {
                id: 'prod_no_meta',
                metadata: {},
              },
            },
          ],
        }),
      },
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(data.prices).toHaveLength(1);
    expect(data.prices[0].priceId).toBe('price_123');
  });
});
```

**Step 6: Run test to verify it fails**

```bash
npm test tests/unit/api-stripe-prices.test.ts
```

Expected: FAIL - route not found

**Step 7: Implement price fetching API route**

Create `app/api/stripe/prices/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getStripeClient } from '@/app/lib/stripe';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

interface PriceData {
  priceId: string;
  eventSlug: string;
  distanceIndex: number;
  amount: number;
}

export async function GET() {
  try {
    const stripe = getStripeClient();

    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    const pricesWithMetadata: PriceData[] = prices.data
      .filter((price) => {
        const product = price.product as any;
        return (
          product.metadata?.event_slug &&
          product.metadata?.distance_index !== undefined
        );
      })
      .map((price) => {
        const product = price.product as any;
        return {
          priceId: price.id,
          eventSlug: product.metadata.event_slug,
          distanceIndex: parseInt(product.metadata.distance_index, 10),
          amount: price.unit_amount || 0,
        };
      });

    return NextResponse.json({ prices: pricesWithMetadata });
  } catch (error) {
    console.error('Error fetching Stripe prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
```

**Step 8: Run test to verify it passes**

```bash
npm test tests/unit/api-stripe-prices.test.ts
```

Expected: PASS

**Step 9: Commit**

```bash
git add app/lib/stripe.ts app/api/stripe/prices/route.ts tests/unit/stripe-client.test.ts tests/unit/api-stripe-prices.test.ts
git commit -m "feat: add Stripe price fetching API route

- Create Stripe client singleton with error handling
- Implement GET /api/stripe/prices endpoint
- Filter prices by event_slug and distance_index metadata
- Cache responses for 5 minutes
- Add comprehensive unit tests"
```

---

## Task 3: Create Checkout Session API Route

**Files:**
- Create: `app/api/checkout/create-session/route.ts`

**Step 1: Write test for checkout session creation**

Create `tests/unit/api-create-session.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/checkout/create-session/route';
import { NextRequest } from 'next/server';

vi.mock('@/app/lib/stripe', () => ({
  getStripeClient: () => ({
    prices: {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'price_123',
            unit_amount: 6900,
            product: {
              metadata: {
                event_slug: 'egipte-malta',
                distance_index: '0',
              },
            },
          },
        ],
      }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        }),
      },
    },
  }),
}));

describe('POST /api/checkout/create-session', () => {
  it('should create checkout session with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        distanceIndex: 0,
        name: 'Jānis Bērziņš',
        email: 'janis@example.com',
        locale: 'lv',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_123');
    expect(data.url).toContain('checkout.stripe.com');
  });

  it('should return 400 if required fields missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        // missing distanceIndex, name, email
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 404 if price not found for event/distance', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'non-existent-event',
        distanceIndex: 0,
        name: 'Test',
        email: 'test@example.com',
        locale: 'lv',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/api-create-session.test.ts
```

Expected: FAIL - route not found

**Step 3: Implement checkout session creation API route**

Create `app/api/checkout/create-session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/app/lib/stripe';

interface CreateSessionRequest {
  eventSlug: string;
  distanceIndex: number;
  name: string;
  email: string;
  locale: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    const { eventSlug, distanceIndex, name, email, locale } = body;

    // Validate required fields
    if (!eventSlug || distanceIndex === undefined || !name || !email || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();

    // Fetch prices and find matching price
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    const matchingPrice = prices.data.find((price) => {
      const product = price.product as any;
      return (
        product.metadata?.event_slug === eventSlug &&
        product.metadata?.distance_index === distanceIndex.toString()
      );
    });

    if (!matchingPrice) {
      return NextResponse.json(
        { error: 'Price not found for this event and distance' },
        { status: 404 }
      );
    }

    // Determine URLs based on locale
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const localePrefix = locale === 'en' ? '/en' : '';
    const successUrl = `${baseUrl}${localePrefix}/${eventSlug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}${localePrefix}/${eventSlug}/checkout`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: matchingPrice.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        event_slug: eventSlug,
        distance_index: distanceIndex.toString(),
        participant_name: name,
        participant_email: email,
        locale,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/api-create-session.test.ts
```

Expected: PASS

**Step 5: Add environment variable to .env.example**

Update `.env.example`:

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (get from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel Postgres (auto-set by Vercel, or get from Vercel Dashboard)
POSTGRES_URL=postgres://...

# Base URL for redirects (set in production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Step 6: Commit**

```bash
git add app/api/checkout/create-session/route.ts tests/unit/api-create-session.test.ts .env.example
git commit -m "feat: add checkout session creation API route

- Implement POST /api/checkout/create-session endpoint
- Validate required fields (eventSlug, distanceIndex, name, email)
- Fetch and match Stripe price by metadata
- Create Stripe Checkout session with customer metadata
- Handle locale-specific success/cancel URLs
- Add comprehensive unit tests and validation"
```

---

## Task 4: Create Stripe Webhook Handler

**Files:**
- Create: `app/api/webhooks/stripe/route.ts`
- Modify: `next.config.ts` (disable body parsing for webhook route)

**Step 1: Write test for webhook signature verification**

Create `tests/unit/webhook-stripe.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';
import { NextRequest } from 'next/server';

vi.mock('@/app/lib/stripe', () => ({
  getStripeClient: () => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
  }),
}));

vi.mock('@vercel/postgres', () => ({
  sql: vi.fn(),
}));

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');
  });

  it('should return 400 if signature verification fails', async () => {
    const { getStripeClient } = await import('@/app/lib/stripe');
    vi.mocked(getStripeClient().webhooks.constructEvent).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'invalid',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should process checkout.session.completed event', async () => {
    const { getStripeClient } = await import('@/app/lib/stripe');
    const { sql } = await import('@vercel/postgres');

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_test_123',
          amount_total: 6900,
          currency: 'eur',
          metadata: {
            event_slug: 'egipte-malta',
            distance_index: '0',
            participant_name: 'Jānis Bērziņš',
            participant_email: 'janis@example.com',
            locale: 'lv',
          },
        },
      },
    };

    vi.mocked(getStripeClient().webhooks.constructEvent).mockReturnValue(mockEvent as any);
    vi.mocked(sql).mockResolvedValue({ rows: [] } as any);

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(sql).toHaveBeenCalledWith(
      expect.anything(),
      'cs_test_123',
      'pi_test_123',
      6900,
      'eur',
      'egipte-malta',
      0,
      'Jānis Bērziņš',
      'janis@example.com',
      'lv'
    );
  });

  it('should return 200 even if database insert fails (idempotent)', async () => {
    const { getStripeClient } = await import('@/app/lib/stripe');
    const { sql } = await import('@vercel/postgres');

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_test_123',
          amount_total: 6900,
          currency: 'eur',
          metadata: {
            event_slug: 'egipte-malta',
            distance_index: '0',
            participant_name: 'Test',
            participant_email: 'test@example.com',
            locale: 'lv',
          },
        },
      },
    };

    vi.mocked(getStripeClient().webhooks.constructEvent).mockReturnValue(mockEvent as any);
    vi.mocked(sql).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    expect(response.status).toBe(200); // Still return 200 to prevent retries
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/webhook-stripe.test.ts
```

Expected: FAIL - route not found

**Step 3: Implement webhook handler**

Create `app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/app/lib/stripe';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        const {
          event_slug,
          distance_index,
          participant_name,
          participant_email,
          locale,
        } = session.metadata || {};

        if (!event_slug || !distance_index || !participant_name || !participant_email) {
          console.error('Missing required metadata in session:', session.id);
          break;
        }

        // Insert registration into database
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
            ${session.payment_intent as string},
            ${session.amount_total},
            ${session.currency},
            ${event_slug},
            ${parseInt(distance_index, 10)},
            ${participant_name},
            ${participant_email},
            ${locale || 'lv'}
          )
          ON CONFLICT (stripe_session_id) DO NOTHING
        `;

        console.log('Registration created for session:', session.id);
      } catch (error) {
        console.error('Error processing webhook:', error);
        // Still return 200 to prevent Stripe from retrying
      }
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }

  return NextResponse.json({ received: true });
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/webhook-stripe.test.ts
```

Expected: PASS

**Step 5: Configure Next.js to preserve raw body for webhooks**

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Required for Stripe webhook signature verification
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
```

Note: Next.js 15+ handles raw body correctly by default for API routes. No additional config needed.

**Step 6: Commit**

```bash
git add app/api/webhooks/stripe/route.ts tests/unit/webhook-stripe.test.ts next.config.ts
git commit -m "feat: add Stripe webhook handler

- Implement POST /api/webhooks/stripe endpoint
- Verify webhook signature with STRIPE_WEBHOOK_SECRET
- Handle checkout.session.completed event
- Insert registration into Postgres with idempotent handling
- Return 200 even on error to prevent Stripe retries
- Add comprehensive unit tests for signature verification"
```

---

## Task 5: Update CheckoutForm to Use Stripe API

**Files:**
- Modify: `app/components/CheckoutForm.tsx`
- Modify: `app/data/events.ts` (remove price field)

**Step 1: Write test for CheckoutForm with Stripe integration**

Create `tests/unit/checkout-form-stripe.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutForm from '@/app/components/CheckoutForm';
import { events } from '@/app/data/events';

// Mock fetch
global.fetch = vi.fn();

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock paraglide
vi.mock('@/paraglide/runtime', () => ({
  getLocale: () => 'lv',
}));

describe('CheckoutForm with Stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch and display price from Stripe API', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        prices: [
          {
            priceId: 'price_123',
            eventSlug: 'egipte-malta',
            distanceIndex: 0,
            amount: 6900,
          },
        ],
      }),
    } as Response);

    render(<CheckoutForm event={events['egipte-malta']} />);

    await waitFor(() => {
      expect(screen.getByText('€69')).toBeInTheDocument();
    });
  });

  it('should show error if price not found', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ prices: [] }),
    } as Response);

    render(<CheckoutForm event={events['egipte-malta']} />);

    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    });
  });

  it('should create checkout session on submit', async () => {
    const user = userEvent.setup();

    // Mock price fetch
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        prices: [{ priceId: 'price_123', eventSlug: 'egipte-malta', distanceIndex: 1, amount: 6900 }],
      }),
    } as Response);

    // Mock session creation
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      }),
    } as Response);

    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<CheckoutForm event={events['egipte-malta']} />);

    // Wait for price to load
    await waitFor(() => {
      expect(screen.getByText('€69')).toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'Jānis Bērziņš');
    await user.type(screen.getByLabelText(/email/i), 'janis@example.com');
    await user.click(screen.getByLabelText(/terms/i));

    // Submit
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(window.location.href).toContain('checkout.stripe.com');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/checkout-form-stripe.test.ts
```

Expected: FAIL - form doesn't fetch prices or create sessions

**Step 3: Update CheckoutForm to integrate Stripe**

Modify `app/components/CheckoutForm.tsx`:

```typescript
"use client";

import { useState, FormEvent, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EventData, events } from "@/app/data/events";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

interface CheckoutFormProps {
    event: EventData;
}

interface StripePrice {
    priceId: string;
    eventSlug: string;
    distanceIndex: number;
    amount: number;
}

// Helper to get translated distance name
function getDistanceName(nameKey: string): string {
    const translations: Record<string, () => string> = {
        distance_adventure: m.distance_adventure,
        distance_challenge: m.distance_challenge,
        distance_long: m.distance_long,
    };
    return translations[nameKey]?.() ?? nameKey;
}

// Helper to get translated event name
function getEventName(nameKey: string): string {
    const translations: Record<string, () => string> = {
        event_egipte_malta: m.event_egipte_malta,
        event_parize_dakara: m.event_parize_dakara,
    };
    return translations[nameKey]?.() ?? nameKey;
}

export default function CheckoutForm({
    event,
}: CheckoutFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = getLocale();
    const allEvents = Object.values(events);

    // Derive selected distance from URL params or default to last option
    const selectedDistanceIndex = useMemo(() => {
        const distanceParam = searchParams.get("distance");
        if (distanceParam !== null) {
            const parsed = parseInt(distanceParam, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed < event.distances.length) {
                return parsed;
            }
        }
        return event.distances.length - 1;
    }, [searchParams, event.distances.length]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stripePrices, setStripePrices] = useState<StripePrice[]>([]);
    const [priceLoading, setPriceLoading] = useState(true);
    const [priceError, setPriceError] = useState<string | null>(null);

    // Load persisted form data on mount
    useEffect(() => {
        const savedName = localStorage.getItem("checkout_name");
        const savedEmail = localStorage.getItem("checkout_email");
        if (savedName || savedEmail) {
            setFormData(prev => ({
                ...prev,
                name: savedName || "",
                email: savedEmail || "",
            }));
        }

        // If no distance in URL, check if we have a persisted one for this event
        if (!searchParams.has("distance")) {
            const savedDistance = localStorage.getItem(`last_distance_${event.slug}`);
            if (savedDistance !== null) {
                const path = locale === "en" ? `/en/${event.slug}/checkout?distance=${savedDistance}` : `/${event.slug}/checkout?distance=${savedDistance}`;
                router.replace(path, { scroll: false });
            }
        }
    }, []); // Run only on mount

    // Fetch Stripe prices on mount
    useEffect(() => {
        async function fetchPrices() {
            try {
                const response = await fetch('/api/stripe/prices');
                if (!response.ok) {
                    throw new Error('Failed to fetch prices');
                }
                const data = await response.json();
                setStripePrices(data.prices || []);
            } catch (error) {
                console.error('Error fetching prices:', error);
                setPriceError('Failed to load pricing information');
            } finally {
                setPriceLoading(false);
            }
        }

        fetchPrices();
    }, []);

    // Save selection and check for redirected persistence
    useEffect(() => {
        localStorage.setItem(`last_distance_${event.slug}`, selectedDistanceIndex.toString());
        localStorage.setItem("last_event_slug", event.slug);
    }, [event.slug, selectedDistanceIndex]);

    const selectedDistance = event.distances[selectedDistanceIndex];
    const distanceName = getDistanceName(selectedDistance.nameKey);
    const eventName = getEventName(event.nameKey);
    const distanceFact = selectedDistance.facts.find((f) => f.icon === "route");
    const elevationFact = selectedDistance.facts.find((f) => f.icon === "mountain");

    // Find matching Stripe price
    const matchingPrice = stripePrices.find(
        p => p.eventSlug === event.slug && p.distanceIndex === selectedDistanceIndex
    );

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = m.checkout_error_required();
        }

        if (!formData.email.trim()) {
            newErrors.email = m.checkout_error_required();
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = m.checkout_error_email();
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = m.checkout_error_terms();
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!matchingPrice) {
            alert('Price information is not available. Please contact us.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/checkout/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventSlug: event.slug,
                    distanceIndex: selectedDistanceIndex,
                    name: formData.name,
                    email: formData.email,
                    locale,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json();

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Unable to start checkout. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Persist name and email
        if (field === "name") localStorage.setItem("checkout_name", value as string);
        if (field === "email") localStorage.setItem("checkout_email", value as string);

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleEventChange = (newSlug: string) => {
        // When changing event, try to find matching distance name or use last selection
        const savedDistance = localStorage.getItem(`last_distance_${newSlug}`);
        const distParam = savedDistance !== null ? `?distance=${savedDistance}` : "";
        const path = locale === "en" ? `/en/${newSlug}/checkout${distParam}` : `/${newSlug}/checkout${distParam}`;
        router.push(path, { scroll: false });
    };

    const handleDistanceChange = (newIndex: number) => {
        const path = locale === "en" ? `/en/${event.slug}/checkout?distance=${newIndex}` : `/${event.slug}/checkout?distance=${newIndex}`;
        router.push(path, { scroll: false });
    };

    const termsUrl = locale === "en" ? "/en/noteikumi" : "/noteikumi";

    // Show error if price not found
    const showPriceError = !priceLoading && !matchingPrice;

    return (
        <div>
            {/* Notice Banner */}
            {showPriceError && (
                <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-sm text-red-700">
                            Registration is temporarily unavailable. Please contact us at pasaulesture@gmail.com
                        </p>
                    </div>
                </div>
            )}

            {/* Selected Event and Distance Info */}
            <div className="bg-forest-deep text-white rounded-2xl p-6 mb-8 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <p className="text-sand/70 text-sm uppercase tracking-wider">
                            {m.checkout_selection_label()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sand/60 text-xs uppercase tracking-widest mb-1">{m.checkout_price_label()}</p>
                        {priceLoading ? (
                            <p className="text-2xl font-display text-sand/50">Loading...</p>
                        ) : matchingPrice ? (
                            <p className="text-3xl font-display text-amber-glow">€{(matchingPrice.amount / 100).toFixed(0)}</p>
                        ) : (
                            <p className="text-xl font-display text-red-400">N/A</p>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Event Dropdown */}
                    <div>
                        <label className="text-sand/80 text-xs uppercase tracking-wide mb-2 block">
                            {m.checkout_event_label()}
                        </label>
                        <div className="relative">
                            <select
                                value={event.slug}
                                onChange={(e) => handleEventChange(e.target.value)}
                                className="w-full bg-forest-medium/30 border border-sand/20 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-amber-light transition-colors font-semibold cursor-pointer"
                            >
                                {allEvents.map((e) => (
                                    <option key={e.slug} value={e.slug} className="bg-forest-deep text-white">
                                        {getEventName(e.nameKey)}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sand/50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Distance Dropdown */}
                    <div className="border-t border-sand/20 pt-4">
                        <label className="text-sand/80 text-xs uppercase tracking-wide mb-2 block">
                            {m.checkout_distance_label()}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedDistanceIndex.toString()}
                                onChange={(e) => handleDistanceChange(parseInt(e.target.value, 10))}
                                disabled={event.distances.length <= 1}
                                className={`w-full bg-forest-medium/30 border border-sand/20 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-amber-light transition-colors font-semibold ${event.distances.length <= 1 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                            >
                                {event.distances.map((d, idx) => (
                                    <option key={idx} value={idx.toString()} className="bg-forest-deep text-white">
                                        {getDistanceName(d.nameKey)}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sand/50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Facts row */}
                    {(distanceFact || elevationFact) && (
                        <div className="flex gap-6 text-sm border-t border-sand/10 pt-4">
                            {distanceFact && (
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-amber-light"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                        />
                                    </svg>
                                    <span className="text-sand">{distanceFact.value}</span>
                                </div>
                            )}
                            {elevationFact && (
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-amber-light"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                                        />
                                    </svg>
                                    <span className="text-sand">{elevationFact.value}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-earth-dark mb-2"
                    >
                        {m.checkout_name_label()} <span className="text-amber">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${errors.name
                            ? "border-red-500 focus:border-red-500"
                            : "border-sand focus:border-forest-medium"
                            } focus:outline-none bg-white`}
                        placeholder="Jānis Bērziņš"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-earth-dark mb-2"
                    >
                        {m.checkout_email_label()} <span className="text-amber">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${errors.email
                            ? "border-red-500 focus:border-red-500"
                            : "border-sand focus:border-forest-medium"
                            } focus:outline-none bg-white`}
                        placeholder="janis@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* Terms Acceptance */}
                <div className="pt-4 border-t-2 border-sand/30">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={formData.acceptTerms}
                            onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-2 border-sand text-forest-deep focus:ring-2 focus:ring-forest-medium cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-sm text-earth-dark flex-1">
                            {m.checkout_terms_label()}{" "}
                            <Link
                                href={termsUrl}
                                target="_blank"
                                className="text-forest-medium hover:text-amber underline font-semibold inline-flex items-center gap-1"
                            >
                                {m.checkout_terms_link()}
                                <svg className="w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                            <span className="text-amber"> *</span>
                        </label>
                    </div>
                    {errors.acceptTerms && (
                        <p className="mt-2 text-sm text-red-600 ml-8">
                            {errors.acceptTerms}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || priceLoading || showPriceError}
                    className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            {m.checkout_submit()}
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            {m.checkout_submit()}
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </span>
                    )}
                </button>
            </form>
        </div>
    );
}
```

**Step 4: Remove price field from events.ts**

Modify `app/data/events.ts`:

```typescript
export interface EventDistance {
  nameKey: string; // Translation key for distance name
  facts: EventFact[];
  komootEmbedUrl: string;
  // price field removed - managed in Stripe Dashboard
}
```

Remove `price: 69` from all distance objects in the events data.

**Step 5: Run tests**

```bash
npm test
```

Expected: All tests pass

**Step 6: Commit**

```bash
git add app/components/CheckoutForm.tsx app/data/events.ts tests/unit/checkout-form-stripe.test.ts
git commit -m "feat: integrate Stripe payments into CheckoutForm

- Fetch prices from Stripe API on component mount
- Match prices to event/distance using metadata
- Create checkout session and redirect to Stripe
- Show error if price not found (block submission)
- Remove price field from events.ts (Stripe is source of truth)
- Update form to handle loading states
- Add comprehensive tests for Stripe integration"
```

---

## Task 6: Create Success Page

**Files:**
- Create: `app/[locale]/[slug]/checkout/success/page.tsx`

**Step 1: Write E2E test for success page**

Create `tests/e2e/checkout-success.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Checkout Success Page', () => {
  test('should display success message with session details', async ({ page }) => {
    // Mock successful session (would need valid session ID in real test)
    await page.goto('/egipte-malta/checkout/success?session_id=cs_test_mock');

    // Should show success message
    await expect(page.getByText(/thank you/i)).toBeVisible();
    await expect(page.getByText(/registration confirmed/i)).toBeVisible();

    // Should show event details
    await expect(page.getByText(/ēģipte-malta/i)).toBeVisible();
  });

  test('should show generic success for expired session', async ({ page }) => {
    await page.goto('/egipte-malta/checkout/success?session_id=expired_session');

    // Should still show success (payment was made)
    await expect(page.getByText(/thank you/i)).toBeVisible();
  });

  test('should have link back to event page', async ({ page }) => {
    await page.goto('/egipte-malta/checkout/success?session_id=cs_test_mock');

    const eventLink = page.getByRole('link', { name: /back to event/i });
    await expect(eventLink).toBeVisible();
    await expect(eventLink).toHaveAttribute('href', '/egipte-malta');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test:e2e -- tests/e2e/checkout-success.spec.ts --project=chromium
```

Expected: FAIL - page not found

**Step 3: Implement success page**

Create `app/[locale]/[slug]/checkout/success/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/app/data/events";
import { getStripeClient } from "@/app/lib/stripe";
import Link from "next/link";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import Stripe from "stripe";

interface SuccessPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
    searchParams: Promise<{
        session_id?: string;
    }>;
}

// Helper to get translated event name
function getEventName(nameKey: string): string {
    const translations: Record<string, () => string> = {
        event_egipte_malta: m.event_egipte_malta,
        event_parize_dakara: m.event_parize_dakara,
    };
    return translations[nameKey]?.() ?? nameKey;
}

// Helper to get translated distance name
function getDistanceName(nameKey: string): string {
    const translations: Record<string, () => string> = {
        distance_adventure: m.distance_adventure,
        distance_challenge: m.distance_challenge,
        distance_long: m.distance_long,
    };
    return translations[nameKey]?.() ?? nameKey;
}

export default async function CheckoutSuccessPage({
    params,
    searchParams,
}: SuccessPageProps) {
    const { slug, locale } = await params;
    const { session_id } = await searchParams;

    const event = getEventBySlug(slug);

    if (!event) {
        notFound();
    }

    const eventUrl = locale === "en" ? `/en/${slug}` : `/${slug}`;

    let session: Stripe.Checkout.Session | null = null;
    let sessionError = false;

    // Try to fetch session details
    if (session_id) {
        try {
            const stripe = getStripeClient();
            session = await stripe.checkout.sessions.retrieve(session_id);

            // Validate session matches event
            if (session.metadata?.event_slug !== slug) {
                console.warn('Session event mismatch:', session.metadata?.event_slug, 'vs', slug);
                session = null;
            }
        } catch (error) {
            console.error('Error fetching session:', error);
            sessionError = true;
        }
    }

    const eventName = getEventName(event.nameKey);
    let distanceName: string | null = null;
    let participantName: string | null = null;
    let amountPaid: string | null = null;

    if (session && session.metadata) {
        const distanceIndex = parseInt(session.metadata.distance_index || '0', 10);
        if (distanceIndex >= 0 && distanceIndex < event.distances.length) {
            distanceName = getDistanceName(event.distances[distanceIndex].nameKey);
        }
        participantName = session.metadata.participant_name || null;
        if (session.amount_total) {
            amountPaid = `€${(session.amount_total / 100).toFixed(2)}`;
        }
    }

    return (
        <div className="min-h-screen bg-cream-light">
            <div className="max-w-5xl mx-auto">
                <main className="mt-6 mx-2 mb-8">
                    <div className="bg-cream rounded-3xl p-8 md:p-12">
                        <div className="max-w-2xl mx-auto text-center">
                            {/* Success Icon */}
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                                <svg
                                    className="w-12 h-12 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>

                            {/* Success Message */}
                            <h1 className="font-display text-4xl md:text-5xl text-forest-deep mb-3">
                                Thank You!
                            </h1>
                            <p className="text-xl text-earth-dark mb-8">
                                Your registration has been confirmed.
                            </p>

                            {/* Registration Details */}
                            {session && participantName && distanceName ? (
                                <div className="bg-forest-deep text-white rounded-2xl p-6 mb-8">
                                    <h2 className="text-sand/80 text-sm uppercase tracking-wider mb-4">
                                        Registration Details
                                    </h2>
                                    <div className="space-y-3 text-left">
                                        <div className="flex justify-between border-b border-sand/20 pb-2">
                                            <span className="text-sand/70">Participant:</span>
                                            <span className="font-semibold">{participantName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-sand/20 pb-2">
                                            <span className="text-sand/70">Event:</span>
                                            <span className="font-semibold">{eventName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-sand/20 pb-2">
                                            <span className="text-sand/70">Distance:</span>
                                            <span className="font-semibold">{distanceName}</span>
                                        </div>
                                        {amountPaid && (
                                            <div className="flex justify-between pt-2">
                                                <span className="text-sand/70">Amount Paid:</span>
                                                <span className="font-display text-xl text-amber-glow">{amountPaid}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber/10 border-l-4 border-amber rounded-lg p-4 mb-8">
                                    <p className="text-sm text-earth-dark">
                                        A confirmation email has been sent to your email address with your registration details.
                                    </p>
                                </div>
                            )}

                            {/* Next Steps */}
                            <div className="text-left bg-sand/30 rounded-xl p-6 mb-8">
                                <h3 className="font-semibold text-forest-deep mb-3">What's Next?</h3>
                                <ul className="space-y-2 text-earth-dark">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-forest-medium flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Check your email for confirmation and event details</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-forest-medium flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Save the event date to your calendar</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-forest-medium flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Start training and prepare your gear</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Back to Event Link */}
                            <Link
                                href={eventUrl}
                                className="inline-flex items-center gap-2 btn-primary"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Event Page
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
```

**Step 4: Run E2E test**

```bash
npm run test:e2e -- tests/e2e/checkout-success.spec.ts --project=chromium
```

Expected: Tests may fail without real Stripe session, but page should render

**Step 5: Commit**

```bash
git add app/[locale]/[slug]/checkout/success/page.tsx tests/e2e/checkout-success.spec.ts
git commit -m "feat: add checkout success page

- Display success message after payment
- Fetch and show session details (participant, event, amount)
- Gracefully handle expired/invalid sessions
- Show generic success message if session unavailable
- Validate session matches event slug
- Add next steps guide for participants
- Add E2E tests for success page"
```

---

## Task 7: Testing and Documentation

**Files:**
- Create: `docs/STRIPE_SETUP.md` (local development guide)
- Modify: `CLAUDE.md` (add Stripe documentation)
- Modify: `README.md` (add Stripe setup section)

**Step 1: Create local development setup guide**

Create `docs/STRIPE_SETUP.md`:

```markdown
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
```

**Step 2: Update CLAUDE.md**

Add to `CLAUDE.md`:

```markdown
## Stripe Payments

### Architecture
- **Payment Flow**: Stripe Checkout (hosted payment page)
- **Database**: Vercel Postgres (`registrations` table)
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
POSTGRES_URL=postgres://...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Local Development
See [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) for complete setup guide.

**Quick start:**
1. Create Stripe products with metadata (`event_slug`, `distance_index`)
2. Set up `.env.local` with API keys
3. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Test with card `4242 4242 4242 4242`

### Testing
- Unit tests: `npm test` (API routes, price matching, webhook handling)
- E2E tests: `npm run test:e2e` (full checkout flow)
- Manual: Use Stripe test cards (see docs)

### Key Files
- `app/lib/stripe.ts` - Stripe client singleton
- `app/api/stripe/prices/route.ts` - Price fetching
- `app/api/checkout/create-session/route.ts` - Session creation
- `app/api/webhooks/stripe/route.ts` - Webhook handler
- `app/[locale]/[slug]/checkout/success/page.tsx` - Success page
- `app/db/migrations/001_create_registrations.sql` - Database schema

### Design Documents
- [Stripe Payments Design](docs/plans/2026-01-19-stripe-payments-design.md)
- [Implementation Plan](docs/plans/2026-01-19-stripe-payments-implementation.md)
```

**Step 3: Run all tests**

```bash
# Unit tests
npm test

# E2E tests (Chromium only for speed)
npm run test:e2e -- --project=chromium
```

**Step 4: Commit**

```bash
git add docs/STRIPE_SETUP.md CLAUDE.md
git commit -m "docs: add Stripe integration documentation

- Create comprehensive local development setup guide
- Document Stripe product configuration
- Add test card numbers and troubleshooting tips
- Update CLAUDE.md with Stripe architecture overview
- Document API routes and environment variables"
```

---

## Completion Checklist

### Development
- [ ] Stripe and Postgres dependencies installed
- [ ] Database migration created and run
- [ ] Stripe client singleton implemented
- [ ] Price fetching API route working
- [ ] Checkout session creation API route working
- [ ] Webhook handler implemented
- [ ] CheckoutForm integrated with Stripe
- [ ] Success page created
- [ ] All unit tests passing
- [ ] E2E tests created

### Configuration
- [ ] `.env.example` file created
- [ ] `.env.local` configured with test keys
- [ ] Stripe test products created with metadata
- [ ] Vercel Postgres database created
- [ ] Database table created
- [ ] Stripe CLI installed and configured

### Testing
- [ ] Manual test: Full checkout flow with test card
- [ ] Manual test: Webhook fires and inserts registration
- [ ] Manual test: Success page displays correctly
- [ ] Manual test: Both locales (LV, EN) work
- [ ] Manual test: Cancel flow returns to checkout
- [ ] Manual test: Price not found shows error
- [ ] Unit tests: All passing (`npm test`)
- [ ] E2E tests: All passing (`npm run test:e2e`)

### Documentation
- [ ] Stripe setup guide created
- [ ] CLAUDE.md updated with Stripe section
- [ ] Design document committed
- [ ] Implementation plan committed (this file)

### Production Readiness
- [ ] Review design document production checklist
- [ ] Plan Stripe live product creation
- [ ] Plan production webhook endpoint setup
- [ ] Plan environment variable configuration in Vercel

---

## Execution Options

**Plan complete and saved to `docs/plans/2026-01-19-stripe-payments-implementation.md`.**

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
