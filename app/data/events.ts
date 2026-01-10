import fs from "fs";
import path from "path";

export interface EventFact {
  icon: string;
  label: string;
  value: string;
}

export interface EventLocation {
  name: string;
  googleMapsUrl: string;
}

export interface EventData {
  slug: string;
  name: string;
  date: Date;
  location: EventLocation;
  facts: EventFact[];
  komootEmbedUrl: string;
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
    facts: [
      { icon: "calendar", label: "Datums", value: "6. jūnijs, 2026 09:00" },
      { icon: "route", label: "Distance", value: "370 km" },
      { icon: "mountain", label: "Kāpums", value: "3000 m" },
      { icon: "clock", label: "Laika limits", value: "35h" },
    ],
    komootEmbedUrl: "https://www.komoot.com/tour/2255436607/embed?share_token=adrib5Y0dhk2vnf6wz7UaepmHQEXDLqZh2gO94r4gck0d78ukL&profile=1",
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
    facts: [
      { icon: "calendar", label: "Datums", value: "29. augusts, 2026" },
      { icon: "route", label: "Distance", value: "380 km" },
      { icon: "mountain", label: "Kāpums", value: "? m" },
      { icon: "clock", label: "Laika limits", value: "35h" },
    ],
    komootEmbedUrl: "",
    registrationUrl: "",
  },
};

export function getRandomEventImage(slug: string): string {
  const imageDir = path.join(process.cwd(), "public", "events", slug);
  try {
    const files = fs.readdirSync(imageDir);
    const images = files.filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));
    if (images.length === 0) return "";
    const randomIndex = Math.floor(Math.random() * images.length);
    return `/events/${slug}/${images[randomIndex]}`;
  } catch {
    return "";
  }
}

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
