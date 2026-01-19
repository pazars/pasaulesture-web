import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventSlug, distanceKey } = body;

    // Validate required fields
    if (!eventSlug || !distanceKey) {
      return NextResponse.json(
        { error: 'Missing required fields: eventSlug, distanceKey' },
        { status: 400 }
      );
    }

    // Find the active price in our database
    const priceData = await prisma.stripePrice.findFirst({
      where: {
        eventSlug,
        distanceKey,
        isActive: true,
      },
    });

    if (!priceData) {
      return NextResponse.json(
        { error: 'Price not found for this event and distance' },
        { status: 404 }
      );
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceData.stripeId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/en/${eventSlug}?success=true`,
      cancel_url: `${baseUrl}/en/${eventSlug}?canceled=true`,
      metadata: {
        eventSlug: priceData.eventSlug,
        distanceKey: priceData.distanceKey,
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
