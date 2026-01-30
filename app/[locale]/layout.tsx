import { notFound } from "next/navigation";
import "../globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { locales } from "@/i18n/request";
import type { Locale } from "@/i18n/request";
import { Caveat_Brush, BioRhyme, Josefin_Sans, Kalam, Sriracha, Oregano, Shantell_Sans, Solitreo, Mynerve } from "next/font/google";

// Display font - for headers and titles
// Switch between these two fonts by commenting/uncommenting:

const displayFont = Mynerve({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

// Accent font - for emphasis and buttons
const bioRhyme = BioRhyme({
  weight: ["400", "700", "800"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-accent",
  display: "swap",
});

// Body font - for general text
const josefinSans = Josefin_Sans({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
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

  const t = await getTranslations({ locale });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pasaulesture.lv';

  return {
    metadataBase: new URL(baseUrl),
    title: t("site_title"),
    description: t("site_description"),
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      title: t("site_title"),
      description: t("site_description"),
      url: baseUrl,
      siteName: t("site_title"),
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("site_title"),
      description: t("site_description"),
    },
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

  // Load messages for the locale
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`${displayFont.variable} ${bioRhyme.variable} ${josefinSans.variable}`}>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WR2D5CTT');`}
        </Script>
      </head>
      <body className={`antialiased ${josefinSans.className}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WR2D5CTT"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
