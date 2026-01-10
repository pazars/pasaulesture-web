"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EventData, EventDistance } from "@/app/data/events";
import { getIconByName, ExternalLinkIcon, LocationIcon, GravelBikeIcon } from "./Icons";
import FAQ from "./FAQ";
import Header from "./Header";

interface EventPageProps {
  event: EventData;
  images: string[];
}

export default function EventPage({ event, images }: EventPageProps) {
  const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(event.distances.length - 1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const selectedDistance: EventDistance = event.distances[selectedDistanceIndex];
  const hasMultipleDistances = event.distances.length > 1;
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content container - max width on desktop */}
      <div className="max-w-5xl mx-auto">
        {/* Header with navigation */}
        <Header currentSlug={event.slug} />

        {/* Hero Gallery Section */}
        <section className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh]">
          {images.length > 0 ? (
            <>
              <Image
                src={images[currentImageIndex]}
                alt={`${event.name} - ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/30" />

              {/* Event Title */}
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <h1 className="text-4xl sm:text-6xl font-bold text-white text-center drop-shadow-lg">
                  {event.name}
                </h1>
              </div>

              {/* Gallery Navigation */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-600 text-center">
                {event.name}
              </h1>
            </div>
          )}
        </section>

        {/* Quote Section */}
        <section className="bg-white py-8">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-lg sm:text-xl text-gray-700 text-center italic">
              Ultra riteņbraukšanas pasākumi, kas sniedz iespēju apceļot pasaulē pazīstamas vietas tepat Latvijā.
            </p>
          </div>
        </section>

        {/* Facts Bar + Distance Tabs */}
        <section>
          {/* Facts Bar */}
          <div className="bg-gray-900 text-white py-8">
            <div className="max-w-5xl mx-auto px-4">
              {/* Surface Type - Centered row */}
              <div className="flex justify-center items-center gap-3 mb-6">
                <GravelBikeIcon className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Segums</p>
                  <p className="text-xl font-semibold">{event.surfaceType}</p>
                </div>
              </div>
              {/* Other facts */}
              <div className="flex justify-around items-center flex-wrap gap-6">
                {/* Location */}
                <div className="flex items-center gap-3">
                  <LocationIcon className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Starts</p>
                    {event.location.googleMapsUrl ? (
                      <a
                        href={event.location.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold hover:text-gray-300 transition-colors inline-flex items-center gap-1"
                      >
                        {event.location.name}
                        <ExternalLinkIcon className="w-4 h-4" />
                      </a>
                    ) : (
                      <p className="text-xl font-semibold">{event.location.name}</p>
                    )}
                  </div>
                </div>
                {selectedDistance.facts.map((fact, index) => {
                  const Icon = getIconByName(fact.icon);
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <Icon className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">{fact.label}</p>
                        <p className="text-xl font-semibold">{fact.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Distance Tabs - only show if multiple distances */}
          {hasMultipleDistances && (
            <div className="bg-gray-100 py-6">
              <div className="max-w-5xl mx-auto px-4">
                <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">
                  Izvēlies distanci
                </h3>
                <div className="flex justify-center gap-4">
                  {event.distances.map((distance, index) => {
                    const distanceFact = distance.facts.find(f => f.icon === "route");
                    const distanceValue = distanceFact?.value || "";
                    return (
                      <button
                        key={distance.name}
                        onClick={() => setSelectedDistanceIndex(index)}
                        className={`px-6 py-4 font-semibold transition-all rounded-lg border-2 ${
                          index === selectedDistanceIndex
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="block text-lg">{distance.name}</span>
                        <span className={`block text-sm ${index === selectedDistanceIndex ? "text-gray-300" : "text-gray-500"}`}>
                          {distanceValue}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Route Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Maršruts</h2>
            {selectedDistance.komootEmbedUrl ? (
              <div className="w-full h-225">
                <iframe
                  src={selectedDistance.komootEmbedUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full h-225 bg-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Maršruts drīzumā...</p>
              </div>
            )}
          </div>
        </section>

        {/* Registration Section */}
        <section className="py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Reģistrācija</h2>
            <p className="text-gray-600 mb-8">
              Pievienojies {event.name} un izaicini sevi.
            </p>
            {event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                className="inline-block bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Reģistrēties
              </a>
            ) : (
              <button
                disabled
                className="inline-block bg-gray-300 text-gray-500 px-8 py-4 rounded-lg font-semibold cursor-not-allowed"
              >
                Reģistrācija drīzumā
              </button>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">
                © {new Date().getFullYear()} Pasaules Tūre
              </p>
              <nav className="flex gap-6">
                <Link
                  href="/privatuma-politika"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privātuma politika
                </Link>
                <Link
                  href="/noteikumi"
                  className="text-gray-400 hover:text-white transition-colors"
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
