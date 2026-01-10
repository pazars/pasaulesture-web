"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EventData, EventDistance, events } from "@/app/data/events";
import { getIconByName, ExternalLinkIcon, LocationIcon } from "./Icons";
import FAQ from "./FAQ";

interface EventPageProps {
  event: EventData;
  heroImage: string;
}

export default function EventPage({ event, heroImage }: EventPageProps) {
  const allEvents = Object.values(events);
  const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(0);

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
        <nav className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
          {allEvents.map((e) => (
            <Link
              key={e.slug}
              href={`/${e.slug}`}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                e.slug === event.slug
                  ? "bg-white text-black"
                  : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              }`}
            >
              {e.name}
            </Link>
          ))}
        </nav>

        {/* Event Title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            {event.name}
          </h1>
        </div>
      </section>

      {/* Facts Bar + Distance Tabs */}
      <section>
        {/* Facts Bar */}
        <div className="bg-gray-900 text-white py-8">
          <div className="max-w-5xl mx-auto px-4">
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
          <div className="bg-gray-100">
            <div className="max-w-5xl mx-auto px-4 flex justify-center">
              {event.distances.map((distance, index) => (
                <button
                  key={distance.name}
                  onClick={() => setSelectedDistanceIndex(index)}
                  className={`px-8 py-3 font-semibold transition-all rounded-b-lg ${
                    index === selectedDistanceIndex
                      ? "bg-gray-900 text-white"
                      : "bg-gray-400 text-gray-700 hover:bg-gray-500"
                  }`}
                >
                  {distance.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Route Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Maršruts</h2>
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
          <h2 className="text-3xl font-bold mb-4">Reģistrācija</h2>
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
