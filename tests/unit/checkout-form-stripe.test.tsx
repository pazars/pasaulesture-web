/**
 * CheckoutForm Stripe Integration Tests
 *
 * Tests the CheckoutForm component's integration with Stripe APIs:
 * - Fetching prices from /api/stripe/prices
 * - Creating checkout sessions via /api/checkout/create-session
 * - Redirecting to Stripe Checkout
 * - Error handling for missing prices
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CheckoutForm from "@/app/components/CheckoutForm";
import { events } from "@/app/data/events";

// Mock fetch
global.fetch = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    has: vi.fn(),
  }),
}));

// Mock paraglide runtime
vi.mock("@/paraglide/runtime", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getLocale: () => "lv",
  };
});

describe("CheckoutForm Stripe Integration", () => {
  const mockEvent = events["egipte-malta"];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: "" } as any;
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
  });

  it("fetches prices on mount", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        prices: [
          { priceId: "price_123", eventSlug: "egipte-malta", distanceIndex: 0, amount: 6900 },
        ],
      }),
    });
    global.fetch = mockFetch;

    render(<CheckoutForm event={mockEvent} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/stripe/prices");
    });
  });

  it("creates checkout session and redirects on submit", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          prices: [
            { priceId: "price_123", eventSlug: "egipte-malta", distanceIndex: 1, amount: 6900 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: "https://checkout.stripe.com/pay/cs_test_123",
        }),
      });
    global.fetch = mockFetch;

    render(<CheckoutForm event={mockEvent} />);

    // Wait for prices to load and button to become enabled
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /turpināt uz maksājumu/i });
      expect(button).not.toBeDisabled();
    });

    // Fill form
    await userEvent.type(screen.getByLabelText(/vārds/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/e-pasts/i), "john@example.com");
    await userEvent.click(screen.getByRole("checkbox"));

    // Submit
    await userEvent.click(screen.getByRole("button", { name: /turpināt uz maksājumu/i }));

    // Check session creation request
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/checkout/create-session",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("egipte-malta"),
        })
      );
    });

    // Check redirect
    expect(window.location.href).toBe("https://checkout.stripe.com/pay/cs_test_123");
  });

  it("shows error if price not found", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        prices: [], // No prices
      }),
    });
    global.fetch = mockFetch;

    render(<CheckoutForm event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    });
  });
});
