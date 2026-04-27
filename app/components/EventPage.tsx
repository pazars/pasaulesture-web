"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EventData, EventDistance } from "@/app/data/events";
import { ExternalLinkIcon, LocationIcon } from "./Icons";
import FAQ from "./FAQ";
import Header from "./Header";
import Gallery from "./Gallery";
import { useTranslations, useLocale } from "next-intl";
import { formatText } from "@/app/lib/formatText";

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
  // const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const selectedDistance: EventDistance = event.distances[selectedDistanceIndex];
  const formattedDate = formatEventDate(event.date, locale);

  // Compute distance options for hero fact line (e.g. "200 km vai 370 km")
  const allDistanceValues = event.distances.map(d => {
    const fact = d.facts.find(f => f.icon === "route");
    return fact?.value || "";
  });
  const distanceDisplay = allDistanceValues.length === 1
    ? allDistanceValues[0]
    : allDistanceValues.map((v, i) =>
        i < allDistanceValues.length - 1 ? v.replace(/\s*km/, '') : v
      ).join(` ${t("distance_or")} `);

  // Event-specific theme configuration
  const isDakar = event.slug === "parize-dakara";
  const heroImageSrc = isDakar ? "/post/dakar/dakar-card.png" : (event.gallery?.[0] || "/post/card.png");
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

  // Countdown timer for route reveal (Dakar: March 1st, 2026) - commented out, replaced with "route_reveal_soon"
  // useEffect(() => {
  //   if (!isDakar) return;
  //
  //   const routeRevealDate = new Date('2026-03-01T00:00:00');
  //
  //   const updateCountdown = () => {
  //     const now = new Date();
  //     const diff = routeRevealDate.getTime() - now.getTime();
  //
  //     if (diff <= 0) {
  //       setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  //       return;
  //     }
  //
  //     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  //     const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  //     const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  //
  //     setCountdown({ days, hours, minutes, seconds });
  //   };
  //
  //   updateCountdown();
  //   const interval = setInterval(updateCountdown, 1000);
  //
  //   return () => clearInterval(interval);
  // }, [isDakar]);

  const handleDistanceSelect = (index: number) => {
    setSelectedDistanceIndex(index);
    localStorage.setItem(`last_distance_${event.slug}`, index.toString());
  };


  return (
    <div className="min-h-screen main-content">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Header currentSlug={event.slug} />
        <p className="hidden sm:block text-center text-beige text-xl font-accent tracking-[0.15em] pt-2 pb-1">
          {t("header_subtitle")}
        </p>

        {/* Hero Section - Postcard Collage */}
        <section className="relative w-full sm:min-h-[70vh] overflow-visible sm:overflow-hidden rounded-3xl mx-auto pt-2 pb-2 sm:pb-12" style={{ maxWidth: 'calc(100% - 1rem)', marginLeft: '0.5rem', marginRight: '0.5rem' }}>

          {/* Mobile: Event identity block — label contextualizes the event name */}
          <div className="sm:hidden relative z-20 text-center px-6 mb-8 animate-on-load animate-fade-in-up">
            <p className="text-beige/80 text-sm font-accent mb-2">
              {t("header_subtitle")}
            </p>
            <h2 className={`font-accent text-4xl tracking-wide ${
              isDakar ? "text-dakar-yellow" : "text-pink"
            }`}>
              {t(event.nameKey as any)}
            </h2>
            <p className="text-beige/70 text-sm mt-3">
              {distanceDisplay}
            </p>
          </div>

          {/* Elegant Spelled-Out Date - Top */}
          <div className="relative z-20 flex justify-center px-6 mb-8 sm:mb-12">
            <div className="text-center">
              <h1 className="font-accent text-[clamp(1.25rem,5.5vw,1.75rem)] sm:text-5xl md:text-6xl lg:text-7xl text-beige tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] leading-tight whitespace-nowrap">
                {formattedDate}
              </h1>
            </div>
          </div>

          {/* Mobile: Compact postcard collage — stamps tucked into postcard corners */}
          <div className="sm:hidden relative w-full max-w-sm mx-auto px-4 mb-6 animate-on-load animate-fade-in-up delay-200">
            <div className="relative">
              {/* Main hero image */}
              <div className="rotate-[-2deg]">
                <div className="relative aspect-[13/9] overflow-hidden rounded-lg shadow-2xl">
                  <Image
                    src={heroImageSrc}
                    alt="Pasaules Tūre"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 384px"
                    priority
                  />
                </div>
              </div>

              {/* Stamp 1 — top-left, overlapping the postcard corner */}
              <div className="absolute z-20 -top-6 -left-3">
                <div className="stamp-hover">
                  <Image
                    src={stamps[0].src}
                    alt={stamps[0].alt}
                    width={70}
                    height={91}
                    className="drop-shadow-md rotate-[-12deg]"
                  />
                </div>
              </div>

              {/* Stamp 2 — bottom-right, overlapping the postcard corner */}
              <div className="absolute z-20 -bottom-5 -right-2">
                <div className="stamp-hover">
                  <Image
                    src={stamps[1].src}
                    alt={stamps[1].alt}
                    width={65}
                    height={85}
                    className="drop-shadow-md rotate-[10deg]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Scattered Collage Container */}
          <div className="relative w-full max-w-4xl mx-auto px-4 hidden sm:block" style={{ minHeight: '400px' }}>

            {/* Main hero image - Center, slightly tilted */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rotate-[-2deg]">
              <div className="relative group w-[520px] aspect-[13/9] overflow-hidden rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-0">
                <Image
                  src={heroImageSrc}
                  alt="Pasaules Tūre"
                  fill
                  className="object-cover"
                  sizes="520px"
                  priority
                />
              </div>
            </div>

            {/* Stamp 1 - Top Left, tilted */}
            <div
              className="absolute z-20"
              style={{
                left: '5%',
                top: '5%',
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
              className="absolute z-20"
              style={{
                right: '8%',
                bottom: '10%',
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
              className="absolute z-15"
              style={{
                right: '3%',
                top: '15%',
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
              className="absolute z-15"
              style={{
                left: '2%',
                bottom: '15%',
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

          {/* Desktop: quote, distance options, and CTA */}
          <div className="hidden sm:block relative z-20 max-w-2xl mx-auto px-6 text-center mt-8">
            <p className="text-lg md:text-xl lg:text-2xl text-beige font-medium italic leading-relaxed font-accent">
              {t(event.heroQuoteKey as any)}
            </p>
            <Link
              href={`/${locale === "en" ? "en/" : ""}${event.slug}/checkout?distance=${selectedDistanceIndex}`}
              className={`inline-block text-base font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all mt-6 ${
                isDakar
                  ? "bg-dakar-yellow text-dakar-brown shadow-dakar-yellow/30"
                  : "bg-pink text-blue shadow-pink/30"
              }`}
            >
              {t("register_button")}
            </Link>
          </div>
        </section>

        {/* Mobile: Tagline + CTA — the commercial hook */}
        <section className="relative pt-4 pb-8 overflow-hidden rounded-3xl mx-2 sm:hidden animate-on-load animate-fade-in-up delay-400">
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <p className="text-2xl text-beige font-display leading-relaxed mb-6">
              {t(event.heroQuoteKey as any)}
            </p>
            <Link
              href={`/${locale === "en" ? "en/" : ""}${event.slug}/checkout?distance=${selectedDistanceIndex}`}
              className={`inline-block text-base font-bold px-8 py-3.5 rounded-full shadow-lg transition-all hover:-translate-y-0.5 ${
                isDakar
                  ? "bg-dakar-yellow text-dakar-brown shadow-dakar-yellow/30"
                  : "bg-pink text-blue shadow-pink/30"
              }`}
            >
              {t("register_button")}
            </Link>
          </div>
        </section>

        {/* Route Section */}
        <section id="route" className="py-10 sm:py-16 relative overflow-hidden rounded-3xl mt-4 mx-2">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-8">
              <h2 className="font-accent text-4xl sm:text-5xl text-beige mb-3">{t("section_route")}</h2>
              <div className="section-divider w-24 mx-auto" />

              <p className="sm:hidden text-beige/40 text-sm mt-3">{t("route_best_on_pc")}</p>

              {event.routeDescriptionKey && t(event.routeDescriptionKey as any) && (
                <p className="text-beige/50 text-sm mt-3">{t(event.routeDescriptionKey as any)}</p>
              )}

              {/* Start & finish locations */}
              <div className="flex flex-col items-center gap-1 mt-3">
                <a
                  href={event.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm transition-colors ${isDakar ? "text-beige hover:text-dakar-yellow" : "text-beige hover:text-pink"}`}
                >
                  <LocationIcon className="w-4 h-4" />
                  <span className="font-semibold">{t("label_start")}: {event.location.name}</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
                {selectedDistance.endLocation && (
                  <a
                    href={selectedDistance.endLocation.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm transition-colors ${isDakar ? "text-beige hover:text-dakar-yellow" : "text-beige hover:text-pink"}`}
                  >
                    <LocationIcon className="w-4 h-4" />
                    <span className="font-semibold">{t("label_finish")}: {selectedDistance.endLocation.name}</span>
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Distance toggle — pill style, matches event tabs */}
              {event.distances.length > 1 && (
                <div className={`flex rounded-full p-1 border max-w-xs mx-auto mt-6 ${isDakar ? "bg-dakar-brown/30 border-dakar-cream/12" : "bg-blue/30 border-white/10"} backdrop-blur-md`}>
                  {event.distances.map((distance, index) => {
                    const isSelected = index === selectedDistanceIndex;
                    const distanceFact = distance.facts.find(f => f.icon === "route");
                    const label = distanceFact?.value || t(distance.nameKey as any);
                    return isSelected ? (
                      <span
                        key={distance.nameKey}
                        className={`flex-1 text-center py-2 rounded-full font-accent font-bold text-sm cursor-default transition-all ${isDakar ? "bg-dakar-cream text-dakar-brown shadow-md shadow-dakar-cream/25" : "bg-pink text-blue shadow-md shadow-pink/25"}`}
                      >
                        {label}
                      </span>
                    ) : (
                      <button
                        key={distance.nameKey}
                        onClick={() => handleDistanceSelect(index)}
                        className="flex-1 text-center py-2 rounded-full font-accent font-semibold text-sm text-beige/50 transition-all active:scale-95 cursor-pointer"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedDistance.distanceEmbedUrl ? (
              <div className="bg-white p-3 rounded-xl">
                <iframe
                  src={selectedDistance.distanceEmbedUrl.replace(/sampleGraph=(true|false)/, `sampleGraph=${!isMobile}`)}
                  title="Route Map"
                  loading="lazy"
                  className="h-[400px] sm:h-[700px]"
                  style={{
                    width: '1px',
                    minWidth: '100%',
                    border: 'none',
                    overflow: "hidden"
                  }}
                />
              </div>
            ) : (
              <div className="w-full bg-white/5 rounded-xl flex items-center justify-center border-2 border-dashed border-white/20 py-12 px-6">
                <div className="text-center">
                  <span className="block text-5xl mb-4" role="img" aria-hidden="true">👀</span>
                  {isDakar ? (
                    <>
                      <p className="text-beige/70 text-lg font-medium mb-2">{t("route_reveal_countdown")}</p>
                      <p className="text-beige/70 text-lg font-medium">{t("route_reveal_soon")}</p>
                    </>
                    /* Countdown timer - commented out, replaced with "route_reveal_soon" message
                    <>
                      <p className="text-beige/70 text-lg font-medium mb-6">{t("route_reveal_countdown")}</p>
                      <div className="grid grid-cols-4 gap-3 sm:gap-5 w-full max-w-xs sm:max-w-md mx-auto">
                        {[
                          { value: countdown.days, label: t("countdown_days", { count: countdown.days }) },
                          { value: countdown.hours, label: t("countdown_hours", { count: countdown.hours }) },
                          { value: countdown.minutes, label: t("countdown_minutes", { count: countdown.minutes }) },
                          { value: countdown.seconds, label: t("countdown_seconds", { count: countdown.seconds }) },
                        ].map((unit) => (
                          <div key={unit.label} className="text-center">
                            <span className="block font-sans tabular-nums text-3xl sm:text-5xl text-beige font-bold">
                              {unit.value.toString().padStart(2, '0')}
                            </span>
                            <span className="block text-beige/40 text-xs sm:text-sm mt-1">{unit.label}</span>
                          </div>
                        ))}
                      </div>
                    </>
                    */
                  ) : (
                    <p className="text-beige/70 text-lg font-medium">{t("route_coming_soon")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Second hero quote — between map and highlights */}
        <section className="relative py-4 sm:py-6 mx-2 rounded-3xl overflow-hidden">
          <div className="max-w-3xl mx-auto px-6 text-beige text-base sm:text-lg leading-relaxed text-center">
            {t(event.heroQuote2Key as any)}
          </div>
        </section>

        {/* Route Highlights */}
        {event.routeHighlightsKey && (
          <section className="relative py-4 sm:py-6 mx-2 rounded-3xl overflow-hidden">
            <div className="max-w-3xl mx-auto px-6 text-beige text-base sm:text-lg leading-relaxed text-center">
              {formatText(t(event.routeHighlightsKey as any))}
            </div>
          </section>
        )}

        {/* Photo Gallery Section */}
        {event.gallery && event.gallery.length > 0 && (
          <Gallery
            images={event.gallery}
          />
        )}

        {/* Registration Section - collage style (desktop only — mobile has inline CTA + sticky bar) */}
        <section id="register" className="hidden sm:block relative py-6 sm:py-16 mt-2 sm:mt-6 mx-2">

          {/* Left stamp - sits above text, slightly askew */}
          <div className="absolute z-10 hidden sm:block" style={{ left: '8%', top: '50%', transform: 'translateY(-50%)' }}>
            <Image
              src={stamps[0].src}
              alt=""
              width={95}
              height={124}
              aria-hidden="true"
              className="drop-shadow-xl"
              style={{ transform: 'rotate(-7deg)' }}
            />
          </div>

          {/* Right stamp - sits BELOW text (lower z-index), near the ? mark, slightly rotated */}
          <div className="absolute z-5 hidden sm:block" style={{ right: '10%', top: '50%', transform: 'translateY(-50%)' }}>
            <Image
              src={stamps[1].src}
              alt=""
              width={88}
              height={115}
              aria-hidden="true"
              className="drop-shadow-xl"
              style={{ transform: 'rotate(11deg)' }}
            />
          </div>

          {/* CTA content — sits on top */}
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <Link
              href={`/${locale === "en" ? "en/" : ""}${event.slug}/checkout?distance=${selectedDistanceIndex}`}
              className={`inline-block text-lg font-bold px-10 py-5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all ${isDakar ? "bg-dakar-yellow text-dakar-brown shadow-dakar-yellow/30 hover:shadow-dakar-yellow/40" : "bg-pink text-blue shadow-pink/30 hover:shadow-pink/40"}`}
            >
              {t("register_button")}
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
            <nav className="flex justify-center gap-4 sm:gap-8">
              <Link
                href={locale === "en" ? "/en/privatuma-politika" : "/privatuma-politika"}
                className={`text-beige/60 transition-colors text-sm ${isDakar ? "hover:text-dakar-yellow" : "hover:text-pink"
                  }`}
              >
                {t("footer_privacy")}
              </Link>
              <Link
                href={locale === "en" ? "/en/noteikumi" : "/noteikumi"}
                className={`text-beige/60 transition-colors text-sm ${isDakar ? "hover:text-dakar-yellow" : "hover:text-pink"
                  }`}
              >
                {t("footer_terms")}
              </Link>
              <Link
                href={locale === "en" ? "/en/kontakti" : "/kontakti"}
                className={`text-beige/60 transition-colors text-sm ${isDakar ? "hover:text-dakar-yellow" : "hover:text-pink"
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
