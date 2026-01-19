import { describe, it, expect, beforeAll } from "vitest";
import Stripe from "stripe";

// Set up test environment variables
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_mock_key_for_testing";
});

describe("Stripe Client", () => {
  it("should initialize Stripe client with secret key", async () => {
    const { getStripeClient } = await import("@/app/lib/stripe");

    const stripe = getStripeClient();

    // Verify it's a Stripe instance
    expect(stripe).toBeInstanceOf(Stripe);
  });

  it("should use the same instance (singleton pattern)", async () => {
    const { getStripeClient } = await import("@/app/lib/stripe");

    const stripe1 = getStripeClient();
    const stripe2 = getStripeClient();

    // Verify they're the same instance
    expect(stripe1).toBe(stripe2);
  });

  it("should throw error if STRIPE_SECRET_KEY is not set", async () => {
    // Save original env var
    const originalKey = process.env.STRIPE_SECRET_KEY;

    // Clear the env var
    delete process.env.STRIPE_SECRET_KEY;

    // Reset the module to clear the singleton
    await vi.resetModules();

    // Import fresh module
    const { getStripeClient } = await import("@/app/lib/stripe");

    // Verify it throws
    expect(() => getStripeClient()).toThrow("STRIPE_SECRET_KEY is not set");

    // Restore env var
    process.env.STRIPE_SECRET_KEY = originalKey;
  });
});
