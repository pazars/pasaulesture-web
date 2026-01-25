import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Create persistent mock functions
const mockConstructEvent = vi.fn();
const mockSql = vi.fn();

// Mock the modules
vi.mock('@/app/lib/stripe', () => ({
  getStripeClient: vi.fn(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => mockSql),
}));

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');
    vi.stubEnv('DATABASE_URL', 'postgres://mock');
  });

  it('should return 400 if signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const { POST } = await import('@/app/api/webhooks/stripe/route');

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

  it('should update existing pending registration on checkout.session.completed', async () => {
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

    mockConstructEvent.mockReturnValue(mockEvent);
    // First call is UPDATE (returns 1 row updated)
    mockSql.mockResolvedValueOnce([{ id: 1 }] as any);

    const { POST } = await import('@/app/api/webhooks/stripe/route');

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    // Should have called UPDATE query
    expect(mockSql).toHaveBeenCalledTimes(1);
  });

  it('should insert new registration if no pending registration exists', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_456',
          payment_intent: 'pi_test_456',
          amount_total: 6900,
          currency: 'eur',
          metadata: {
            event_slug: 'egipte-malta',
            distance_index: '0',
            participant_name: 'Test User',
            participant_email: 'test@example.com',
            locale: 'lv',
          },
        },
      },
    };

    mockConstructEvent.mockReturnValue(mockEvent);
    // First call is UPDATE (returns 0 rows - no pending registration)
    mockSql.mockResolvedValueOnce([] as any);
    // Second call is INSERT
    mockSql.mockResolvedValueOnce([] as any);

    const { POST } = await import('@/app/api/webhooks/stripe/route');

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    // Should have called UPDATE first, then INSERT
    expect(mockSql).toHaveBeenCalledTimes(2);
  });

  it('should return 200 even if database insert fails (idempotent)', async () => {
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

    mockConstructEvent.mockReturnValue(mockEvent);
    mockSql.mockRejectedValue(new Error('Database error'));

    const { POST } = await import('@/app/api/webhooks/stripe/route');

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

  it('should mark registration as expired on checkout.session.expired', async () => {
    const mockEvent = {
      type: 'checkout.session.expired',
      data: {
        object: {
          id: 'cs_test_expired_123',
        },
      },
    };

    mockConstructEvent.mockReturnValue(mockEvent);
    mockSql.mockResolvedValue({ rowCount: 1 } as any);

    const { POST } = await import('@/app/api/webhooks/stripe/route');

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockSql).toHaveBeenCalledTimes(1);
  });
});
