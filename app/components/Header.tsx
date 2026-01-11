"use client";

import Link from "next/link";
import { events } from "@/app/data/events";
import LanguageSwitcher from "./LanguageSwitcher";
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Event navigation */}
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

          {/* Language switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
