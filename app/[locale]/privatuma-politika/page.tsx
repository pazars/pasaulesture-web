import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/request";
import Link from "next/link";
import PrivacyContentLv from "./content/PrivacyContent.lv";
import PrivacyContentEn from "./content/PrivacyContent.en";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations();

  const Content = locale === "en" ? PrivacyContentEn : PrivacyContentLv;
  const homeUrl = locale === "en" ? "/en" : "/";

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href={homeUrl}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-forest-deep/10 hover:bg-forest-deep hover:text-white text-forest-deep transition-all mb-8 group"
          aria-label={t("back_to_home")}
        >
          <svg
            className="w-6 h-6 transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Link>

        <h1 className="text-4xl font-display text-forest-deep mb-12">
          {t("page_privacy_title")}
        </h1>
        <Content />
      </div>
    </div>
  );
}
