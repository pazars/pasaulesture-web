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

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "lv",
}));

// Mock react-phone-number-input
vi.mock("react-phone-number-input", () => ({
  default: ({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) => (
    <input
      type="tel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      data-testid="phone-input"
    />
  ),
  isValidPhoneNumber: () => true,
}));

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
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          prices: [
            { priceId: "price_123", eventSlug: "egipte-malta", distanceIndex: 0, amount: 6900 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          dorm: { total: 15, remaining: 10, available: true },
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
          dorm: { total: 15, remaining: 10, available: true },
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
      const button = screen.getByRole("button", { name: /checkout_submit/i });
      expect(button).not.toBeDisabled();
    });

    // Fill form - name, email, phone, emergency contact fields
    await userEvent.type(screen.getByLabelText(/checkout_name_label/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/checkout_email_label/i), "john@example.com");
    // Fill phone inputs (there are multiple phone-input testids)
    const phoneInputs = screen.getAllByTestId("phone-input");
    await userEvent.type(phoneInputs[0], "+37120000000"); // participant phone
    // Fill emergency contact fields
    await userEvent.type(screen.getByLabelText(/checkout_emergency_name_label/i), "Jane Doe");
    await userEvent.type(phoneInputs[1], "+37120000001"); // emergency phone
    // Accept terms (first checkbox that isn't accommodation/tips)
    const checkboxes = screen.getAllByRole("checkbox");
    const termsCheckbox = checkboxes.find(cb => cb.id === "terms");
    if (termsCheckbox) await userEvent.click(termsCheckbox);

    // Submit
    await userEvent.click(screen.getByRole("button", { name: /checkout_submit/i }));

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
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          prices: [], // No prices
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          dorm: { total: 15, remaining: 10, available: true },
        }),
      });
    global.fetch = mockFetch;

    render(<CheckoutForm event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    });
  });
});
