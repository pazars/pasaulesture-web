import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/app/lib/stripe';
import { neon } from '@neondatabase/serverless';
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

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      let session: Stripe.Checkout.Session;
      try {
        // Fetch full session from API (thin events only include minimal data)
        session = await stripe.checkout.sessions.retrieve(
          (event.data.object as Stripe.Checkout.Session).id
        );
      } catch (fetchError) {
        console.error('Failed to fetch session from Stripe:', fetchError);
        break;
      }

      // Debug logging
      console.log('Session retrieved:', {
        id: session.id,
        payment_intent: session.payment_intent,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      });

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

        // Try to update existing pending registration first
        const updateResult = await sql`
          UPDATE registrations
          SET
            payment_status = 'completed',
            stripe_payment_intent_id = ${typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id},
            amount_paid = ${session.amount_total},
            currency = ${session.currency},
            coupon_id = ${session.metadata?.coupon_id || null},
            original_price = ${session.metadata?.original_price ? parseInt(session.metadata.original_price) : null}
          WHERE stripe_session_id = ${session.id}
          RETURNING id
        `;

        if (updateResult.length === 0) {
          // No pending registration found, insert new one (fallback for edge cases)
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
              locale,
              payment_status,
              coupon_id,
              original_price
            ) VALUES (
              ${session.id},
              ${typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id},
              ${session.amount_total},
              ${session.currency},
              ${event_slug},
              ${parseInt(distance_index, 10)},
              ${participant_name},
              ${participant_email},
              ${locale || 'lv'},
              'completed',
              ${session.metadata?.coupon_id || null},
              ${session.metadata?.original_price ? parseInt(session.metadata.original_price) : null}
            )
            ON CONFLICT (stripe_session_id) DO UPDATE SET
              payment_status = 'completed',
              stripe_payment_intent_id = ${typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id},
              amount_paid = ${session.amount_total},
              currency = ${session.currency},
              coupon_id = ${session.metadata?.coupon_id || null},
              original_price = ${session.metadata?.original_price ? parseInt(session.metadata.original_price) : null}
          `;
          console.log('Registration created for session:', session.id);
        } else {
          console.log('Registration updated to completed for session:', session.id);
        }
      } catch (error) {
        console.error('Error processing checkout.session.completed:', error);
        // Still return 200 to prevent Stripe from retrying
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        await sql`
          UPDATE registrations
          SET payment_status = 'expired'
          WHERE stripe_session_id = ${session.id}
            AND payment_status = 'pending'
        `;
        console.log('Registration marked as expired for session:', session.id);
      } catch (error) {
        console.error('Error processing checkout.session.expired:', error);
      }
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  return NextResponse.json({ received: true });
}
