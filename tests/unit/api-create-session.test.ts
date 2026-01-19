import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe
const mockCreate = vi.fn();
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  })),
}));

// Mock Prisma
const mockFindFirst = vi.fn();
vi.mock('@/lib/prisma', () => ({
  default: {
    stripePrice: {
      findFirst: mockFindFirst,
    },
  },
}));

describe('POST /api/checkout/create-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  });

  it('should create a checkout session successfully', async () => {
    const mockPriceData = {
      id: 'price_123',
      stripeId: 'price_stripe123',
      eventSlug: 'egipte-malta',
      distanceKey: 'full',
      currency: 'eur',
      unitAmount: 5000,
    };

    const mockSession = {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    };

    mockFindFirst.mockResolvedValue(mockPriceData);
    mockCreate.mockResolvedValue(mockSession);

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        distanceKey: 'full',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_123');
    expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        eventSlug: 'egipte-malta',
        distanceKey: 'full',
        isActive: true,
      },
    });
    expect(mockCreate).toHaveBeenCalled();
  });

  it('should return 404 if price not found', async () => {
    mockFindFirst.mockResolvedValue(null);

    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
        distanceKey: 'full',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Price not found for this event and distance');
  });

  it('should return 400 for missing fields', async () => {
    const { POST } = await import('@/app/api/checkout/create-session/route');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        eventSlug: 'egipte-malta',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields: eventSlug, distanceKey');
  });
});
