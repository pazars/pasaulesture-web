"use client";

import { usePathname, useRouter } from "next/navigation";
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
  const currentLocale = useLocale() as Locale;

  console.log('[LanguageSwitcher] Component rendering', { currentLocale, pathname });

  const handleLocaleChange = (targetLocale: Locale) => {
    console.log('[LanguageSwitcher] handleLocaleChange called', { targetLocale, currentLocale });

    if (targetLocale === currentLocale) {
      console.log('[LanguageSwitcher] Same locale, returning early');
      return;
    }

    // Use window.location to get the most current path and search params
    // This fixes a Safari bug where usePathname() and useSearchParams()
    // can cause issues inside Suspense boundaries after navigation
    const currentPathname = typeof window !== 'undefined'
      ? window.location.pathname
      : pathname;

    console.log('[LanguageSwitcher] Current pathname:', currentPathname);

    const newPath = getPathForLocale(currentPathname, targetLocale);
    console.log('[LanguageSwitcher] New path:', newPath);

    // Preserve query parameters using window.location.search
    const queryString = typeof window !== 'undefined'
      ? window.location.search
      : '';
    const newPathWithQuery = queryString ? `${newPath}${queryString}` : newPath;

    console.log('[LanguageSwitcher] Query string:', queryString);
    console.log('[LanguageSwitcher] Final path with query:', newPathWithQuery);

    // Set cookie to target locale before navigating so proxy doesn't redirect back
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
    console.log('[LanguageSwitcher] Cookie set, calling router.push');

    router.push(newPathWithQuery);
    console.log('[LanguageSwitcher] router.push called');
  };

  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-1 py-1 border border-sand">
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <button
            key={locale}
            onClick={() => {
              console.log('[LanguageSwitcher] Button clicked for locale:', locale);
              handleLocaleChange(locale);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${isActive
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
