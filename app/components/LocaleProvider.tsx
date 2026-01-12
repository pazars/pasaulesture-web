"use client";

import { setLocale } from "@/paraglide/runtime";
import type { Locale } from "@/paraglide/runtime";
import { useEffect } from "react";

interface LocaleProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

export default function LocaleProvider({
  locale,
  children,
}: LocaleProviderProps) {
  // Set locale on client side to match server
  setLocale(locale);

  // Also set on mount to ensure it's applied
  useEffect(() => {
    setLocale(locale);
  }, [locale]);

  return <>{children}</>;
}
