import { notFound } from "next/navigation";
import { events, getEventBySlug } from "@/app/data/events";
import EventPage from "@/app/components/EventPage";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/request";

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

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  const t = await getTranslations({ locale });

  const eventName = t(event.nameKey as any);
  const eventDescription = t(`${event.nameKey}_og_description` as any);
  // Use relative path - metadataBase from layout will make it absolute
  const ogImageUrl = `/events/${slug}/og/og-image-${locale}.jpg`;
  const pageUrl = locale === "lv" ? `/${slug}` : `/en/${slug}`;

  return {
    title: eventName,
    description: eventDescription,
    openGraph: {
      title: eventName,
      description: eventDescription,
      url: pageUrl,
      siteName: t("site_title"),
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

  return <EventPage event={event} />;
}
