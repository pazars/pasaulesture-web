import { redirect } from "next/navigation";
import { getClosestEvent } from "@/app/data/events";
import { locales } from "@/paraglide/runtime";

const defaultLocale = "lv";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const closestEvent = getClosestEvent();

  // For default locale, redirect without prefix
  if (locale === defaultLocale) {
    redirect(`/${closestEvent.slug}`);
  }

  // For other locales, include prefix
  redirect(`/${locale}/${closestEvent.slug}`);
}
