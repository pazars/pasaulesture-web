"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { locales, defaultLocale } from "@/i18n/request";
import type { Locale } from "@/i18n/request";

const localeNames: Record<Locale, string> = {
  lv: "LV",
  en: "EN",
};

function getLocaleFromPath(pathname: string): Locale {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

function getPathForLocale(currentPath: string, targetLocale: Locale): string {
  // Remove any existing locale prefix from path
  let pathWithoutLocale = currentPath;

  for (const locale of locales) {
    const prefixWithSlash = `/${locale}/`;
    if (currentPath.startsWith(prefixWithSlash)) {
      // Remove "/{locale}" prefix, keeping the rest including leading slash
      pathWithoutLocale = currentPath.substring(locale.length + 1);
      break;
    }
    if (currentPath === `/${locale}`) {
      pathWithoutLocale = "/";
      break;
    }
  }

  // For default locale (lv), return clean path without prefix
  if (targetLocale === defaultLocale) {
    return pathWithoutLocale || "/";
  }

  // For other locales, add prefix
  return `/${targetLocale}${pathWithoutLocale}`;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLocale = useLocale() as Locale;

  const handleLocaleChange = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;
    const newPath = getPathForLocale(pathname, targetLocale);

    // Preserve query parameters
    const queryString = searchParams.toString();
    const newPathWithQuery = queryString ? `${newPath}?${queryString}` : newPath;

    // Set cookie to target locale before navigating so proxy doesn't redirect back
    document.cookie = `language_preference=${targetLocale}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
    router.push(newPathWithQuery);
  };

  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-1 py-1 border border-sand">
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              isActive
                ? "bg-forest-deep text-white"
                : "text-earth-dark hover:bg-sand/50"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {localeNames[locale]}
          </button>
        );
      })}
    </div>
  );
}
