import Stripe from "stripe";

/**
 * Stripe client singleton
 *
 * Returns a singleton Stripe instance using lazy initialization.
 * Uses the STRIPE_SECRET_KEY environment variable for authentication.
 *
 * @throws {Error} If STRIPE_SECRET_KEY is not set
 */

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  }

  return stripeInstance;
}
