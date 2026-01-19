import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe
const mockPricesList = vi.fn();
const mockCheckoutSessionsCreate = vi.fn();

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

describe('POST /api/checkout/create-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  });

  it('should create a checkout session successfully', async () => {
    // Mock Stripe prices response with expanded product data
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

    // Mock Stripe checkout session creation
    mockCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

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
    expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123');

    // Verify Stripe prices.list was called with correct params
    expect(mockPricesList).toHaveBeenCalledWith({
      active: true,
      expand: ['data.product'],
    });

    // Verify checkout session was created with correct params
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
      line_items: [
        {
          price: 'price_123',
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: 'janis@example.com',
      success_url: 'http://localhost:3000/egipte-malta/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/egipte-malta/checkout',
      metadata: {
        event_slug: 'egipte-malta',
        distance_index: '0',
        participant_name: 'Jānis Bērziņš',
        participant_email: 'janis@example.com',
        locale: 'lv',
      },
    });
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
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        distanceIndex: 1,
        name: 'John Doe',
        email: 'john@example.com',
        locale: 'en',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_456');

    // Verify URLs have /en/ prefix
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/en/egipte-malta/checkout/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/en/egipte-malta/checkout',
        metadata: expect.objectContaining({
          locale: 'en',
        }),
      })
    );
  });

  it('should return 404 if price not found for event and distance', async () => {
    // Mock empty prices list
    mockPricesList.mockResolvedValue({
      data: [],
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

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

    expect(response.status).toBe(404);
    expect(data.error).toBe('Price not found for this event and distance');
  });

  it('should return 400 for missing eventSlug', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        distanceIndex: 0,
        name: 'Jānis Bērziņš',
        email: 'janis@example.com',
        locale: 'lv',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields: eventSlug, distanceIndex, name, email, locale');
  });

  it('should return 400 for missing distanceIndex', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        name: 'Jānis Bērziņš',
        email: 'janis@example.com',
        locale: 'lv',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields: eventSlug, distanceIndex, name, email, locale');
  });

  it('should return 400 for missing name', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        distanceIndex: 0,
        email: 'janis@example.com',
        locale: 'lv',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields: eventSlug, distanceIndex, name, email, locale');
  });

  it('should return 400 for missing email', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        distanceIndex: 0,
        name: 'Jānis Bērziņš',
        locale: 'lv',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields: eventSlug, distanceIndex, name, email, locale');
  });

  it('should return 400 for missing locale', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        distanceIndex: 0,
        name: 'Jānis Bērziņš',
        email: 'janis@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields: eventSlug, distanceIndex, name, email, locale');
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
    expect(data.sessionId).toBe('cs_test_zero');
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          distance_index: '0',
        }),
      })
    );
  });

  it('should match prices by exact metadata values', async () => {
    // Mock prices list with multiple products
    mockPricesList.mockResolvedValue({
      data: [
        {
          id: 'price_wrong_event',
          active: true,
          product: {
            metadata: {
              event_slug: 'parize-dakara',
              distance_index: '0',
            },
          },
        },
        {
          id: 'price_wrong_distance',
          active: true,
          product: {
            metadata: {
              event_slug: 'egipte-malta',
              distance_index: '1',
            },
          },
        },
        {
          id: 'price_correct',
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
      id: 'cs_test_correct',
      url: 'https://checkout.stripe.com/pay/cs_test_correct',
    });

    const { POST } = await import('@/app/api/checkout/create-session/route');

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
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          {
            price: 'price_correct',
            quantity: 1,
          },
        ],
      })
    );
  });

  it('should include all customer metadata in session', async () => {
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
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        distanceIndex: 0,
        name: 'Jānis Bērziņš',
        email: 'janis@example.com',
        locale: 'lv',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'janis@example.com',
        metadata: {
          event_slug: 'egipte-malta',
          distance_index: '0',
          participant_name: 'Jānis Bērziņš',
          participant_email: 'janis@example.com',
          locale: 'lv',
        },
      })
    );
  });
});
