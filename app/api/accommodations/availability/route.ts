import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const DORM_TOTAL_SPOTS = 15;

export async function GET(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get('eventSlug');

    if (!eventSlug) {
      return NextResponse.json(
        { error: 'Missing required parameter: eventSlug' },
        { status: 400 }
      );
    }

    // Count completed registrations with dorm accommodation (not on waitlist)
    const result = await sql`
      SELECT COUNT(*) as dorm_count
      FROM registrations
      WHERE event_slug = ${eventSlug}
        AND payment_status = 'completed'
        AND accommodation_type = 'dorm'
        AND accommodation_waitlist = FALSE
    `;

    const dormCount = parseInt(result[0]?.dorm_count || '0', 10);
    const remaining = Math.max(0, DORM_TOTAL_SPOTS - dormCount);

    return NextResponse.json({
      dorm: {
        total: DORM_TOTAL_SPOTS,
        remaining,
        available: remaining > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching accommodation availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accommodation availability' },
      { status: 500 }
    );
  }
}
