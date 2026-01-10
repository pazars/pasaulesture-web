"use client";

import Link from "next/link";
import { events } from "@/app/data/events";

interface HeaderProps {
  currentSlug: string;
}

export default function Header({ currentSlug }: HeaderProps) {
  const allEvents = Object.values(events);

  return (
    <header className="bg-gray-900 text-white py-4 mb-4">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {allEvents.map((e) =>
            e.slug === currentSlug ? (
              <span
                key={e.slug}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold bg-white text-black cursor-default whitespace-nowrap"
              >
                {e.name}
              </span>
            ) : (
              <Link
                key={e.slug}
                href={`/${e.slug}`}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all bg-white/20 text-white hover:bg-white/30 whitespace-nowrap"
              >
                {e.name}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
