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

interface LanguageSwitcherProps {
  isDakar?: boolean;
}

export default function LanguageSwitcher({ isDakar = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as Locale;

  const handleLocaleChange = (targetLocale: Locale) => {
    // Use window.location to get the most current path and search params
    // This fixes a Safari bug where usePathname() and useSearchParams()
    // can cause issues inside Suspense boundaries after navigation
    const currentPathname = typeof window !== 'undefined'
      ? window.location.pathname
      : pathname;

    const newPath = getPathForLocale(currentPathname, targetLocale);

    // Preserve query parameters using window.location.search
    const queryString = typeof window !== 'undefined'
      ? window.location.search
      : '';
    const newPathWithQuery = queryString ? `${newPath}${queryString}` : newPath;

    // Set cookie to target locale before navigating so proxy doesn't redirect back
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days

    router.push(newPathWithQuery);
  };

  return (
    <div className={`flex items-center gap-1 backdrop-blur-sm rounded-full px-1 py-1 ${
      isDakar ? "bg-beige/15" : "bg-white/10"
    }`}>
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <button
            key={locale}
            onClick={() => {
              handleLocaleChange(locale);
            }}
            className={`px-3 pt-[7px] pb-[5px] rounded-full text-sm font-semibold leading-none transition-all cursor-pointer ${
              isActive
                ? isDakar
                  ? "bg-dakar-cream text-dakar-brown"
                  : "bg-pink text-blue"
                : isDakar
                  ? "text-beige/80 hover:text-beige hover:bg-beige/20 hover:scale-105"
                  : "text-beige/70 hover:text-beige hover:bg-white/15 hover:scale-105"
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
