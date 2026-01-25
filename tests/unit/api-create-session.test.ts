import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe
const mockPricesList = vi.fn();
const mockCheckoutSessionsCreate = vi.fn();
const mockSql = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    prices: {
      list: mockPricesList,
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

// Helper to create a valid request body with all required fields
const createValidBody = (overrides = {}) => ({
  eventSlug: 'egipte-malta',
  distanceIndex: 0,
  name: 'Jānis Bērziņš',
  email: 'janis@example.com',
  phone: '+37120000000',
  emergencyContactName: 'Anna Bērziņa',
  emergencyContactPhone: '+37120000001',
  locale: 'lv',
  ...overrides,
});

describe('POST /api/checkout/create-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
    process.env.DATABASE_URL = 'postgres://mock';
    // Mock successful DB operations by default
    mockSql.mockResolvedValue([{ dorm_count: '0' }] as any);
  });

  it('should create a checkout session successfully with all fields', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: {
            id: 'prod_123',
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '0',
            },
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

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody()),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_123');
    expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
  });

  it('should handle English locale with /en/ prefix in URLs', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: {
            id: 'prod_123',
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '1',
            },
          },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_456',
      url: 'https://checkout.stripe.com/pay/cs_test_456',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody({ distanceIndex: 1, locale: 'en' })),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_456');

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/en/egipte-malta/checkout/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/en/egipte-malta/checkout',
      })
    );
  });

  it('should return 404 if price not found for event and distance', async () => {
    mockPricesList.mockResolvedValue({ data: [] });

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody()),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Price not found for this event and distance');
  });

  it('should return 400 for missing required fields', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');

    // Missing phone
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

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('should return 400 when accommodation needed but type not specified', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody({
        needsAccommodation: true,
        accommodationType: null,
      })),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Accommodation type is required when accommodation is needed');
  });

  it('should return 409 DORM_FULL when dorm is full and user did not select waitlist', async () => {
    // First call: dorm availability check returns full (15 registrations)
    mockSql.mockResolvedValueOnce([{ dorm_count: '15' }]);

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody({
        needsAccommodation: true,
        accommodationType: 'dorm',
        accommodationWaitlist: false,
      })),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('DORM_FULL');
  });

  it('should allow dorm selection when spots are available', async () => {
    // Dorm availability check returns 5 registrations (10 spots remaining)
    mockSql.mockResolvedValueOnce([{ dorm_count: '5' }]);
    mockSql.mockResolvedValueOnce([]); // DB insert

    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: {
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '0',
            },
          },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_dorm',
      url: 'https://checkout.stripe.com/pay/cs_test_dorm',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody({
        needsAccommodation: true,
        accommodationType: 'dorm',
        accommodationWaitlist: false,
      })),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_dorm');
  });

  it('should allow dorm waitlist registration when user explicitly selects waitlist', async () => {
    // Dorm is full, but user selected waitlist
    mockSql.mockResolvedValue([]); // No dorm check needed when waitlist is true

    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: {
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '0',
            },
          },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_waitlist',
      url: 'https://checkout.stripe.com/pay/cs_test_waitlist',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody({
        needsAccommodation: true,
        accommodationType: 'dorm',
        accommodationWaitlist: true,
      })),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_waitlist');
  });

  it('should allow tent accommodation without capacity check', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: {
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '0',
            },
          },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_tent',
      url: 'https://checkout.stripe.com/pay/cs_test_tent',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody({
        needsAccommodation: true,
        accommodationType: 'tent',
      })),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_tent');
  });

  it('should include all metadata in Stripe session', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: {
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '0',
            },
          },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_meta',
      url: 'https://checkout.stripe.com/pay/cs_test_meta',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody({
        needsAccommodation: true,
        accommodationType: 'dorm',
        accommodationWaitlist: false,
        wantsPreparationTips: true,
      })),
    });

    // Mock dorm availability check
    mockSql.mockResolvedValueOnce([{ dorm_count: '5' }]);
    mockSql.mockResolvedValueOnce([]); // DB insert

    const response = await POST(request);

    expect(response.status).toBe(200);
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
      })
    );
  });

  it('should still return success even if database insert fails', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          active: true,
          product: {
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '0',
            },
          },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_db_fail',
      url: 'https://checkout.stripe.com/pay/cs_test_db_fail',
    });

    // Simulate database error on insert
    mockSql.mockRejectedValue(new Error('Database connection failed'));

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody()),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_db_fail');
  });

  it('should accept distanceIndex of 0', async () => {
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_zero',
          active: true,
          product: {
            id: 'prod_zero',
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '0',
            },
          },
        },
      ],
    });

    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_zero',
      url: 'https://checkout.stripe.com/pay/cs_test_zero',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(createValidBody({ distanceIndex: 0 })),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_zero');
  });
});
