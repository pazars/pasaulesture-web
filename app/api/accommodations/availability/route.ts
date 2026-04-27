import { NextRequest, NextResponse } from 'next/server';
import { getAccommodationAvailability } from '@/app/data/accommodation.server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventSlug = searchParams.get('eventSlug');

  if (!eventSlug) {
    return NextResponse.json(
      { error: 'Missing required parameter: eventSlug' },
      { status: 400 },
    );
  }

  const availability = await getAccommodationAvailability(eventSlug);

  if (!availability) {
    return NextResponse.json(
      { error: 'Failed to fetch accommodation availability' },
      { status: 500 },
    );
  }

  return NextResponse.json(availability);
}
