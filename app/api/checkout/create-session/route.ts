import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const DORM_TOTAL_SPOTS = 15;

export async function POST(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const body = await request.json();
    const {
      eventSlug,
      distanceIndex,
      name,
      email,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      needsAccommodation,
      accommodationType,
      accommodationWaitlist,
      wantsPreparationTips,
      preparationTipsChannel,
      locale,
      couponId,
      originalPrice,
    } = body;

    // Validate ALL required fields
    if (!eventSlug || distanceIndex === undefined || !name || !email || !phone || !emergencyContactName || !emergencyContactPhone || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields: eventSlug, distanceIndex, name, email, phone, emergencyContactName, emergencyContactPhone, locale' },
        { status: 400 }
      );
    }

    // Validate accommodation type if accommodation is needed
    if (needsAccommodation && !accommodationType) {
      return NextResponse.json(
        { error: 'Accommodation type is required when accommodation is needed' },
        { status: 400 }
      );
    }

    // Check for dorm race condition: user selected dorm when spots were available,
    // but spots are now full
    if (needsAccommodation && accommodationType === 'dorm' && !accommodationWaitlist) {
      const result = await sql`
        SELECT COUNT(*) as dorm_count
        FROM registrations
        WHERE event_slug = ${eventSlug}
          AND payment_status = 'completed'
          AND accommodation_type = 'dorm'
          AND accommodation_waitlist = FALSE
      `;

      const dormCount = parseInt(result[0]?.dorm_count || '0', 10);
      const remaining = DORM_TOTAL_SPOTS - dormCount;

      if (remaining <= 0) {
        return NextResponse.json(
          { error: 'DORM_FULL', message: 'Dorm spots filled while you were registering. Please refresh to update availability.' },
          { status: 409 }
        );
      }
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

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
        participant_phone: phone,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        needs_accommodation: String(needsAccommodation || false),
        accommodation_type: accommodationType || '',
        accommodation_waitlist: String(accommodationWaitlist || false),
        wants_preparation_tips: String(wantsPreparationTips || false),
        preparation_tips_channel: preparationTipsChannel || '',
        locale: locale,
        coupon_id: couponId || '',
        original_price: originalPrice ? String(originalPrice) : '',
      },
    };

    // Add discounts array if coupon is valid
    if (couponId) {
      sessionParams.discounts = [{ coupon: couponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create pending registration in database
    try {
      await sql`
        INSERT INTO registrations (
          stripe_session_id,
          event_slug,
          distance_index,
          participant_name,
          participant_email,
          participant_phone,
          emergency_contact_name,
          emergency_contact_phone,
          needs_accommodation,
          accommodation_type,
          accommodation_waitlist,
          wants_preparation_tips,
          preparation_tips_channel,
          locale,
          payment_status,
          coupon_id,
          original_price
        ) VALUES (
          ${session.id},
          ${eventSlug},
          ${distanceIndex},
          ${name},
          ${email},
          ${phone},
          ${emergencyContactName},
          ${emergencyContactPhone},
          ${needsAccommodation || false},
          ${accommodationType || null},
          ${accommodationWaitlist || false},
          ${wantsPreparationTips || false},
          ${preparationTipsChannel || null},
          ${locale},
          'pending',
          ${couponId},
          ${originalPrice}
        )
      `;
    } catch (dbError) {
      console.error('Error creating pending registration:', dbError);
      // Continue anyway - webhook will create if this fails
    }

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
