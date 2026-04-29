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
  endLocation?: EventLocation;
  // price field removed - managed in Stripe Dashboard
}

export type PlanItem =
  | { kind: "prose"; bodyKey: string; leadKey?: string }
  | { kind: "chapter"; titleKey: string }
  | { kind: "image"; src: string; captionKey?: string; variant?: "full" | "postcard" | "paper"; width?: number; height?: number }
  | { kind: "break" };

export interface EventData {
  slug: string;
  nameKey: string; // Translation key for event name
  date: Date;
  location: EventLocation;
  surfaceType: string;
  distances: EventDistance[];
  registrationUrl: string;
  hasAccommodation: boolean;
  heroQuoteKey: string;
  heroQuote2Key: string;
  routeDescriptionKey?: string;
  routeHighlightsKey?: string;
  gallery?: string[];
  plan?: PlanItem[];
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
          { icon: "route", labelKey: "label_distance", value: "225 km" },
          { icon: "mountain", labelKey: "label_elevation", value: "1200 m" },
          { icon: "clock", labelKey: "label_time_limit", value: "35h" },
        ],
        distanceEmbedUrl:
          "https://ridewithgps.com/embeds?type=route&id=53804940&title=%C4%92%C4%A3ipte&metricUnits=true&sampleGraph=true",
        endLocation: {
          name: "Daugavpils cietoksnis",
          googleMapsUrl: "https://maps.app.goo.gl/HSs57YqjPhS5PFmM9",
        },
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
        endLocation: {
          name: "Sarkaņkalns",
          googleMapsUrl: "https://maps.app.goo.gl/ZT7SXvmoPGzpR8DM8",
        },
      }
    ],
    registrationUrl: "",
    hasAccommodation: true,
    heroQuoteKey: "hero_quote_egipte_malta",
    heroQuote2Key: "hero_quote_2_egipte_malta",
    routeHighlightsKey: "route_highlights_egipte_malta",
    gallery: [
      "/events/egipte-malta/gallery/0.jpeg",
      "/events/egipte-malta/gallery/1.jpeg",
      "/events/egipte-malta/gallery/2.jpeg",
      "/events/egipte-malta/gallery/3.jpeg",
      "/events/egipte-malta/gallery/4.jpeg",
      "/events/egipte-malta/gallery/5.jpeg",
      "/events/egipte-malta/gallery/6.jpeg",
      "/events/egipte-malta/gallery/7.jpeg",
      "/events/egipte-malta/gallery/8.jpeg",
    ],
    plan: [
      { kind: "chapter", titleKey: "plan_em_1_title" },
      { kind: "prose", leadKey: "plan_em_2_lead", bodyKey: "plan_em_2_body" },
      { kind: "image", src: "/events/egipte-malta/maps/route_to_sarkankalns.png", captionKey: "plan_em_3_caption", variant: "paper", width: 1261, height: 872 },
      { kind: "prose", bodyKey: "plan_em_4_body" },
      { kind: "image", src: "/events/egipte-malta/gallery/5.jpeg", captionKey: "plan_em_5_caption", variant: "paper", width: 5760, height: 3840 },
      { kind: "chapter", titleKey: "plan_em_6_title" },
      { kind: "prose", leadKey: "plan_em_7_lead", bodyKey: "plan_em_7_body" },
      { kind: "image", src: "/events/egipte-malta/plan/pt_124.jpg", captionKey: "plan_em_8_caption", variant: "paper", width: 1600, height: 1013 },
      { kind: "prose", bodyKey: "plan_em_9_body" },
      { kind: "chapter", titleKey: "plan_em_10_title" },
      { kind: "prose", leadKey: "plan_em_11_lead", bodyKey: "plan_em_11_body" },
      { kind: "image", src: "/events/egipte-malta/plan/PT_82.jpg", variant: "paper", width: 1600, height: 1067 },
      { kind: "prose", bodyKey: "plan_em_13_body" },
      { kind: "image", src: "/events/egipte-malta/plan/PT_126.jpg", captionKey: "plan_em_14_caption", variant: "paper", width: 1600, height: 1067 },
      { kind: "prose", bodyKey: "plan_em_15_body" },
      { kind: "prose", bodyKey: "plan_em_16_body" },
      { kind: "image", src: "/events/egipte-malta/plan/PT_141.jpg", variant: "paper", width: 1600, height: 1067 },
    ],
  },
  "parize-dakara": {
    slug: "parize-dakara",
    nameKey: "event_parize_dakara",
    date: new Date("2026-08-29"),
    location: {
      name: "Vaivari, Jūrmala",
      googleMapsUrl: "https://maps.app.goo.gl/vM83xP3aXHAbgh1y8",
    },
    surfaceType: "Gravel",
    distances: [
      {
        nameKey: "distance_long",
        facts: [
          { icon: "calendar", labelKey: "label_date", value: "29/08" },
          { icon: "route", labelKey: "label_distance", value: "380 km" },
          { icon: "mountain", labelKey: "label_elevation", value: "<2000 m" },
        ],
        distanceEmbedUrl: "https://ridewithgps.com/embeds?type=route&id=54143669&title=Par%C4%ABze%20-%20Dak%C4%81ra&metricUnits=true&sampleGraph=true",
        endLocation: {
          name: "Bernāti",
          googleMapsUrl: "https://maps.app.goo.gl/VLpKcFBoc9pGkbGZA",
        },
      },
    ],
    registrationUrl: "",
    hasAccommodation: false,
    heroQuoteKey: "hero_quote_parize_dakara",
    heroQuote2Key: "hero_quote_2_parize_dakara",
    routeDescriptionKey: "route_description_parize_dakara",
    routeHighlightsKey: "route_highlights_parize_dakara",
    plan: [
      { kind: "chapter", titleKey: "plan_pd_1_title" },
      { kind: "prose", leadKey: "plan_pd_2_lead", bodyKey: "plan_pd_2_body" },
    ],
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
