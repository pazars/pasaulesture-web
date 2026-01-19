import { describe, it, expect, beforeAll } from "vitest";
import Stripe from "stripe";

// Set up test environment variables
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_mock_key_for_testing";
});

describe("Stripe Client", () => {
  it("should initialize Stripe client with secret key", async () => {
    // Import the stripe client
    const { stripe } = await import("@/app/lib/stripe");

    // Verify it's a Stripe instance
    expect(stripe).toBeInstanceOf(Stripe);
  });

  it("should use the same instance (singleton pattern)", async () => {
    // Import stripe twice
    const { stripe: stripe1 } = await import("@/app/lib/stripe");
    const { stripe: stripe2 } = await import("@/app/lib/stripe");

    // Verify they're the same instance
    expect(stripe1).toBe(stripe2);
  });
});
