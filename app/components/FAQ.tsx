"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CONTACT_INFO } from "@/app/data/contact";

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

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? "bg-pink rotate-180" : "bg-white/10 group-hover:bg-white/20"}`}>
      <svg
        className={`w-5 h-5 transition-colors duration-300 ${isOpen ? "text-blue" : "text-beige"}`}
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

function QuestionIcon() {
  return (
    <div className="flex-shrink-0 w-8 h-8 bg-pink rounded-lg flex items-center justify-center mr-4">
      <span className="text-blue font-bold text-lg">?</span>
    </div>
  );
}

export default function FAQ() {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 section-cream relative overflow-hidden rounded-3xl mt-6 mx-2">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-pink/20 text-pink px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("faq_badge")}
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-beige mb-3">
            {t("faq_heading")}
          </h2>
          <div className="section-divider w-24 mx-auto" />
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white/8 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? "ring-2 ring-pink/50" : ""
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="group w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center">
                    <QuestionIcon />
                    <span className="font-bold text-beige text-lg pr-4">
                      {t(item.questionKey as any)}
                    </span>
                  </div>
                  <ChevronIcon isOpen={isOpen} />
                </button>

                {/* Animated answer panel */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2">
                      <div className="pl-12 border-l-4 border-pink/40">
                        <p className="text-beige/80 leading-relaxed">{t(item.answerKey as any)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact prompt */}
        <div className="mt-12 text-center">
          <p className="text-beige/70 mb-4">{t("faq_contact_prompt")}</p>
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="inline-flex items-center gap-2 bg-pink text-blue font-bold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-pink/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t("faq_contact_button")}
          </a>
        </div>
      </div>
    </section>
  );
}
