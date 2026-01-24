"use client";

import Link from "next/link";
import { Suspense } from "react";
import { events } from "@/app/data/events";
import LanguageSwitcher from "./LanguageSwitcher";
import { InstagramIcon } from "./Icons";
import * as m from "@/paraglide/messages";

interface HeaderProps {
  currentSlug: string;
}

// Helper to get translated event name
function getEventName(nameKey: string): string {
  const translations: Record<string, () => string> = {
    event_egipte_malta: m.event_egipte_malta,
    event_parize_dakara: m.event_parize_dakara,
  };
  return translations[nameKey]?.() ?? nameKey;
}

export default function Header({ currentSlug }: HeaderProps) {
  const allEvents = Object.values(events);

  return (
    <header className="bg-transparent py-5">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Event navigation - Center */}
          <nav className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {allEvents.map((e) => {
              const isCurrent = e.slug === currentSlug;
              const eventName = getEventName(e.nameKey);
              return isCurrent ? (
                <span
                  key={e.slug}
                  className="relative px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold bg-forest-deep text-white cursor-default whitespace-nowrap shadow-lg shadow-forest-deep/20"
                >
                  {eventName}
                </span>
              ) : (
                <Link
                  key={e.slug}
                  href={`/${e.slug}`}
                  className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold transition-all whitespace-nowrap text-earth-dark bg-white/80 backdrop-blur-sm border border-sand hover:bg-white hover:border-forest-medium hover:shadow-md"
                >
                  {eventName}
                </Link>
              );
            })}
          </nav>

          {/* Social & Language - Right */}
          <div className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-3 sm:gap-4">
            {/* Instagram icon */}
            <a
              href="https://www.instagram.com/pasaulesture/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-deep hover:text-amber transition-colors"
              aria-label="Instagram @pasaulesture"
            >
              <InstagramIcon className="w-6 h-6" />
            </a>

            {/* Language switcher */}
            <Suspense fallback={<div className="w-20 h-10" />}>
              <LanguageSwitcher />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
