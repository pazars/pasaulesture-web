import Stripe from "stripe";

/**
 * Stripe client singleton
 *
 * Ensures only one Stripe instance is created across the application.
 * Uses the STRIPE_SECRET_KEY environment variable for authentication.
 *
 * @throws {Error} If STRIPE_SECRET_KEY is not set
 */

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
