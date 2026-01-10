"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Kas ir Pasaules Tūre?",
    answer:
      "Pasaules Tūre ir ultra riteņbraukšanas pasākumu sērija Latvijā, kas sniedz iespēju apceļot pasaulē pazīstamas vietas tepat Latvijā.",
  },
  {
    question: "Vai man ir nepieciešams speciāls velosipēds?",
    answer:
      "Ieteicams ir Gravel vai MTB tipa velosipēds.",
  },
  {
    question: "Kā es varu reģistrēties?",
    answer:
      "Reģistrācija notiek tiešsaistē, noklikšķinot uz 'Reģistrēties' pogas pasākuma lapā. Pēc maksājuma saņemšanas jūs saņemsiet apstiprinājuma e-pastu.",
  },
  {
    question: "Vai ir laika limits?",
    answer:
      "Jā, katrai distancei ir noteikts laika limits. Precīzu informāciju par laika limitu varat atrast pasākuma faktu joslā.",
  },
  {
    question: "Kas notiek, ja es nepaspēju laika limitā?",
    answer:
      "Ja neiekļaujaties laika limitā, jūs varat turpināt maršrutu un tiksiet ieskaitīts pie finišētājiem. Vienīgi finiša zīmodziņu būs jānoorganizē atsevišķi pēc sacensībām.",
  },
  {
    question: "Vai ir atbalsta punkti maršrutā?",
    answer:
      "Jā, maršrutā ir izvietoti atbalsta punkti ar ūdeni un uzkodām. Precīza informācija tiks nosūtīta dalībniekiem pirms pasākuma.",
  },
];

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? "bg-amber rotate-180" : "bg-forest-medium/20 group-hover:bg-forest-medium/40"}`}>
      <svg
        className={`w-5 h-5 transition-colors duration-300 ${isOpen ? "text-white" : "text-forest-deep"}`}
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
    <div className="flex-shrink-0 w-8 h-8 bg-forest-deep rounded-lg flex items-center justify-center mr-4">
      <span className="text-amber font-bold text-lg">?</span>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-cream relative overflow-hidden rounded-3xl mt-6 mx-2">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-forest-light/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber/10 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-forest-deep/10 text-forest-deep px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Palīdzība
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-forest-deep mb-3">
            Biežāk uzdotie jautājumi
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
                className={`card-elevated overflow-hidden transition-all duration-300 ${
                  isOpen ? "ring-2 ring-amber/50" : ""
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="group w-full px-6 py-5 text-left flex items-center justify-between hover:bg-cream/50 transition-colors"
                >
                  <div className="flex items-center">
                    <QuestionIcon />
                    <span className="font-bold text-earth-dark text-lg pr-4">
                      {item.question}
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
                      <div className="pl-12 border-l-4 border-amber/40">
                        <p className="text-stone leading-relaxed">{item.answer}</p>
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
          <p className="text-stone mb-4">Neatradi atbildi uz savu jautājumu?</p>
          <a
            href="mailto:info@pasaulestūre.lv"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Sazinies ar mums
          </a>
        </div>
      </div>
    </section>
  );
}
