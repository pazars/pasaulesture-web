import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSql = vi.fn();

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => mockSql),
}));

describe('GET /api/accommodations/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgres://mock';
  });

  it('should return dorm availability with spots remaining', async () => {
    // Mock 5 completed dorm registrations
    mockSql.mockResolvedValue([{ dorm_count: '5' }]);

    const { GET } = await import('@/app/api/accommodations/availability/route');

    const request = new NextRequest(
      'http://localhost:3000/api/accommodations/availability?eventSlug=egipte-malta'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dorm.total).toBe(15);
    expect(data.dorm.remaining).toBe(10);
    expect(data.dorm.available).toBe(true);
  });

  it('should return dorm as unavailable when full', async () => {
    // Mock 15 completed dorm registrations (full)
    mockSql.mockResolvedValue([{ dorm_count: '15' }]);

    const { GET } = await import('@/app/api/accommodations/availability/route');

    const request = new NextRequest(
      'http://localhost:3000/api/accommodations/availability?eventSlug=egipte-malta'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dorm.total).toBe(15);
    expect(data.dorm.remaining).toBe(0);
    expect(data.dorm.available).toBe(false);
  });

  it('should return dorm as unavailable when over capacity', async () => {
    // Mock more than 15 registrations (edge case)
    mockSql.mockResolvedValue([{ dorm_count: '20' }]);

    const { GET } = await import('@/app/api/accommodations/availability/route');

    const request = new NextRequest(
      'http://localhost:3000/api/accommodations/availability?eventSlug=egipte-malta'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dorm.remaining).toBe(0); // Should not be negative
    expect(data.dorm.available).toBe(false);
  });

  it('should return full availability when no registrations exist', async () => {
    // Mock no registrations
    mockSql.mockResolvedValue([{ dorm_count: '0' }]);

    const { GET } = await import('@/app/api/accommodations/availability/route');

    const request = new NextRequest(
      'http://localhost:3000/api/accommodations/availability?eventSlug=egipte-malta'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dorm.total).toBe(15);
    expect(data.dorm.remaining).toBe(15);
    expect(data.dorm.available).toBe(true);
  });

  it('should return 400 when eventSlug is missing', async () => {
    const { GET } = await import('@/app/api/accommodations/availability/route');

    const request = new NextRequest(
      'http://localhost:3000/api/accommodations/availability'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required parameter: eventSlug');
  });

  it('should handle database errors gracefully', async () => {
    mockSql.mockRejectedValue(new Error('Database connection failed'));

    const { GET } = await import('@/app/api/accommodations/availability/route');

    const request = new NextRequest(
      'http://localhost:3000/api/accommodations/availability?eventSlug=egipte-malta'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch accommodation availability');
  });

  it('should handle null/undefined dorm_count from database', async () => {
    // Mock empty result
    mockSql.mockResolvedValue([{}]);

    const { GET } = await import('@/app/api/accommodations/availability/route');

    const request = new NextRequest(
      'http://localhost:3000/api/accommodations/availability?eventSlug=egipte-malta'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dorm.remaining).toBe(15); // Should default to 0 count, so 15 remaining
    expect(data.dorm.available).toBe(true);
  });
});
