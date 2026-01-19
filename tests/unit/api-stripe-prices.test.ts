import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the stripe client before importing the route
vi.mock("@/app/lib/stripe", () => ({
  stripe: {
    prices: {
      list: vi.fn(),
    },
  },
}));

describe("GET /api/stripe/prices", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should return active prices with metadata", async () => {
    const { stripe } = await import("@/app/lib/stripe");

    // Mock Stripe prices.list response
    vi.mocked(stripe.prices.list).mockResolvedValue({
      data: [
        {
          id: "price_1",
          active: true,
          unit_amount: 6900,
          currency: "eur",
          product: {
            metadata: {
              event_slug: "egipte-malta",
              distance_index: "0",
            },
          },
        } as any,
        {
          id: "price_2",
          active: true,
          unit_amount: 6900,
          currency: "eur",
          product: {
            metadata: {
              event_slug: "egipte-malta",
              distance_index: "1",
            },
          },
        } as any,
      ],
    } as any);

    const { GET } = await import("@/app/api/stripe/prices/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({
      priceId: "price_1",
      eventSlug: "egipte-malta",
      distanceIndex: 0,
      amount: 6900,
      currency: "eur",
    });
  });

  it("should filter out inactive prices", async () => {
    const { stripe } = await import("@/app/lib/stripe");

    vi.mocked(stripe.prices.list).mockResolvedValue({
      data: [
        {
          id: "price_active",
          active: true,
          unit_amount: 6900,
          currency: "eur",
          product: {
            metadata: {
              event_slug: "egipte-malta",
              distance_index: "0",
            },
          },
        } as any,
        {
          id: "price_inactive",
          active: false,
          unit_amount: 6900,
          currency: "eur",
          product: {
            metadata: {
              event_slug: "egipte-malta",
              distance_index: "1",
            },
          },
        } as any,
      ],
    } as any);

    const { GET } = await import("@/app/api/stripe/prices/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].priceId).toBe("price_active");
  });

  it("should filter out prices without metadata", async () => {
    const { stripe } = await import("@/app/lib/stripe");

    vi.mocked(stripe.prices.list).mockResolvedValue({
      data: [
        {
          id: "price_with_metadata",
          active: true,
          unit_amount: 6900,
          currency: "eur",
          product: {
            metadata: {
              event_slug: "egipte-malta",
              distance_index: "0",
            },
          },
        } as any,
        {
          id: "price_without_metadata",
          active: true,
          unit_amount: 6900,
          currency: "eur",
          product: {
            metadata: {},
          },
        } as any,
      ],
    } as any);

    const { GET } = await import("@/app/api/stripe/prices/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].priceId).toBe("price_with_metadata");
  });

  it("should handle errors gracefully", async () => {
    const { stripe } = await import("@/app/lib/stripe");

    vi.mocked(stripe.prices.list).mockRejectedValue(
      new Error("Stripe API error")
    );

    const { GET } = await import("@/app/api/stripe/prices/route");
    const response = await GET();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should parse distance_index as integer", async () => {
    const { stripe } = await import("@/app/lib/stripe");

    vi.mocked(stripe.prices.list).mockResolvedValue({
      data: [
        {
          id: "price_1",
          active: true,
          unit_amount: 6900,
          currency: "eur",
          product: {
            metadata: {
              event_slug: "egipte-malta",
              distance_index: "2",
            },
          },
        } as any,
      ],
    } as any);

    const { GET } = await import("@/app/api/stripe/prices/route");
    const response = await GET();
    const data = await response.json();

    expect(data[0].distanceIndex).toBe(2);
    expect(typeof data[0].distanceIndex).toBe("number");
  });
});
