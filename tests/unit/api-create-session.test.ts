import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe
const mockPricesList = vi.fn();
const mockPricesRetrieve = vi.fn();
const mockCheckoutSessionsCreate = vi.fn();
const mockSql = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    prices: {
      list: mockPricesList,
      retrieve: mockPricesRetrieve,
    },
    checkout: {
      sessions: {
        create: mockCheckoutSessionsCreate,
      },
    },
  })),
}));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => mockSql),
}));

// Helper: build a form-encoded body with the required fields. Booleans serialize as "1"/"0".
const createValidBody = (overrides: Record<string, string | number | boolean | null> = {}) => {
  const defaults: Record<string, string | number | boolean | null> = {
    eventSlug: 'egipte-malta',
    distanceIndex: 0,
    name: 'Jānis Bērziņš',
    email: 'janis@example.com',
    phone: '+37120000000',
    emergencyContactName: 'Anna Bērziņa',
    emergencyContactPhone: '+37120000001',
    locale: 'lv',
  };
  const merged = { ...defaults, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'boolean') {
      params.set(k, v ? '1' : '0');
    } else {
      params.set(k, String(v));
    }
  }
  return params.toString();
};

const createRequest = (body: string) =>
  new NextRequest('http://localhost:3000/api/checkout/create-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

describe('POST /api/checkout/create-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
    process.env.DATABASE_URL = 'postgres://mock';
    // Default DB mock — empty rows; specific tests override.
    mockSql.mockResolvedValue([]);
  });

  it('redirects 303 to Stripe on success with all fields', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: {
            id: 'prod_123',
            metadata: { event_slug: 'egipte-malta', distance_index: '0' },
          },
          unit_amount: 6900,
          currency: 'eur',
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody()));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_123');
  });

  it('uses /en/ prefix in success/cancel URLs for English locale', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '1' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_456',
      url: 'https://checkout.stripe.com/pay/cs_test_456',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({ distanceIndex: 1, locale: 'en' })));

    expect(response.status).toBe(303);
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/en/egipte-malta/checkout/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/en/egipte-malta/checkout',
      }),
    );
  });

  it('redirects back to checkout with ?error=price_unavailable when no price matches', async () => {
    mockPricesList.mockResolvedValue({ data: [] });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody()));

    expect(response.status).toBe(303);
    const loc = response.headers.get('location') || '';
    expect(loc).toContain('/egipte-malta/checkout');
    expect(loc).toContain('error=price_unavailable');
  });

  it('redirects back with ?error=missing_fields when required fields are missing', async () => {
    const params = new URLSearchParams({
      eventSlug: 'egipte-malta',
      distanceIndex: '0',
      name: 'Jānis',
      email: 'janis@example.com',
      // phone missing
      locale: 'lv',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(params.toString()));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toContain('error=missing_fields');
  });

  it('redirects back with ?error=missing_fields when accommodation type is required but absent', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({
      needsAccommodation: true,
      accommodationType: '',
    })));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toContain('error=missing_fields');
  });

  it('redirects back with ?error=dorm_full when dorm is full and waitlist not selected', async () => {
    mockSql.mockResolvedValueOnce([{ dorm_count: '15' }]);

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({
      needsAccommodation: true,
      accommodationType: 'dorm',
      accommodationWaitlist: false,
    })));

    expect(response.status).toBe(303);
    const loc = response.headers.get('location') || '';
    expect(loc).toContain('error=dorm_full');
    expect(loc).toContain('distance=0');
  });

  it('allows dorm selection when spots are available', async () => {
    mockSql.mockResolvedValueOnce([{ dorm_count: '5' }]);
    mockSql.mockResolvedValueOnce([]); // DB insert

    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_dorm',
      url: 'https://checkout.stripe.com/pay/cs_test_dorm',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({
      needsAccommodation: true,
      accommodationType: 'dorm',
      accommodationWaitlist: false,
    })));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_dorm');
  });

  it('allows dorm waitlist registration without capacity check', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_waitlist',
      url: 'https://checkout.stripe.com/pay/cs_test_waitlist',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({
      needsAccommodation: true,
      accommodationType: 'dorm',
      accommodationWaitlist: true,
    })));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_waitlist');
  });

  it('allows tent accommodation without capacity check', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_tent',
      url: 'https://checkout.stripe.com/pay/cs_test_tent',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({
      needsAccommodation: true,
      accommodationType: 'tent',
    })));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_tent');
  });

  it('passes participant + accommodation metadata to Stripe', async () => {
    mockSql.mockResolvedValueOnce([{ dorm_count: '5' }]);
    mockSql.mockResolvedValueOnce([]);

    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_meta',
      url: 'https://checkout.stripe.com/pay/cs_test_meta',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    await POST(createRequest(createValidBody({
      needsAccommodation: true,
      accommodationType: 'dorm',
      accommodationWaitlist: false,
      wantsPreparationTips: true,
    })));

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          participant_phone: '+37120000000',
          emergency_contact_name: 'Anna Bērziņa',
          emergency_contact_phone: '+37120000001',
          needs_accommodation: 'true',
          accommodation_type: 'dorm',
          accommodation_waitlist: 'false',
          wants_preparation_tips: 'true',
        }),
      }),
    );
  });

  it('still redirects to Stripe even if database insert fails', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_db_fail',
      url: 'https://checkout.stripe.com/pay/cs_test_db_fail',
    });

    mockSql.mockRejectedValue(new Error('Database connection failed'));

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody()));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_db_fail');
  });

  it('accepts distanceIndex of 0', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_zero',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_zero',
      url: 'https://checkout.stripe.com/pay/cs_test_zero',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({ distanceIndex: 0 })));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_zero');
  });

  it('uses prices.retrieve (not list) when client supplies a valid priceId', async () => {
    mockPricesRetrieve.mockResolvedValue({
      id: 'price_supplied',
      active: true,
      product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_retrieve',
      url: 'https://checkout.stripe.com/pay/cs_test_retrieve',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({ priceId: 'price_supplied' })));

    expect(response.status).toBe(303);
    expect(mockPricesRetrieve).toHaveBeenCalledWith('price_supplied', { expand: ['product'] });
    expect(mockPricesList).not.toHaveBeenCalled();
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [expect.objectContaining({ price: 'price_supplied' })],
      }),
    );
  });

  it('falls back to prices.list when supplied priceId has mismatched product metadata', async () => {
    // priceId points at a different event — must NOT be trusted.
    mockPricesRetrieve.mockResolvedValue({
      id: 'price_other_event',
      active: true,
      product: { metadata: { event_slug: 'parize-dakara', distance_index: '0' } },
    });

    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_real',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_fallback',
      url: 'https://checkout.stripe.com/pay/cs_test_fallback',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody({ priceId: 'price_other_event' })));

    expect(response.status).toBe(303);
    expect(mockPricesRetrieve).toHaveBeenCalled();
    expect(mockPricesList).toHaveBeenCalled();
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [expect.objectContaining({ price: 'price_real' })],
      }),
    );
  });

  it('redirects back with ?error=server when Stripe session creation throws', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: { metadata: { event_slug: 'egipte-malta', distance_index: '0' } },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockRejectedValue(new Error('Stripe down'));

    const { POST } = await import('@/app/api/checkout/create-session/route');
    const response = await POST(createRequest(createValidBody()));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toContain('error=server');
  });
});
