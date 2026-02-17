"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EventData, EventDistance } from "@/app/data/events";
import { ExternalLinkIcon, LocationIcon } from "./Icons";
import FAQ from "./FAQ";
import Header from "./Header";
import Toast from "./Toast";
import Gallery from "./Gallery";
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
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showToast, setShowToast] = useState(false);
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

  const handleRegistrationClick = () => {
    setShowToast(true);
  };

  return (
    <div className="min-h-screen main-content">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Header currentSlug={event.slug} />
        <p className="hidden sm:block text-center text-beige text-base font-accent tracking-[0.15em] pt-2 pb-1">
          {t("header_subtitle")}
        </p>

        {/* Hero Section - Postcard Collage */}
        <section className="relative w-full sm:min-h-[70vh] overflow-visible sm:overflow-hidden rounded-3xl mx-auto pt-2 pb-2 sm:pb-12" style={{ maxWidth: 'calc(100% - 1rem)', marginLeft: '0.5rem', marginRight: '0.5rem' }}>

          {/* Mobile: Event name above date */}
          <div className="sm:hidden relative z-20 text-center px-6 mb-5">
            <h2 className={`font-accent text-3xl tracking-wide ${
              isDakar ? "text-dakar-yellow" : "text-pink"
            }`}>
              {t(event.nameKey as any)}
            </h2>
          </div>

          {/* Elegant Spelled-Out Date - Top */}
          <div className="relative z-20 flex justify-center px-6 mb-6 sm:mb-12">
            <div className="text-center">
              <h1 className="font-accent text-[clamp(1.5rem,7.5vw,2.25rem)] sm:text-5xl md:text-6xl lg:text-7xl text-beige tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)] leading-tight whitespace-nowrap">
                {formattedDate}
              </h1>
            </div>
          </div>

          {/* Mobile: Compact postcard collage — stamps tucked into postcard corners */}
          <div className="sm:hidden relative w-full max-w-xs mx-auto px-4 mb-4">
            <div className="relative">
              {/* Main Postcard */}
              <div className="rotate-[-2deg]">
                <Image
                  src={postcardSrc}
                  alt="Pasaules Tūre Postcard"
                  width={520}
                  height={360}
                  className="rounded-lg shadow-2xl w-full h-auto"
                  priority
                />
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

            {/* Main Postcard - Center, slightly tilted */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rotate-[-2deg]">
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

          {/* Route description (desktop only — fills space below collage) */}
          <div className="hidden sm:block relative z-20 max-w-2xl mx-auto px-6 text-center mt-8">
            <p className="text-lg md:text-xl lg:text-2xl text-beige font-medium italic leading-relaxed font-accent mb-4">
              &ldquo;{t(event.heroQuoteKey as any)}&rdquo;
            </p>
            <p className="text-base md:text-lg text-beige/70 leading-relaxed">
              {t(event.heroQuote2Key as any)}
            </p>
          </div>
        </section>

        {/* Quote Section - two paragraphs */}
        <section className="relative py-6 overflow-hidden rounded-3xl mt-2 mx-2 sm:hidden">
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <p className="text-xl sm:text-2xl text-beige font-medium italic leading-relaxed font-accent mb-6">
              &ldquo;{t(event.heroQuoteKey as any)}&rdquo;
            </p>
            <p className="text-lg text-beige/70 leading-relaxed">
              {t(event.heroQuote2Key as any)}
            </p>
          </div>
        </section>

        {/* Route Selection with Start Location */}
        {/* Only show route selection if there are multiple routes */}
        {event.distances.length > 1 && (
          <section className="relative mt-4 mx-2 rounded-3xl overflow-hidden py-4">
            <div className="max-w-5xl mx-auto px-6">
              {/* Vertical layout: Start on top, Routes below */}
              <div className="flex flex-col items-center gap-4">

              {/* Start Location - Top, centered */}
              {event.location.googleMapsUrl ? (
                <a
                  href={event.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/8 hover:bg-white/12 transition-all cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${isDakar ? "bg-dakar-cream/25" : "bg-pink/25"
                    }`}>
                    <LocationIcon className={`w-5 h-5 ${isDakar ? "text-beige" : "text-pink"
                      }`} />
                  </div>
                  <div>
                    <p className="text-xs text-beige/60 uppercase tracking-wider font-semibold">{t("label_start")}</p>
                    <p className={`font-bold text-beige transition-colors inline-flex items-center gap-1 ${isDakar ? "group-hover:text-dakar-yellow" : "group-hover:text-pink"
                      }`}>
                      {event.location.name}
                      <ExternalLinkIcon className="w-3 h-3" />
                    </p>
                  </div>
                </a>
              ) : (
                <div className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/8">
                  <div className={`p-2 rounded-lg ${isDakar ? "bg-dakar-cream/25" : "bg-pink/25"
                    }`}>
                    <LocationIcon className={`w-5 h-5 ${isDakar ? "text-beige" : "text-pink"
                      }`} />
                  </div>
                  <div>
                    <p className="text-xs text-beige/60 uppercase tracking-wider font-semibold">{t("label_start")}</p>
                    <p className="font-bold text-beige">{event.location.name}</p>
                  </div>
                </div>
              )}

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
                      className={`relative px-8 py-5 font-bold transition-all rounded-2xl overflow-hidden w-full sm:w-auto sm:min-w-40 cursor-pointer ${isSelected
                        ? isDakar
                          ? "bg-dakar-cream text-dakar-brown shadow-lg shadow-dakar-cream/40 scale-105"
                          : "bg-pink text-blue shadow-lg shadow-pink/40 scale-105"
                        : "bg-white/8 text-beige hover:bg-white/15 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                        }`}
                    >
                      {isSelected && (
                        <div className={`absolute top-0 right-0 w-6 h-6 transform rotate-45 translate-x-3 -translate-y-3 ${isDakar ? "bg-dakar-yellow" : "bg-lime"
                          }`} />
                      )}
                      <span className="block text-lg relative z-10 font-accent">{distanceName}</span>
                      <div className={`flex items-center justify-center gap-2 mt-1.5 relative z-10 text-sm ${isSelected
                        ? isDakar
                          ? "text-dakar-brown/70"
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
        )}

        {/* Route Section */}
        <section id="route" className="py-10 sm:py-16 relative overflow-hidden rounded-3xl mt-4 mx-2">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
              <h2 className="font-accent text-4xl sm:text-5xl text-beige mb-3">{t("section_route")}</h2>
              <div className="section-divider w-24 mx-auto" />
              {/* TODO: Remove isDakar check once Parīze-Dakāra route is revealed */}
              {!isDakar && <p className="sm:hidden text-beige/40 text-sm mt-3">{t("route_best_on_pc")}</p>}
            </div>

            {selectedDistance.distanceEmbedUrl ? (
              <div className="bg-white p-3 rounded-xl">
                <iframe
                  src={selectedDistance.distanceEmbedUrl.replace(/sampleGraph=(true|false)/, `sampleGraph=${!isMobile}`)}
                  title="Route Map"
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
                  ) : (
                    <p className="text-beige/70 text-lg font-medium">{t("route_coming_soon")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Photo Gallery Section */}
        {event.gallery && event.gallery.length > 0 && (
          <Gallery
            images={event.gallery}
          />
        )}

        {/* Registration Section - collage style */}
        <section id="register" className="relative py-6 sm:py-16 mt-2 sm:mt-6 mx-2">

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
            {isDakar ? (
              <button
                onClick={handleRegistrationClick}
                className="inline-flex items-center gap-3 text-lg font-bold px-10 py-5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-dakar-yellow text-dakar-brown shadow-dakar-yellow/30 hover:shadow-dakar-yellow/40"
              >
                <span>{t("register_button")}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            ) : (
              <Link
                href={`/${locale === "en" ? "en/" : ""}${event.slug}/checkout?distance=${selectedDistanceIndex}`}
                className="inline-flex items-center gap-3 text-lg font-bold px-10 py-5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-pink text-blue shadow-pink/30 hover:shadow-pink/40"
              >
                <span>{t("register_button")}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
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

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={t("registration_coming_soon")}
          onClose={() => setShowToast(false)}
          isDakar={isDakar}
        />
      )}
    </div>
  );
}
