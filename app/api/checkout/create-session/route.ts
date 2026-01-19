import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventSlug, distanceIndex, name, email, locale } = body;

    // Validate ALL required fields
    if (!eventSlug || distanceIndex === undefined || !name || !email || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields: eventSlug, distanceIndex, name, email, locale' },
        { status: 400 }
      );
    }

    // Fetch prices using Stripe API with expanded product data
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    // Find matching price by product metadata
    const matchingPrice = prices.data.find((price) => {
      const product = price.product as Stripe.Product;
      return (
        product.metadata?.event_slug === eventSlug &&
        product.metadata?.distance_index === String(distanceIndex)
      );
    });

    if (!matchingPrice) {
      return NextResponse.json(
        { error: 'Price not found for this event and distance' },
        { status: 404 }
      );
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const localePrefix = locale === 'lv' ? '' : `/${locale}`;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: matchingPrice.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${baseUrl}${localePrefix}/${eventSlug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${localePrefix}/${eventSlug}/checkout`,
      metadata: {
        event_slug: eventSlug,
        distance_index: String(distanceIndex),
        participant_name: name,
        participant_email: email,
        locale: locale,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
