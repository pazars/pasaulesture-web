export interface EventFact {
  icon: string;
  label: string;
  value: string;
}

export interface EventLocation {
  name: string;
  googleMapsUrl: string;
}

export interface EventDistance {
  name: string;
  facts: EventFact[];
  komootEmbedUrl: string;
}

export interface EventData {
  slug: string;
  name: string;
  date: Date;
  location: EventLocation;
  surfaceType: string;
  distances: EventDistance[];
  registrationUrl: string;
}

export const events: Record<string, EventData> = {
  "egipte-malta": {
    slug: "egipte-malta",
    name: "Ēģipte-Malta",
    date: new Date("2026-06-06"),
    location: {
      name: "Rēzekne",
      googleMapsUrl: "https://maps.google.com/?q=Rēzekne,Latvia",
    },
    surfaceType: "Gravel",
    distances: [
      {
        name: "Piedzīvojums",
        facts: [
          { icon: "calendar", label: "Datums", value: "06/06 9AM" },
          { icon: "route", label: "Distance", value: "200 km" },
          { icon: "mountain", label: "Kāpums", value: "1200 m" },
          { icon: "clock", label: "Laika limits", value: "35h" },
        ],
        komootEmbedUrl:
          "https://www.komoot.com/tour/2745174862/embed?share_token=anNYG0j4XpOL98Qfekr2ycVKoKNDYV9l6lc43zZ3RAtjr810SB&profile=1",
      },
      {
        name: "Izaicinājums",
        facts: [
          { icon: "calendar", label: "Datums", value: "06/06 9AM" },
          { icon: "route", label: "Distance", value: "370 km" },
          { icon: "mountain", label: "Kāpums", value: "3000 m" },
          { icon: "clock", label: "Laika limits", value: "35h" },
        ],
        komootEmbedUrl:
          "https://www.komoot.com/tour/2255436607/embed?share_token=adrib5Y0dhk2vnf6wz7UaepmHQEXDLqZh2gO94r4gck0d78ukL&profile=1",
      }
    ],
    registrationUrl: "",
  },
  "parize-dakara": {
    slug: "parize-dakara",
    name: "Parīze-Dakāra",
    date: new Date("2026-08-29"),
    location: {
      name: "TBD",
      googleMapsUrl: "",
    },
    surfaceType: "Gravel",
    distances: [
      {
        name: "Garā",
        facts: [
          { icon: "calendar", label: "Datums", value: "29/08" },
          { icon: "route", label: "Distance", value: "380 km" },
          { icon: "mountain", label: "Kāpums", value: "? m" },
          { icon: "clock", label: "Laika limits", value: "35h" },
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
