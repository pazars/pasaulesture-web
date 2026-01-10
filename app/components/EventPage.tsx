"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EventData, EventDistance } from "@/app/data/events";
import { getIconByName, ExternalLinkIcon, LocationIcon, GravelBikeIcon } from "./Icons";
import FAQ from "./FAQ";
import Header from "./Header";

interface EventPageProps {
  event: EventData;
  images: string[];
}

// Decorative trail/path SVG component
function TrailDecoration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 50 Q 50 20, 100 50 T 200 50"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="8 4"
        opacity="0.3"
      />
      <path
        d="M0 70 Q 50 40, 100 70 T 200 70"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 3"
        opacity="0.2"
      />
    </svg>
  );
}

// Mountain silhouette decoration
function MountainDecoration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 100 L0 60 L40 40 L80 55 L120 25 L160 50 L200 20 L240 45 L280 15 L320 40 L360 30 L400 50 L400 100 Z"
        opacity="0.1"
      />
      <path
        d="M0 100 L0 70 L50 50 L100 65 L150 35 L200 55 L250 30 L300 50 L350 40 L400 60 L400 100 Z"
        opacity="0.15"
      />
    </svg>
  );
}

export default function EventPage({ event, images }: EventPageProps) {
  const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(event.distances.length - 1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const selectedDistance: EventDistance = event.distances[selectedDistanceIndex];
  const hasMultipleDistances = event.distances.length > 1;
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Main content container */}
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Header currentSlug={event.slug} />

        {/* Hero Section */}
        <section className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] overflow-hidden rounded-3xl mx-auto" style={{ maxWidth: 'calc(100% - 1rem)', marginLeft: '0.5rem', marginRight: '0.5rem' }}>
          {images.length > 0 ? (
            <>
              {/* Background Image with Ken Burns effect */}
              <div className="absolute inset-0">
                <Image
                  src={images[currentImageIndex]}
                  alt={`${event.name} - ${currentImageIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-[8000ms] ease-out scale-105 hover:scale-100"
                  priority
                />
              </div>

              {/* Gradient Overlays */}
              <div className="absolute inset-0 hero-overlay" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 hero-overlay-bottom" />

              {/* Decorative Elements */}
              <MountainDecoration className="absolute bottom-0 left-0 right-0 h-24 text-forest-deep" />

              {/* Event Title & Tagline */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                <div
                  className={`text-center transition-all duration-1000 ${
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                >
                  {/* Small decorative element */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="h-px w-12 bg-amber-light/60" />
                    <GravelBikeIcon className="w-6 h-6 text-amber-light" />
                    <span className="h-px w-12 bg-amber-light/60" />
                  </div>

                  <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-white tracking-tight drop-shadow-2xl">
                    {event.name}
                  </h1>

                  {/* Event date badge */}
                  <div
                    className={`mt-6 inline-flex items-center gap-2 glass-dark px-5 py-2.5 rounded-full transition-all duration-1000 delay-300 ${
                      isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                  >
                    <svg className="w-5 h-5 text-amber-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white font-semibold">
                      {selectedDistance.facts.find(f => f.icon === "calendar")?.value || "Coming Soon"}
                    </span>
                  </div>
                </div>

                {/* Scroll indicator */}
                <div
                  className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="animate-float">
                    <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Gallery Navigation */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full transition-all hover:bg-white/20 hover:scale-110 group"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6 text-white group-hover:text-amber-light transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full transition-all hover:bg-white/20 hover:scale-110 group"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6 text-white group-hover:text-amber-light transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image indicators */}
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? "bg-amber-light w-8"
                            : "bg-white/40 w-2 hover:bg-white/60"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-forest-deep to-forest-medium flex items-center justify-center">
              <h1 className="font-display text-5xl sm:text-7xl text-white text-center">
                {event.name}
              </h1>
            </div>
          )}
        </section>

        {/* Quote Section */}
        <section className="relative bg-cream py-12 overflow-hidden rounded-3xl mt-6 mx-2">
          <TrailDecoration className="absolute top-0 left-0 right-0 w-full h-16 text-forest-medium" />
          <div className="max-w-3xl mx-auto px-6 text-center relative">
            <p className="text-xl sm:text-2xl text-earth-warm font-medium italic leading-relaxed">
              &ldquo;Ultra riteņbraukšanas pasākumi, kas sniedz iespēju apceļot pasaulē pazīstamas vietas tepat Latvijā.&rdquo;
            </p>
          </div>
        </section>

        {/* Facts Bar + Distance Selection */}
        <section className="relative mt-6 mx-2 rounded-3xl overflow-hidden">
          {/* Facts Bar */}
          <div className="bg-forest-deep text-white py-10 topo-pattern-light noise-overlay rounded-t-3xl">
            <div className="max-w-5xl mx-auto px-6 relative z-10">
              {/* Row 1: Surface Type - Featured */}
              <div className="flex justify-center items-center gap-4 mb-6">
                <div className="bg-forest-medium/50 backdrop-blur-sm px-8 py-4 rounded-full flex items-center gap-4 border border-forest-light/30">
                  <GravelBikeIcon className="w-8 h-8 text-amber-light" />
                  <div>
                    <p className="text-xs text-sand/80 uppercase tracking-wider">Segums</p>
                    <p className="text-xl font-bold text-white">{event.surfaceType}</p>
                  </div>
                </div>
              </div>

              {/* Row 2: Location, Date, Time Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {/* Location */}
                <div className="group bg-forest-medium/30 backdrop-blur-sm p-5 rounded-xl border border-forest-light/20 hover:border-amber/40 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber/20 rounded-lg group-hover:bg-amber/30 transition-colors">
                      <LocationIcon className="w-6 h-6 text-amber-light" />
                    </div>
                    <div>
                      <p className="text-xs text-sand/70 uppercase tracking-wider mb-1">Starts</p>
                      {event.location.googleMapsUrl ? (
                        <a
                          href={event.location.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-white hover:text-amber-light transition-colors inline-flex items-center gap-1"
                        >
                          {event.location.name}
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <p className="font-bold text-white">{event.location.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date and Time Limit only (exclude route and mountain) */}
                {selectedDistance.facts
                  .filter(fact => fact.icon !== "route" && fact.icon !== "mountain")
                  .map((fact, index) => {
                    const Icon = getIconByName(fact.icon);
                    return (
                      <div
                        key={index}
                        className="group bg-forest-medium/30 backdrop-blur-sm p-5 rounded-xl border border-forest-light/20 hover:border-amber/40 transition-all hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber/20 rounded-lg group-hover:bg-amber/30 transition-colors">
                            <Icon className="w-6 h-6 text-amber-light" />
                          </div>
                          <div>
                            <p className="text-xs text-sand/70 uppercase tracking-wider mb-1">{fact.label}</p>
                            <p className="font-bold text-white">{fact.value}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Distance Selection */}
          <div className="bg-cream-light py-8 border-t-4 border-amber/30 rounded-b-3xl">
            <div className="max-w-5xl mx-auto px-6">
              {hasMultipleDistances && (
                <h3 className="text-center text-sm font-bold text-stone uppercase tracking-widest mb-5">
                  Izvēlies savu izaicinājumu
                </h3>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                {event.distances.map((distance, index) => {
                  const distanceFact = distance.facts.find(f => f.icon === "route");
                  const elevationFact = distance.facts.find(f => f.icon === "mountain");
                  const distanceValue = distanceFact?.value || "";
                  const elevationValue = elevationFact?.value || "";
                  const isSelected = index === selectedDistanceIndex;
                  return (
                    <button
                      key={distance.name}
                      onClick={() => setSelectedDistanceIndex(index)}
                      className={`relative px-8 py-5 font-bold transition-all rounded-2xl border-2 overflow-hidden group ${
                        isSelected
                          ? "bg-forest-deep text-white border-forest-deep shadow-lg shadow-forest-deep/30"
                          : "bg-white text-earth-dark border-sand hover:border-forest-medium hover:shadow-md"
                      }`}
                    >
                      {/* Decorative corner */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-amber transform rotate-45 translate-x-4 -translate-y-4" />
                      )}
                      <span className="block text-lg relative z-10">{distance.name}</span>

                      {/* Distance with icon */}
                      <div className={`flex items-center justify-center gap-1.5 mt-2 relative z-10 ${isSelected ? "text-sand" : "text-stone"}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm font-semibold">{distanceValue}</span>
                      </div>

                      {/* Elevation with icon */}
                      {elevationValue && (
                        <div className={`flex items-center justify-center gap-1.5 mt-1 relative z-10 ${isSelected ? "text-sand/80" : "text-stone/70"}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          <span className="text-sm">{elevationValue}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Route Section */}
        <section className="py-20 bg-cream topo-pattern relative overflow-hidden rounded-3xl mt-6 mx-2">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl sm:text-5xl text-forest-deep mb-3">Maršruts</h2>
              <div className="section-divider w-24 mx-auto" />
            </div>

            {selectedDistance.komootEmbedUrl ? (
              <div className="relative">
                {/* Decorative frame */}
                <div className="absolute -inset-3 bg-gradient-to-br from-forest-deep via-forest-medium to-amber rounded-2xl opacity-20 blur-xl" />
                <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-sand/50">
                  <iframe
                    src={selectedDistance.komootEmbedUrl}
                    className="w-full h-225"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-225 bg-gradient-to-br from-cream to-sand rounded-xl flex items-center justify-center border-2 border-dashed border-stone/30">
                <div className="text-center">
                  <svg className="w-16 h-16 text-stone/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
                  </svg>
                  <p className="text-stone text-lg font-medium">Maršruts drīzumā...</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Registration Section */}
        <section className="relative py-24 overflow-hidden rounded-3xl mt-6 mx-2">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-forest-deep via-forest-medium to-forest-light rounded-3xl" />

          {/* Decorative elements */}
          <div className="absolute inset-0 topo-pattern-light opacity-30" />
          <MountainDecoration className="absolute top-0 left-0 right-0 h-32 text-cream rotate-180" />

          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 bg-amber/20 text-amber-light px-4 py-2 rounded-full text-sm font-semibold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Piesakies tagad
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl text-white mb-6">
              Gatavs izaicinājumam?
            </h2>

            {event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                className="btn-primary inline-flex items-center gap-3 text-lg animate-pulse-glow"
              >
                <span>Reģistrēties</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-3 bg-forest-light/50 text-sand/70 px-8 py-4 rounded-full font-bold cursor-not-allowed text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Reģistrācija drīzumā</span>
              </button>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* Footer */}
        <footer className="bg-charcoal-warm text-white py-12 relative overflow-hidden rounded-3xl mt-6 mx-2 mb-4">
          <TrailDecoration className="absolute top-4 left-0 right-0 w-full h-12 text-stone opacity-20" />

          <div className="relative z-10 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Logo/Brand */}
              <div className="flex items-center gap-3">
                <GravelBikeIcon className="w-8 h-8 text-amber" />
                <span className="font-display text-xl">Pasaules Tūre</span>
              </div>

              {/* Copyright */}
              <p className="text-stone text-sm">
                © {new Date().getFullYear()} Pasaules Tūre.
              </p>

              {/* Links */}
              <nav className="flex gap-6">
                <Link
                  href="/privatuma-politika"
                  className="text-sand/70 hover:text-amber-light transition-colors text-sm"
                >
                  Privātuma politika
                </Link>
                <Link
                  href="/noteikumi"
                  className="text-sand/70 hover:text-amber-light transition-colors text-sm"
                >
                  Noteikumi
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
