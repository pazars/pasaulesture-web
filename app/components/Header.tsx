"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { events } from "@/app/data/events";
import LanguageSwitcher from "./LanguageSwitcher";
import { InstagramIcon, MenuIcon } from "./Icons";
import MobileMenu from "./MobileMenu";
import { useTranslations, useLocale } from "next-intl";

interface HeaderProps {
  currentSlug: string;
}

export default function Header({ currentSlug }: HeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const allEvents = Object.values(events);
  const isDakar = currentSlug === "parize-dakara";
  const [menuOpen, setMenuOpen] = useState(false);
  const localePath = (slug: string) => `/${locale === "en" ? "en/" : ""}${slug}`;

  return (
    <>
      {/* Mobile header bar (<640px) */}
      <header className="sm:hidden bg-transparent pt-4 px-4">
        <div className="flex items-center justify-between">
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`p-2 -ml-2 rounded-full transition-colors ${
              isDakar
                ? "text-beige hover:bg-beige/15"
                : "text-beige hover:bg-white/15"
            }`}
            aria-label={t("menu_open")}
          >
            <MenuIcon className="w-7 h-7" />
          </button>

          {/* Brand */}
          <div className="text-center">
            <span className="font-display text-xl text-beige">
              {t("footer_brand")}
            </span>
          </div>

          {/* Spacer for symmetry */}
          <div className="w-11" aria-hidden="true" />
        </div>

        {/* Mobile event switcher tabs */}
        <nav className="mt-3 px-2 pb-3">
          <div className={`flex rounded-full p-1 border ${
            isDakar
              ? "bg-dakar-brown/30 border-dakar-cream/12"
              : "bg-blue/30 border-white/10"
          } backdrop-blur-md`}>
            {allEvents.map((e) => {
              const isCurrent = e.slug === currentSlug;
              const eventName = t(e.nameKey as any);
              const isTabDakar = e.slug === "parize-dakara";

              return isCurrent ? (
                <span
                  key={e.slug}
                  className={`flex-1 text-center py-2 rounded-full font-accent font-bold text-sm cursor-default transition-all ${
                    isTabDakar
                      ? "bg-dakar-cream text-dakar-brown shadow-md shadow-dakar-cream/25"
                      : "bg-pink text-blue shadow-md shadow-pink/25"
                  }`}
                >
                  {eventName}
                </span>
              ) : (
                <Link
                  key={e.slug}
                  href={localePath(e.slug)}
                  className="flex-1 text-center py-2 rounded-full font-accent font-semibold text-sm text-beige/50 transition-all active:scale-95"
                >
                  {eventName}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <MobileMenu
        currentSlug={currentSlug}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Desktop header (>=640px) - unchanged */}
      <header className="hidden sm:block bg-transparent py-5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative flex flex-row items-center justify-center gap-4">
            {/* Event navigation - Center */}
            <nav className="flex flex-wrap justify-center gap-3">
              {allEvents.map((e) => {
                const isCurrent = e.slug === currentSlug;
                const eventName = t(e.nameKey as any);
                return isCurrent ? (
                  <span
                    key={e.slug}
                    className={`relative px-8 py-3.5 rounded-full font-accent font-bold text-lg cursor-default whitespace-nowrap scale-105 ${
                      isDakar
                        ? "bg-dakar-cream text-dakar-brown shadow-xl shadow-dakar-cream/40"
                        : "bg-pink text-blue shadow-xl shadow-pink/40"
                    }`}
                  >
                    {eventName}
                  </span>
                ) : (
                  <Link
                    key={e.slug}
                    href={localePath(e.slug)}
                    className={`px-8 py-3.5 rounded-full font-accent font-semibold text-lg transition-all whitespace-nowrap ${
                      isDakar
                        ? "text-beige/80 hover:text-beige hover:bg-dakar-cream/10"
                        : "text-beige/70 hover:text-beige hover:bg-white/10"
                    }`}
                  >
                    {eventName}
                  </Link>
                );
              })}
            </nav>

            {/* Social & Language - Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
              {/* Instagram icon */}
              <a
                href="https://www.instagram.com/pasaulesture/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  isDakar
                    ? "text-beige hover:text-dakar-yellow"
                    : "text-beige hover:text-pink"
                }`}
                aria-label="Instagram @pasaulesture"
              >
                <InstagramIcon className="w-6 h-6" />
              </a>

              {/* Language switcher */}
              <Suspense fallback={<div className="w-20 h-10" />}>
                <LanguageSwitcher isDakar={isDakar} />
              </Suspense>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
