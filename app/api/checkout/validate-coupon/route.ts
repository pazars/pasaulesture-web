import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/app/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      );
    }

    // Fetch promotion code from Stripe
    const coupon = await stripe.coupons.retrieve(code);

    // Check if coupon is valid
    if (!coupon.valid) {
      return NextResponse.json(
        { error: 'INVALID_COUPON', message: 'Coupon is not valid' },
        { status: 400 }
      );
    }

    // Only support percent_off coupons (can extend to amount_off later)
    if (!coupon.percent_off) {
      return NextResponse.json(
        { error: 'UNSUPPORTED_COUPON', message: 'Only percentage discounts are supported' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      percentOff: coupon.percent_off,
      code: coupon.id,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
