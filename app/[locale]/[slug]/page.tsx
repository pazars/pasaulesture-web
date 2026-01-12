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

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  const eventName = getEventName(event.nameKey);

  return {
    title: m.site_title(),
    description: `${eventName} - ${m.site_description()}`,
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
