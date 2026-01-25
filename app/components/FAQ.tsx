"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface FAQItem {
  questionKey: string;
  answerKey: string;
}

const faqItems: FAQItem[] = [
  {
    questionKey: "faq_q1",
    answerKey: "faq_a1",
  },
  {
    questionKey: "faq_q2",
    answerKey: "faq_a2",
  },
  {
    questionKey: "faq_q3",
    answerKey: "faq_a3",
  },
  {
    questionKey: "faq_q4",
    answerKey: "faq_a4",
  },
  {
    questionKey: "faq_q5",
    answerKey: "faq_a5",
  },
  {
    questionKey: "faq_q6",
    answerKey: "faq_a6",
  },
];

function ChevronIcon({ isOpen, isDakar }: { isOpen: boolean; isDakar: boolean }) {
  return (
    <div className={`p-2 rounded-full transition-all duration-300 ${
      isOpen
        ? isDakar
          ? "bg-beige rotate-180"
          : "bg-pink rotate-180"
        : "bg-white/10 group-hover:bg-white/20"
    }`}>
      <svg
        className={`w-5 h-5 transition-colors duration-300 ${
          isOpen
            ? isDakar
              ? "text-bronze"
              : "text-blue"
            : "text-beige"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

function QuestionIcon({ isDakar }: { isDakar: boolean }) {
  return (
    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${
      isDakar ? "bg-beige" : "bg-pink"
    }`}>
      <span className={`font-bold text-lg ${isDakar ? "text-bronze" : "text-blue"}`}>?</span>
    </div>
  );
}

interface FAQProps {
  isDakar?: boolean;
}

export default function FAQ({ isDakar = false }: FAQProps) {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 relative overflow-hidden rounded-3xl mt-6 mx-2">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Section header - clean, no badge */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl text-beige mb-3">
            {t("faq_heading")}
          </h2>
          <div className="section-divider w-24 mx-auto" />
        </div>

        {/* FAQ Items - opaque boxes for readability */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 shadow-lg ${
                  isDakar
                    ? `bg-bronze/80 ${isOpen ? "ring-2 ring-beige/50" : ""}`
                    : `bg-blue/90 ${isOpen ? "ring-2 ring-pink/50" : ""}`
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className={`group w-full px-6 py-5 text-left flex items-center justify-between transition-colors ${
                    isDakar ? "hover:bg-bronze/90" : "hover:bg-blue/95"
                  }`}
                >
                  <div className="flex items-center">
                    <QuestionIcon isDakar={isDakar} />
                    <span className="font-bold text-beige text-lg pr-4">
                      {t(item.questionKey as any)}
                    </span>
                  </div>
                  <ChevronIcon isOpen={isOpen} isDakar={isDakar} />
                </button>

                {/* Animated answer panel */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2">
                      <div className={`pl-12 border-l-4 ${
                        isDakar ? "border-beige/40" : "border-pink/40"
                      }`}>
                        <p className="text-beige/90 leading-relaxed">{t(item.answerKey as any)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
