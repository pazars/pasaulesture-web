import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/app/lib/stripe';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        const {
          event_slug,
          distance_index,
          participant_name,
          participant_email,
          locale,
        } = session.metadata || {};

        if (!event_slug || !distance_index || !participant_name || !participant_email) {
          console.error('Missing required metadata in session:', session.id);
          break;
        }

        // Insert registration into database
        await sql`
          INSERT INTO registrations (
            stripe_session_id,
            stripe_payment_intent_id,
            amount_paid,
            currency,
            event_slug,
            distance_index,
            participant_name,
            participant_email,
            locale
          ) VALUES (
            ${session.id},
            ${session.payment_intent as string},
            ${session.amount_total},
            ${session.currency},
            ${event_slug},
            ${parseInt(distance_index, 10)},
            ${participant_name},
            ${participant_email},
            ${locale || 'lv'}
          )
          ON CONFLICT (stripe_session_id) DO NOTHING
        `;

        console.log('Registration created for session:', session.id);
      } catch (error) {
        console.error('Error processing webhook:', error);
        // Still return 200 to prevent Stripe from retrying
      }
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }

  return NextResponse.json({ received: true });
}
