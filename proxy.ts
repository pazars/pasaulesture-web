import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["lv", "en"] as const;
const defaultLocale = "lv";
type Locale = (typeof locales)[number];

function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return null;
}

function getPreferredLocale(request: NextRequest): Locale {
  // 1. Check cookie
  const cookieLocale = request.cookies.get("language_preference")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Default to Latvian (default locale)
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameLocale = getLocaleFromPath(pathname);

  // URL has explicit locale prefix (e.g., /en/egipte-malta or /lv/egipte-malta)
  if (pathnameLocale) {
    // If it's the default locale with prefix, redirect to clean URL
    // /lv/egipte-malta → /egipte-malta
    if (pathnameLocale === defaultLocale) {
      const pathWithoutLocale = pathname.replace(/^\/lv/, "") || "/";
      const redirectUrl = new URL(pathWithoutLocale, request.url);
      // Preserve query parameters during redirect
      redirectUrl.search = request.nextUrl.search;
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set("language_preference", defaultLocale, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      return response;
    }

    // Non-default locale with prefix - rewrite to [locale] route and set cookie
    // /en/egipte-malta stays as /en/egipte-malta
    const response = NextResponse.next();
    response.cookies.set("language_preference", pathnameLocale, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  // No locale prefix - this could be default locale OR needs detection
  const preferredLocale = getPreferredLocale(request);

  if (preferredLocale !== defaultLocale) {
    // User prefers non-default locale, redirect to prefixed URL
    // /egipte-malta → /en/egipte-malta
    const redirectUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
    // Preserve query parameters during redirect
    redirectUrl.search = request.nextUrl.search;
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("language_preference", preferredLocale, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  // Default locale - rewrite to /lv/... internally but keep clean URL
  // /egipte-malta → internally routes to /lv/egipte-malta
  const rewriteUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
  // Preserve query parameters during rewrite
  rewriteUrl.search = request.nextUrl.search;
  const response = NextResponse.rewrite(rewriteUrl);
  response.cookies.set("language_preference", defaultLocale, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
