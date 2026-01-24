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
                  className="relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-accent font-bold text-lg bg-pink text-blue cursor-default whitespace-nowrap shadow-xl shadow-pink/40 scale-105"
                >
                  {eventName}
                </span>
              ) : (
                <Link
                  key={e.slug}
                  href={`/${e.slug}`}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-accent font-semibold text-lg transition-all whitespace-nowrap text-beige/70 hover:text-beige hover:bg-white/10"
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
              className="text-beige hover:text-pink transition-colors"
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
