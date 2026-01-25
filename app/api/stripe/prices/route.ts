import { NextResponse } from "next/server";
import { getStripeClient } from "@/app/lib/stripe";
import Stripe from "stripe";

/**
 * GET /api/stripe/prices
 *
 * Fetches all active Stripe prices with event metadata.
 * Filters prices to only include those with:
 * - active: true
 * - product.metadata.event_slug (string)
 * - product.metadata.distance_index (numeric string)
 *
 * Returns:
 * {
 *   prices: [
 *     {
 *       priceId: "price_...",
 *       eventSlug: "egipte-malta",
 *       distanceIndex: 0,
 *       amount: 6900,
 *       currency: "eur"
 *     },
 *     ...
 *   ]
 * }
 */

export const dynamic = "force-dynamic";

interface PriceData {
  priceId: string;
  eventSlug: string;
  distanceIndex: number;
  amount: number;
  currency: string;
}

export async function GET() {
  try {
    const stripe = getStripeClient();

    // Fetch all active prices with expanded product data
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    // Filter and map prices to our format
    const formattedPrices: PriceData[] = prices.data
      .filter((price) => {
        // Ensure product is expanded and has required metadata
        if (typeof price.product === "string") return false;

        const product = price.product as Stripe.Product;
        const metadata = product.metadata;

        return (
          price.active &&
          metadata.event_slug &&
          metadata.distance_index !== undefined
        );
      })
      .map((price) => {
        const product = price.product as Stripe.Product;
        const metadata = product.metadata;

        return {
          priceId: price.id,
          eventSlug: metadata.event_slug,
          distanceIndex: parseInt(metadata.distance_index, 10),
          amount: price.unit_amount || 0,
          currency: price.currency,
        };
      });

    return NextResponse.json({ prices: formattedPrices });
  } catch (error) {
    console.error("Error fetching Stripe prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}

// Enable caching for 5 minutes
export const revalidate = 300;
