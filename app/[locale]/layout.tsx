import { setLocale, locales } from "@/paraglide/runtime";
import type { Locale } from "@/paraglide/runtime";
import { notFound } from "next/navigation";
import LocaleProvider from "@/app/components/LocaleProvider";
import { Geist, Geist_Mono } from "next/font/google";
import * as m from "@/paraglide/messages";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Validate locale before using it
  if (!locales.includes(locale as Locale)) {
    return {
      title: "Not Found",
    };
  }

  // Set locale for metadata generation
  setLocale(locale as Locale);

  return {
    title: m.site_title(),
    description: m.site_description(),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Set the locale for paraglide on server
  setLocale(locale as Locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocaleProvider locale={locale as Locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
