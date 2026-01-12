import * as m from "@/paraglide/messages";
import { locales, setLocale } from "@/paraglide/runtime";
import type { Locale } from "@/paraglide/runtime";
import Link from "next/link";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;

  // Set locale for translation functions
  setLocale(locale as Locale);

  const homeUrl = locale === "en" ? "/en" : "/";

  return (
    <div className="min-h-screen bg-linear-to-b from-cream to-cream-light py-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href={homeUrl}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-forest-deep/10 hover:bg-forest-deep hover:text-white text-forest-deep transition-all mb-8 group"
          aria-label={m.back_to_home()}
        >
          <svg
            className="w-6 h-6 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>

        <h1 className="text-4xl font-display text-forest-deep mb-12">
          {m.page_terms_title()}
        </h1>
        <div className="prose prose-lg max-w-none text-gray-700">
          <p>{m.page_terms_content()}</p>
        </div>
      </div>
    </div>
  );
}
