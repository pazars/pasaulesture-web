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
    <svg
      className={`w-5 h-5 transition-transform duration-200 ${
        isOpen ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Biežāk uzdotie jautājumi
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">
                  {item.question}
                </span>
                <ChevronIcon isOpen={openIndex === index} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-4 text-gray-600">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
