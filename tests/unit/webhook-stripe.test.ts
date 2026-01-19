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

vi.mock('@vercel/postgres', () => ({
  sql: mockSql,
}));

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');
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

  it('should process checkout.session.completed event', async () => {
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
    mockSql.mockResolvedValue({ rows: [] } as any);

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
    expect(mockSql).toHaveBeenCalledWith(
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
});
