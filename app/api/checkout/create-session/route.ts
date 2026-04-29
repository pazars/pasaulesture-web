import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const DORM_TOTAL_SPOTS = 15;

function getString(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === 'string' ? v : '';
}

function getBool(form: FormData, key: string): boolean {
  return getString(form, key) === '1';
}

function buildBackUrl(
  baseUrl: string,
  locale: string,
  eventSlug: string,
  distanceIndex: string,
  error: string,
): string {
  const localePrefix = locale === 'lv' || !locale ? '' : `/${locale}`;
  const params = new URLSearchParams();
  if (distanceIndex) params.set('distance', distanceIndex);
  params.set('error', error);
  return `${baseUrl}${localePrefix}/${eventSlug}/checkout?${params.toString()}`;
}

export async function POST(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Parse early so we can build redirect-back URLs even on error paths.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.redirect(`${baseUrl}/?error=server`, { status: 303 });
  }

  const eventSlug = getString(form, 'eventSlug');
  const distanceIndexStr = getString(form, 'distanceIndex');
  const distanceIndex = parseInt(distanceIndexStr, 10);
  const locale = getString(form, 'locale') || 'lv';

  const back = (error: string) =>
    NextResponse.redirect(
      buildBackUrl(baseUrl, locale, eventSlug || '', distanceIndexStr, error),
      { status: 303 },
    );

  try {
    const name = getString(form, 'name');
    const email = getString(form, 'email');
    const phone = getString(form, 'phone');
    const emergencyContactName = 'N/A';
    const emergencyContactPhone = 'N/A';
    const needsAccommodation = getBool(form, 'needsAccommodation');
    const accommodationTypeRaw = getString(form, 'accommodationType');
    const accommodationType = accommodationTypeRaw || null;
    const accommodationWaitlist = getBool(form, 'accommodationWaitlist');
    const wantsPreparationTips = getBool(form, 'wantsPreparationTips');
    const preparationTipsChannel = getString(form, 'preparationTipsChannel') || null;
    const couponId = getString(form, 'couponId') || null;
    const originalPriceStr = getString(form, 'originalPrice');
    const originalPrice = originalPriceStr ? parseInt(originalPriceStr, 10) : null;
    const submittedPriceId = getString(form, 'priceId');

    // Validate ALL required fields
    if (
      !eventSlug ||
      !distanceIndexStr ||
      Number.isNaN(distanceIndex) ||
      !name ||
      !email ||
      !phone ||
      !locale
    ) {
      return back('missing_fields');
    }

    if (needsAccommodation && !accommodationType) {
      return back('missing_fields');
    }

    // Dorm race-check: user selected dorm when spots were available, but spots are now full.
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
        return back('dorm_full');
      }
    }

    // Resolve the Stripe price. Prefer client-supplied priceId (SSR'd into the page) —
    // single targeted GET vs. listing the whole catalog. Always re-validate the price's
    // product metadata so a tampered priceId can't pay a mismatched event/distance.
    let resolvedPrice: Stripe.Price | null = null;
    if (submittedPriceId) {
      try {
        const price = await stripe.prices.retrieve(submittedPriceId, {
          expand: ['product'],
        });
        const product = price.product as Stripe.Product;
        if (
          price.active &&
          product?.metadata?.event_slug === eventSlug &&
          product?.metadata?.distance_index === String(distanceIndex)
        ) {
          resolvedPrice = price;
        }
      } catch {
        // Fall through to list-search.
      }
    }

    if (!resolvedPrice) {
      const prices = await stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });
      resolvedPrice =
        prices.data.find((price) => {
          const product = price.product as Stripe.Product;
          return (
            product.metadata?.event_slug === eventSlug &&
            product.metadata?.distance_index === String(distanceIndex)
          );
        }) || null;
    }

    if (!resolvedPrice) {
      return back('price_unavailable');
    }

    // Create Stripe Checkout Session
    const localePrefix = locale === 'lv' ? '' : `/${locale}`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price: resolvedPrice.id,
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
        needs_accommodation: String(needsAccommodation),
        accommodation_type: accommodationType || '',
        accommodation_waitlist: String(accommodationWaitlist),
        wants_preparation_tips: String(wantsPreparationTips),
        preparation_tips_channel: preparationTipsChannel || '',
        locale,
        coupon_id: couponId || '',
        original_price: originalPrice ? String(originalPrice) : '',
      },
    };

    // TODO: re-validate coupon server-side here — currently couponId is client-trusted.
    if (couponId) {
      sessionParams.discounts = [{ coupon: couponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create pending registration in database (best-effort; webhook will reconcile if it fails).
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
          ${needsAccommodation},
          ${accommodationType},
          ${accommodationWaitlist},
          ${wantsPreparationTips},
          ${preparationTipsChannel},
          ${locale},
          'pending',
          ${couponId},
          ${originalPrice}
        )
      `;
    } catch (dbError) {
      console.error('Error creating pending registration:', dbError);
    }

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return back('server');
  }
}
