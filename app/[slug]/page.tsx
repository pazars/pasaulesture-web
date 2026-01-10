import { notFound } from "next/navigation";
import {
  events,
  getEventBySlug,
  getRandomEventImage,
} from "@/app/data/events";
import EventPage from "@/app/components/EventPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(events).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  return {
    title: `${event.name} | Pasaules Tūre`,
    description: `${event.name} - ultra riteņbraukšanas pasākums Latvijā`,
  };
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const heroImage = getRandomEventImage(slug);

  return <EventPage event={event} heroImage={heroImage} />;
}
