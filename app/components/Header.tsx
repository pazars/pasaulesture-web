"use client";

import Link from "next/link";
import { events } from "@/app/data/events";

interface HeaderProps {
  currentSlug: string;
}

export default function Header({ currentSlug }: HeaderProps) {
  const allEvents = Object.values(events);

  return (
    <header className="bg-transparent py-5">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {allEvents.map((e) => {
            const isCurrent = e.slug === currentSlug;
            return isCurrent ? (
              <span
                key={e.slug}
                className="relative px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold bg-forest-deep text-white cursor-default whitespace-nowrap shadow-lg shadow-forest-deep/20"
              >
                {e.name}
              </span>
            ) : (
              <Link
                key={e.slug}
                href={`/${e.slug}`}
                className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold transition-all whitespace-nowrap text-earth-dark bg-white/80 backdrop-blur-sm border border-sand hover:bg-white hover:border-forest-medium hover:shadow-md"
              >
                {e.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
