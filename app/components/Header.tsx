"use client";

import Link from "next/link";
import { Suspense } from "react";
import { events } from "@/app/data/events";
import LanguageSwitcher from "./LanguageSwitcher";
import { InstagramIcon } from "./Icons";
import { useTranslations } from "next-intl";

interface HeaderProps {
  currentSlug: string;
}

export default function Header({ currentSlug }: HeaderProps) {
  const t = useTranslations();
  const allEvents = Object.values(events);
  const isDakar = currentSlug === "parize-dakara";

  return (
    <header className="bg-transparent py-5">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Event navigation - Center */}
          <nav className="flex flex-wrap justify-center gap-3">
            {allEvents.map((e) => {
              const isCurrent = e.slug === currentSlug;
              const eventName = t(e.nameKey as any);
              return isCurrent ? (
                <span
                  key={e.slug}
                  className={`relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-accent font-bold text-lg cursor-default whitespace-nowrap scale-105 ${
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
                  href={`/${e.slug}`}
                  className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-accent font-semibold text-lg transition-all whitespace-nowrap ${
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
          <div className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-3 sm:gap-4">
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
  );
}
