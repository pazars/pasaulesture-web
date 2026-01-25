export interface EventFact {
  icon: string;
  labelKey: string; // Translation key for label
  value: string;
}

export interface EventLocation {
  name: string;
  googleMapsUrl: string;
}

export interface EventDistance {
  nameKey: string; // Translation key for distance name
  facts: EventFact[];
  distanceEmbedUrl: string;
  // price field removed - managed in Stripe Dashboard
}

export interface EventData {
  slug: string;
  nameKey: string; // Translation key for event name
  date: Date;
  location: EventLocation;
  surfaceType: string;
  distances: EventDistance[];
  registrationUrl: string;
}

export const events: Record<string, EventData> = {
  "egipte-malta": {
    slug: "egipte-malta",
    nameKey: "event_egipte_malta",
    date: new Date("2026-06-06"),
    location: {
      name: "Sarkaņkalns",
      googleMapsUrl: "https://maps.app.goo.gl/ZT7SXvmoPGzpR8DM8",
    },
    surfaceType: "Gravel",
    distances: [
      {
        nameKey: "distance_adventure",
        facts: [
          { icon: "calendar", labelKey: "label_date", value: "06/06 9AM" },
          { icon: "route", labelKey: "label_distance", value: "200 km" },
          { icon: "mountain", labelKey: "label_elevation", value: "1200 m" },
          { icon: "clock", labelKey: "label_time_limit", value: "35h" },
        ],
        distanceEmbedUrl:
          "https://ridewithgps.com/embeds?type=route&id=53804940&title=%C4%92%C4%A3ipte&metricUnits=true&sampleGraph=true",
      },
      {
        nameKey: "distance_challenge",
        facts: [
          { icon: "calendar", labelKey: "label_date", value: "06/06 9AM" },
          { icon: "route", labelKey: "label_distance", value: "370 km" },
          { icon: "mountain", labelKey: "label_elevation", value: "3000 m" },
          { icon: "clock", labelKey: "label_time_limit", value: "35h" },
        ],
        distanceEmbedUrl:
          "https://ridewithgps.com/embeds?type=route&id=53804909&title=%C4%92%C4%A3ipte%20-%20Malta&metricUnits=true&sampleGraph=true",
      }
    ],
    registrationUrl: "",
  },
  "parize-dakara": {
    slug: "parize-dakara",
    nameKey: "event_parize_dakara",
    date: new Date("2026-08-29"),
    location: {
      name: "Kurzeme",
      googleMapsUrl: "",
    },
    surfaceType: "Gravel",
    distances: [
      {
        nameKey: "distance_long",
        facts: [
          { icon: "calendar", labelKey: "label_date", value: "29/08" },
          { icon: "route", labelKey: "label_distance", value: "380 km" },
          { icon: "mountain", labelKey: "label_elevation", value: "<2000 m" },
          { icon: "clock", labelKey: "label_time_limit", value: "35h" },
        ],
        distanceEmbedUrl: "",
      },
    ],
    registrationUrl: "",
  },
};

export function getClosestEvent(): EventData {
  const now = new Date();
  const upcomingEvents = Object.values(events)
    .filter((event) => event.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return upcomingEvents[0] || Object.values(events)[0];
}

export function getEventBySlug(slug: string): EventData | undefined {
  return events[slug];
}
