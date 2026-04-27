import "server-only";
import { neon } from "@neondatabase/serverless";

const DORM_TOTAL_SPOTS = 15;

export interface AccommodationAvailability {
  dorm: {
    total: number;
    remaining: number;
    available: boolean;
  };
}

export async function getAccommodationAvailability(
  eventSlug: string,
): Promise<AccommodationAvailability | null> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      SELECT COUNT(*) as dorm_count
      FROM registrations
      WHERE event_slug = ${eventSlug}
        AND payment_status = 'completed'
        AND accommodation_type = 'dorm'
        AND accommodation_waitlist = FALSE
    `;

    const dormCount = parseInt(result[0]?.dorm_count || "0", 10);
    const remaining = Math.max(0, DORM_TOTAL_SPOTS - dormCount);

    return {
      dorm: {
        total: DORM_TOTAL_SPOTS,
        remaining,
        available: remaining > 0,
      },
    };
  } catch (error) {
    console.error("Error fetching accommodation availability:", error);
    return null;
  }
}
