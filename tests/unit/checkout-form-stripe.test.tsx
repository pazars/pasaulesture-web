/**
 * CheckoutForm Stripe Integration Tests
 *
 * Tests the CheckoutForm component's integration with Stripe APIs:
 * - Receives prices via `initialPrices` prop (SSR'd from the checkout page)
 * - Native form POST to /api/checkout/create-session (browser-driven 303 redirect)
 * - Error handling when no matching price is available
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CheckoutForm from "@/app/components/CheckoutForm";
import { events } from "@/app/data/events";

// Mock fetch (still needed for accommodation availability + discount lookups)
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

const accommodationFetch = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ dorm: { total: 15, remaining: 10, available: true } }),
  });

describe("CheckoutForm Stripe Integration", () => {
  const mockEvent = events["egipte-malta"];

  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
  });

  it("renders the matching price from initialPrices without any fetch to /api/stripe/prices", async () => {
    const mockFetch = accommodationFetch();
    global.fetch = mockFetch;

    render(
      <CheckoutForm
        event={mockEvent}
        initialPrices={[
          { priceId: "price_123", eventSlug: "egipte-malta", distanceIndex: 1, amount: 6900 },
        ]}
      />,
    );

    // Price renders synchronously from props, no waiting on a fetch.
    await waitFor(() => {
      expect(screen.getByText("€69.00")).toBeInTheDocument();
    });

    // Confirm we never poked /api/stripe/prices.
    const calls = mockFetch.mock.calls.map((c) => c[0]);
    expect(calls).not.toContain("/api/stripe/prices");
  });

  it("renders a native POST form pointing at the create-session endpoint with hidden state inputs", async () => {
    global.fetch = accommodationFetch();

    const { container } = render(
      <CheckoutForm
        event={mockEvent}
        initialPrices={[
          { priceId: "price_123", eventSlug: "egipte-malta", distanceIndex: 1, amount: 6900 },
        ]}
      />,
    );

    const button = screen.getByRole("button", { name: /checkout_submit/i });
    expect(button).not.toBeDisabled();

    // The form drives a native POST so the browser owns the redirect (suspension-safe).
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.method.toLowerCase()).toBe("post");
    expect(form!.getAttribute("action")).toBe("/api/checkout/create-session");

    // Fill participant fields so visible inputs serialize.
    await userEvent.type(screen.getByLabelText(/checkout_name_label/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/checkout_email_label/i), "john@example.com");
    await userEvent.type(screen.getByTestId("phone-input"), "+37120000000");

    const fd = new FormData(form!);

    // Hidden inputs project JS-controlled state into FormData.
    expect(fd.get("eventSlug")).toBe("egipte-malta");
    expect(fd.get("locale")).toBe("lv");
    expect(fd.get("priceId")).toBe("price_123");
    expect(fd.get("phone")).toBe("+37120000000");
    expect(fd.get("needsAccommodation")).toBe("0");
    expect(fd.get("originalPrice")).toBe("6900");

    // Visible inputs serialize via their name= attributes.
    expect(fd.get("name")).toBe("John Doe");
    expect(fd.get("email")).toBe("john@example.com");
  });

  it("shows error banner when no matching price is in initialPrices", async () => {
    global.fetch = accommodationFetch();

    render(<CheckoutForm event={mockEvent} initialPrices={[]} />);

    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    });
  });

  it("shows error banner when initialPrices is null (server-side fetch failed)", async () => {
    global.fetch = accommodationFetch();

    render(<CheckoutForm event={mockEvent} initialPrices={null} />);

    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    });
  });
});
