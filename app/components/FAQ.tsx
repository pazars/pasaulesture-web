"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// Format text with basic markdown-like features: newlines and bullet points
function formatText(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-3 last:mb-0">
          {paragraphLines.join(' ')}
        </p>
      );
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 mb-3 space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Check if line is a bullet point
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      flushParagraph();
      listItems.push(trimmedLine.substring(2));
    }
    // Empty line - paragraph break
    else if (trimmedLine === '') {
      flushList();
      flushParagraph();
    }
    // Regular text line
    else {
      flushList();
      paragraphLines.push(trimmedLine);
    }
  });

  // Flush any remaining content
  flushList();
  flushParagraph();

  return <>{elements}</>;
}

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
  {
    questionKey: "faq_q7",
    answerKey: "faq_a7",
  },
  {
    questionKey: "faq_q8",
    answerKey: "faq_a8",
  },
  {
    questionKey: "faq_q9",
    answerKey: "faq_a9",
  },
  {
    questionKey: "faq_q10",
    answerKey: "faq_a10",
  },
  {
    questionKey: "faq_q11",
    answerKey: "faq_a11",
  },
  {
    questionKey: "faq_q12",
    answerKey: "faq_a12",
  },
  {
    questionKey: "faq_q13",
    answerKey: "faq_a13",
  },
];

function ChevronIcon({ isOpen, isDakar }: { isOpen: boolean; isDakar: boolean }) {
  return (
    <div className={`p-2 rounded-full transition-all duration-300 ${isOpen
        ? isDakar
          ? "bg-dakar-cream rotate-180"
          : "bg-pink rotate-180"
        : "bg-white/10 group-hover:bg-white/20"
      }`}>
      <svg
        className={`w-5 h-5 transition-colors duration-300 ${isOpen
            ? isDakar
              ? "text-dakar-brown"
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
    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${isDakar ? "bg-dakar-cream" : "bg-pink"
      }`}>
      <span className={`font-bold text-lg ${isDakar ? "text-dakar-brown" : "text-blue"}`}>?</span>
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
    <section id="faq" className="py-12 sm:py-20 relative overflow-hidden rounded-3xl mt-2 sm:mt-6 mx-2">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Section header - clean, no badge */}
        <div className="text-center mb-12">
          <h2 className="font-accent text-3xl sm:text-4xl text-beige mb-3">
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
                className={`backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 shadow-lg ${isDakar
                    ? `bg-dakar-brown/80 ${isOpen ? "ring-2 ring-beige/50" : ""}`
                    : `bg-blue/90 ${isOpen ? "ring-2 ring-pink/50" : ""}`
                  }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className={`group w-full px-6 py-5 text-left flex items-center justify-between transition-colors ${isDakar ? "hover:bg-dakar-brown/90" : "hover:bg-blue/95"
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
                  className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2">
                      <div className={`pl-4 sm:pl-12 border-l-4 ${isDakar ? "border-beige/40" : "border-pink/40"
                        }`}>
                        <div className="text-beige/90 leading-relaxed">
                          {formatText(t(item.answerKey as any))}
                        </div>
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
