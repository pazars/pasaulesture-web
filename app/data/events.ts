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
  komootEmbedUrl: string;
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
      name: "Rēzekne",
      googleMapsUrl: "https://maps.google.com/?q=Rēzekne,Latvia",
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
        komootEmbedUrl:
          "https://www.komoot.com/tour/2745174862/embed?share_token=anNYG0j4XpOL98Qfekr2ycVKoKNDYV9l6lc43zZ3RAtjr810SB&profile=1",
      },
      {
        nameKey: "distance_challenge",
        facts: [
          { icon: "calendar", labelKey: "label_date", value: "06/06 9AM" },
          { icon: "route", labelKey: "label_distance", value: "370 km" },
          { icon: "mountain", labelKey: "label_elevation", value: "3000 m" },
          { icon: "clock", labelKey: "label_time_limit", value: "35h" },
        ],
        komootEmbedUrl:
          "https://www.komoot.com/tour/2255436607/embed?share_token=adrib5Y0dhk2vnf6wz7UaepmHQEXDLqZh2gO94r4gck0d78ukL&profile=1",
      }
    ],
    registrationUrl: "",
  },
  "parize-dakara": {
    slug: "parize-dakara",
    nameKey: "event_parize_dakara",
    date: new Date("2026-08-29"),
    location: {
      name: "TBD",
      googleMapsUrl: "",
    },
    surfaceType: "Gravel",
    distances: [
      {
        nameKey: "distance_long",
        facts: [
          { icon: "calendar", labelKey: "label_date", value: "29/08" },
          { icon: "route", labelKey: "label_distance", value: "380 km" },
          { icon: "mountain", labelKey: "label_elevation", value: "? m" },
          { icon: "clock", labelKey: "label_time_limit", value: "35h" },
        ],
        komootEmbedUrl: "",
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
