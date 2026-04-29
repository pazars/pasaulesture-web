import "server-only";
import Stripe from "stripe";
import { getStripeClient } from "@/app/lib/stripe";

export interface StripePriceData {
  priceId: string;
  eventSlug: string;
  distanceIndex: number;
  amount: number;
  currency: string;
}

export async function getStripePrices(): Promise<StripePriceData[] | null> {
  try {
    const stripe = getStripeClient();
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    return prices.data
      .filter((price) => {
        if (typeof price.product === "string") return false;
        const product = price.product as Stripe.Product;
        return (
          price.active &&
          !!product.metadata?.event_slug &&
          product.metadata?.distance_index !== undefined
        );
      })
      .map((price) => {
        const product = price.product as Stripe.Product;
        return {
          priceId: price.id,
          eventSlug: product.metadata.event_slug,
          distanceIndex: parseInt(product.metadata.distance_index, 10),
          amount: price.unit_amount || 0,
          currency: price.currency,
        };
      });
  } catch (error) {
    console.error("Error fetching Stripe prices:", error);
    return null;
  }
}
