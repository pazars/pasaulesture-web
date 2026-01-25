"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EventData, EventDistance } from "@/app/data/events";
import { ExternalLinkIcon, LocationIcon } from "./Icons";
import FAQ from "./FAQ";
import Header from "./Header";
import { useTranslations, useLocale } from "next-intl";

interface EventPageProps {
  event: EventData;
}

// Format event date with locale-specific spelled-out format
function formatEventDate(date: Date, locale: string): string {
  const day = date.getDate();
  const year = date.getFullYear();

  if (locale === "lv") {
    const months = [
      "janvāris", "februāris", "marts", "aprīlis", "maijs", "jūnijs",
      "jūlijs", "augusts", "septembris", "oktobris", "novembris", "decembris"
    ];
    const month = months[date.getMonth()];
    return `${day}. ${month}, ${year}`;
  } else {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[date.getMonth()];
    const suffix =
      day === 1 || day === 21 || day === 31 ? "st" :
        day === 2 || day === 22 ? "nd" :
          day === 3 || day === 23 ? "rd" : "th";
    return `${month} ${day}${suffix}, ${year}`;
  }
}

export default function EventPage({ event }: EventPageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(event.distances.length - 1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const selectedDistance: EventDistance = event.distances[selectedDistanceIndex];
  const formattedDate = formatEventDate(event.date, locale);

  // Event-specific theme configuration
  const isDakar = event.slug === "parize-dakara";
  const postcardSrc = isDakar ? "/post/dakar/dakar-card.png" : "/post/card.png";
  // Dakar uses only the golden stamp, Malta uses blue + pink
  const stamps = isDakar
    ? [
        { src: "/post/dakar/dakar-stamp.png", alt: "Dakar stamp" },
        { src: "/post/dakar/dakar-stamp.png", alt: "Dakar stamp" }
      ]
    : [
        { src: "/post/stamp1.png", alt: "Blue stamp" },
        { src: "/post/stamp2.png", alt: "Pink stamp" }
      ];

  useEffect(() => {
    setIsLoaded(true);
    const savedDistance = localStorage.getItem(`last_distance_${event.slug}`);
    if (savedDistance !== null) {
      const index = parseInt(savedDistance, 10);
      if (index >= 0 && index < event.distances.length) {
        setSelectedDistanceIndex(index);
      }
    }

    // Apply event-specific theme to body
    if (isDakar) {
      document.body.classList.add('theme-dakar');
    }

    return () => {
      // Clean up theme class on unmount
      document.body.classList.remove('theme-dakar');
    };
  }, [event.slug, event.distances.length, isDakar]);

  // Countdown timer for route reveal (Dakar: March 1st, 2026)
  useEffect(() => {
    if (!isDakar) return;

    const routeRevealDate = new Date('2026-03-01T00:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const diff = routeRevealDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isDakar]);

  const handleDistanceSelect = (index: number) => {
    setSelectedDistanceIndex(index);
    localStorage.setItem(`last_distance_${event.slug}`, index.toString());
  };

  return (
    <div className="min-h-screen main-content">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Header currentSlug={event.slug} />

        {/* Hero Section - Postcard Collage */}
        <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] overflow-hidden rounded-3xl mx-auto py-8 sm:py-12" style={{ maxWidth: 'calc(100% - 1rem)', marginLeft: '0.5rem', marginRight: '0.5rem' }}>

          {/* Elegant Spelled-Out Date - Top */}
          <div className="relative z-20 flex justify-center px-6 mb-8 sm:mb-12">
            <div
              className={`text-center transition-all duration-1200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`}
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-beige tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)] leading-tight">
                {formattedDate}
              </h1>
            </div>
          </div>

          {/* Scattered Collage Container */}
          <div className="relative w-full max-w-4xl mx-auto px-4" style={{ minHeight: '400px' }}>

            {/* Main Postcard - Center, slightly tilted */}
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ${isLoaded ? "opacity-100 scale-100 rotate-[-2deg]" : "opacity-0 scale-90 rotate-0"}`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="relative group">
                <Image
                  src={postcardSrc}
                  alt="Pasaules Tūre Postcard"
                  width={520}
                  height={360}
                  className="rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-0"
                  priority
                />
              </div>
            </div>

            {/* Stamp 1 - Top Left, tilted */}
            <div
              className={`absolute z-20 transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`}
              style={{
                left: '5%',
                top: '5%',
                transitionDelay: '400ms'
              }}
            >
              <div className="stamp-hover">
                <Image
                  src={stamps[0].src}
                  alt={stamps[0].alt}
                  width={100}
                  height={130}
                  className="drop-shadow-xl rotate-[-15deg] hover:rotate-[-8deg] transition-transform duration-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Stamp 2 - Bottom Right, tilted other way */}
            <div
              className={`absolute z-20 transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                right: '8%',
                bottom: '10%',
                transitionDelay: '600ms'
              }}
            >
              <div className="stamp-hover">
                <Image
                  src={stamps[1].src}
                  alt={stamps[1].alt}
                  width={110}
                  height={140}
                  className="drop-shadow-xl rotate-[12deg] hover:rotate-[5deg] transition-transform duration-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Extra Stamp 1 - Top Right */}
            <div
              className={`absolute z-15 transition-all duration-700 hidden sm:block ${isLoaded ? "opacity-100" : "opacity-0"}`}
              style={{
                right: '3%',
                top: '15%',
                transitionDelay: '700ms'
              }}
            >
              <div className="stamp-hover">
                <Image
                  src={stamps[0].src}
                  alt={stamps[0].alt}
                  width={80}
                  height={104}
                  className="drop-shadow-lg rotate-[22deg] hover:rotate-[15deg] transition-transform duration-300 cursor-pointer opacity-80"
                />
              </div>
            </div>

            {/* Extra Stamp 2 - Bottom Left */}
            <div
              className={`absolute z-15 transition-all duration-700 hidden sm:block ${isLoaded ? "opacity-100" : "opacity-0"}`}
              style={{
                left: '2%',
                bottom: '15%',
                transitionDelay: '800ms'
              }}
            >
              <div className="stamp-hover">
                <Image
                  src={stamps[1].src}
                  alt={stamps[1].alt}
                  width={75}
                  height={98}
                  className="drop-shadow-lg rotate-[-8deg] hover:rotate-[-2deg] transition-transform duration-300 cursor-pointer opacity-70"
                />
              </div>
            </div>

          </div>

          {/* Scroll indicator */}
          <div
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <div className="animate-float">
              <svg className="w-6 h-6 text-beige/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Quote Section - two paragraphs */}
        <section className="relative py-10 overflow-hidden rounded-3xl mt-6 mx-2">
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <p className="text-xl sm:text-2xl text-beige font-medium italic leading-relaxed font-accent mb-6">
              &ldquo;{t("hero_quote")}&rdquo;
            </p>
            <p className="text-lg text-beige/70 leading-relaxed">
              {t("hero_quote_2")}
            </p>
          </div>
        </section>

        {/* Route Selection with Start Location */}
        <section className="relative mt-4 mx-2 rounded-3xl overflow-hidden py-4">
          <div className="max-w-5xl mx-auto px-6">
            {/* Vertical layout: Start on top, Routes below */}
            <div className="flex flex-col items-center gap-4">

              {/* Start Location - Top, centered */}
              <div className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/8 hover:bg-white/12 transition-all">
                <div className={`p-2 rounded-lg ${
                  isDakar ? "bg-beige/25" : "bg-pink/25"
                }`}>
                  <LocationIcon className={`w-5 h-5 ${
                    isDakar ? "text-beige" : "text-pink"
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-beige/60 uppercase tracking-wider font-semibold">{t("label_start")}</p>
                  {event.location.googleMapsUrl ? (
                    <a
                      href={event.location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-bold text-beige transition-colors inline-flex items-center gap-1 ${
                        isDakar ? "hover:text-[#FFD87F]" : "hover:text-pink"
                      }`}
                    >
                      {event.location.name}
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="font-bold text-beige">{event.location.name}</p>
                  )}
                </div>
              </div>

              {/* Route Selection - Centered, larger buttons with clear hover states */}
              <div className="flex flex-wrap justify-center gap-4">
                {event.distances.map((distance, index) => {
                  const distanceFact = distance.facts.find(f => f.icon === "route");
                  const elevationFact = distance.facts.find(f => f.icon === "mountain");
                  const distanceValue = distanceFact?.value || "";
                  const elevationValue = elevationFact?.value || "";
                  const isSelected = index === selectedDistanceIndex;
                  const distanceName = t(distance.nameKey as any);
                  return (
                    <button
                      key={distance.nameKey}
                      onClick={() => handleDistanceSelect(index)}
                      className={`relative px-8 py-5 font-bold transition-all rounded-2xl overflow-hidden min-w-40 cursor-pointer ${
                        isSelected
                          ? isDakar
                            ? "bg-beige text-bronze shadow-lg shadow-beige/40 scale-105"
                            : "bg-pink text-blue shadow-lg shadow-pink/40 scale-105"
                          : "bg-white/8 text-beige hover:bg-white/15 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute top-0 right-0 w-6 h-6 transform rotate-45 translate-x-3 -translate-y-3 ${
                          isDakar ? "bg-[#FFD87F]" : "bg-lime"
                        }`} />
                      )}
                      <span className="block text-lg relative z-10 font-accent">{distanceName}</span>
                      <div className={`flex items-center justify-center gap-2 mt-1.5 relative z-10 text-sm ${
                        isSelected
                          ? isDakar
                            ? "text-bronze/70"
                            : "text-blue/70"
                          : "text-beige/60"
                      }`}>
                        <span className="font-semibold">{distanceValue}</span>
                        {elevationValue && <span>· {elevationValue}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Route Section */}
        <section className="py-16 relative overflow-hidden rounded-3xl mt-4 mx-2">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl sm:text-5xl text-beige mb-3">{t("section_route")}</h2>
              <div className="section-divider w-24 mx-auto" />
            </div>

            {selectedDistance.distanceEmbedUrl ? (
              <div className="bg-white p-3 rounded-xl">
                <iframe
                  src={selectedDistance.distanceEmbedUrl}
                  title="Route Map"
                  style={{
                    width: '1px',
                    minWidth: '100%',
                    height: '700px',
                    border: 'none',
                    overflow: "hidden"
                  }}
                />
              </div>
            ) : (
              <div className="w-full bg-white/5 rounded-xl flex items-center justify-center border-2 border-dashed border-white/20 py-12 px-6">
                <div className="text-center">
                  <svg className="w-16 h-16 text-beige/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
                  </svg>
                  {isDakar ? (
                    <>
                      <p className="text-beige/70 text-lg font-medium mb-6">{t("route_reveal_countdown")}</p>
                      <div className="flex justify-center gap-3 sm:gap-6">
                        <div className="flex flex-col items-center">
                          <span className="font-display text-3xl sm:text-5xl text-beige">{countdown.days}</span>
                          <span className="text-beige/50 text-xs sm:text-sm uppercase tracking-wider">{t("countdown_days")}</span>
                        </div>
                        <span className="font-display text-3xl sm:text-5xl text-beige/30">:</span>
                        <div className="flex flex-col items-center">
                          <span className="font-display text-3xl sm:text-5xl text-beige">{countdown.hours.toString().padStart(2, '0')}</span>
                          <span className="text-beige/50 text-xs sm:text-sm uppercase tracking-wider">{t("countdown_hours")}</span>
                        </div>
                        <span className="font-display text-3xl sm:text-5xl text-beige/30">:</span>
                        <div className="flex flex-col items-center">
                          <span className="font-display text-3xl sm:text-5xl text-beige">{countdown.minutes.toString().padStart(2, '0')}</span>
                          <span className="text-beige/50 text-xs sm:text-sm uppercase tracking-wider">{t("countdown_minutes")}</span>
                        </div>
                        <span className="font-display text-3xl sm:text-5xl text-beige/30">:</span>
                        <div className="flex flex-col items-center">
                          <span className="font-display text-3xl sm:text-5xl text-beige">{countdown.seconds.toString().padStart(2, '0')}</span>
                          <span className="text-beige/50 text-xs sm:text-sm uppercase tracking-wider">{t("countdown_seconds")}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-beige/70 text-lg font-medium">{t("route_coming_soon")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Registration Section - simplified, centered */}
        <section className="relative py-20 overflow-hidden rounded-3xl mt-6 mx-2">
          <div className={`absolute inset-0 rounded-3xl ${
            isDakar
              ? "bg-linear-to-br from-beige via-[#FFD87F] to-[#E4DAD1]"
              : "bg-linear-to-br from-pink via-pink/80 to-lime"
          }`} />

          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <h2 className={`font-display text-4xl sm:text-5xl mb-8 ${
              isDakar ? "text-bronze" : "text-blue"
            }`}>
              {t("register_heading")}
            </h2>

            <Link
              href={`/${locale === "en" ? "en/" : ""}${event.slug}/checkout?distance=${selectedDistanceIndex}`}
              className={`inline-flex items-center gap-3 text-lg font-bold px-10 py-5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all ${
                isDakar
                  ? "bg-bronze text-beige shadow-bronze/40 hover:shadow-bronze/50"
                  : "bg-blue text-white shadow-blue/40 hover:shadow-blue/50"
              }`}
            >
              <span>{t("register_button")}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ isDakar={isDakar} />

        {/* Footer - simplified, centered brand */}
        <footer className="section-cream text-white py-10 relative overflow-hidden rounded-3xl mt-6 mx-2 mb-4">
          <div className="relative z-10 px-6">
            {/* Centered brand name */}
            <div className="text-center mb-6">
              <span className="font-display text-2xl text-beige">{t("footer_brand")}</span>
            </div>

            {/* Links centered below */}
            <nav className="flex justify-center gap-8">
              <Link
                href={locale === "en" ? "/en/privatuma-politika" : "/privatuma-politika"}
                className={`text-beige/60 transition-colors text-sm ${
                  isDakar ? "hover:text-[#FFD87F]" : "hover:text-pink"
                }`}
              >
                {t("footer_privacy")}
              </Link>
              <Link
                href={locale === "en" ? "/en/noteikumi" : "/noteikumi"}
                className={`text-beige/60 transition-colors text-sm ${
                  isDakar ? "hover:text-[#FFD87F]" : "hover:text-pink"
                }`}
              >
                {t("footer_terms")}
              </Link>
              <Link
                href={locale === "en" ? "/en/kontakti" : "/kontakti"}
                className={`text-beige/60 transition-colors text-sm ${
                  isDakar ? "hover:text-[#FFD87F]" : "hover:text-pink"
                }`}
              >
                {t("footer_contact")}
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
