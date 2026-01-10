"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EventData, EventDistance, events } from "@/app/data/events";
import { getIconByName, ExternalLinkIcon, LocationIcon, GravelBikeIcon } from "./Icons";
import FAQ from "./FAQ";

interface EventPageProps {
  event: EventData;
  heroImage: string;
}

export default function EventPage({ event, heroImage }: EventPageProps) {
  const allEvents = Object.values(events);
  const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(event.distances.length - 1);

  const selectedDistance: EventDistance = event.distances[selectedDistanceIndex];
  const hasMultipleDistances = event.distances.length > 1;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <Image
          src={heroImage}
          alt={event.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Navigation Buttons */}
        <nav className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 sm:gap-4 z-10 max-w-[90vw]">
          {allEvents.map((e) =>
            e.slug === event.slug ? (
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
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm whitespace-nowrap"
              >
                {e.name}
              </Link>
            )
          )}
        </nav>

        {/* Event Title */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="text-4xl sm:text-6xl font-bold text-white text-center drop-shadow-lg">
            {event.name}
          </h1>
        </div>
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
        <div className="max-w-5xl mx-auto px-4">
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
  );
}
