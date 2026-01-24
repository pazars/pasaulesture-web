import { notFound } from "next/navigation";
import { events, getEventBySlug } from "@/app/data/events";
import { getAllEventImages } from "@/app/data/events.server";
import EventPage from "@/app/components/EventPage";
import * as m from "@/paraglide/messages";
import { locales } from "@/paraglide/runtime";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    for (const slug of Object.keys(events)) {
      params.push({ locale, slug });
    }
  }
  return params;
}

// Helper to get translated event name for metadata
function getEventName(nameKey: string): string {
  const translations: Record<string, () => string> = {
    event_egipte_malta: m.event_egipte_malta,
    event_parize_dakara: m.event_parize_dakara,
  };
  return translations[nameKey]?.() ?? nameKey;
}

// Helper to get translated event description for metadata
function getEventDescription(nameKey: string): string {
  const translations: Record<string, () => string> = {
    event_egipte_malta: m.event_egipte_malta_og_description,
    event_parize_dakara: m.event_parize_dakara_og_description,
  };
  return translations[nameKey]?.() ?? "";
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  const eventName = getEventName(event.nameKey);
  const eventDescription = getEventDescription(event.nameKey);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const ogImageUrl = `${baseUrl}/events/${slug}/og/og-image-${locale}.jpg`;
  const pageUrl = `${baseUrl}/${locale === "lv" ? "" : "en/"}${slug}`;

  return {
    title: eventName,
    description: eventDescription,
    openGraph: {
      title: eventName,
      description: eventDescription,
      url: pageUrl,
      siteName: m.site_title(),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: eventName,
        },
      ],
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: eventName,
      description: eventDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const images = getAllEventImages(slug);

  return <EventPage event={event} images={images} />;
}
