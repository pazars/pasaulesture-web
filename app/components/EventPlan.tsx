"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { PlanItem } from "@/app/data/events";
import { formatText } from "@/app/lib/formatText";

interface EventPlanProps {
  items: PlanItem[];
  isDakar?: boolean;
}

// True when this prose item opens a new chapter (or the article itself).
// Used to decide whether to apply the drop cap.
function isOpeningProse(items: PlanItem[], idx: number): boolean {
  if (items[idx].kind !== "prose") return false;
  for (let i = idx - 1; i >= 0; i--) {
    const prev = items[i];
    if (prev.kind === "chapter") return true;
    if (prev.kind === "prose") return false;
    // skip over image / break — they don't reset the drop-cap rule
  }
  return true;
}

export default function EventPlan({ items, isDakar = false }: EventPlanProps) {
  const t = useTranslations();

  return (
    <section id="event-plan" className="relative py-16 sm:py-24 mx-2 rounded-3xl overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="font-accent text-4xl sm:text-5xl text-beige mb-4">
            {t("section_event_plan")}
          </h2>
          <div className="section-divider w-24 mx-auto" />
        </div>

        <article className="max-w-2xl mx-auto">
          {items.map((item, index) => {
            if (item.kind === "chapter") {
              const isFirst = index === 0;
              return (
                <header
                  key={index}
                  className={`${isFirst ? "" : "mt-16 sm:mt-24"} mb-7 sm:mb-9`}
                >
                  <h3
                    className={`font-accent text-3xl sm:text-4xl font-bold leading-tight ${
                      isDakar ? "text-dakar-yellow" : "text-pink"
                    }`}
                  >
                    {t(item.titleKey as any)}
                  </h3>
                </header>
              );
            }

            if (item.kind === "break") {
              return (
                <div
                  key={index}
                  className="my-12 sm:my-16 text-center select-none"
                  aria-hidden="true"
                >
                  <span
                    className={`font-display text-3xl tracking-[0.6em] inline-block ${
                      isDakar ? "text-dakar-yellow/40" : "text-pink/40"
                    }`}
                  >
                    · · ·
                  </span>
                </div>
              );
            }

            if (item.kind === "image") {
              if (item.variant === "paper") {
                return (
                  <figure key={index} className="my-12 sm:my-14">
                    <div
                      className={`rounded-md p-3 sm:p-4 shadow-md ${
                        isDakar ? "bg-dakar-cream/15" : "bg-beige/10"
                      }`}
                    >
                      <Image
                        src={item.src}
                        alt={item.captionKey ? t(item.captionKey as any) : ""}
                        width={item.width ?? 1200}
                        height={item.height ?? 800}
                        className="w-full h-auto rounded-sm"
                        sizes="(max-width: 768px) calc(100vw - 4rem), 640px"
                      />
                    </div>
                    {item.captionKey && (
                      <figcaption className="text-beige/55 text-center font-accent italic text-sm mt-3 tracking-wide">
                        {t(item.captionKey as any)}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              if (item.variant === "postcard") {
                return (
                  <figure key={index} className="my-12 sm:my-14 flex justify-center">
                    <div className="relative w-full max-w-md">
                      <div className="bg-white p-3 pb-12 sm:p-4 sm:pb-14 shadow-2xl rotate-[-2.5deg] hover:rotate-0 hover:scale-[1.02] transition-transform duration-500 ease-out">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={item.src}
                            alt={item.captionKey ? t(item.captionKey as any) : ""}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                        </div>
                        {item.captionKey && (
                          <figcaption className="absolute bottom-3 sm:bottom-4 left-0 right-0 text-center font-display text-blue/80 text-base sm:text-lg italic px-3">
                            {t(item.captionKey as any)}
                          </figcaption>
                        )}
                      </div>
                    </div>
                  </figure>
                );
              }
              return (
                <figure key={index} className="my-12 sm:my-16">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-white/5 shadow-xl">
                    <Image
                      src={item.src}
                      alt={item.captionKey ? t(item.captionKey as any) : ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                  </div>
                  {item.captionKey && (
                    <figcaption className="text-beige/55 text-center font-accent italic text-sm mt-3 tracking-wide">
                      {t(item.captionKey as any)}
                    </figcaption>
                  )}
                </figure>
              );
            }

            // prose
            const showDropCap = isOpeningProse(items, index);
            return (
              <div key={index} className="mb-7 sm:mb-9">
                {item.leadKey && (
                  <p
                    className={`font-accent italic text-base sm:text-lg mb-2 tracking-wide ${
                      isDakar ? "text-dakar-yellow/85" : "text-pink/85"
                    }`}
                  >
                    {t(item.leadKey as any)}
                  </p>
                )}
                <div
                  className={`text-beige/90 text-base sm:text-lg leading-[1.85] sm:leading-[1.9] ${
                    showDropCap ? "plan-drop-cap" : ""
                  }`}
                >
                  {formatText(t(item.bodyKey as any))}
                </div>
              </div>
            );
          })}
        </article>
      </div>
    </section>
  );
}
