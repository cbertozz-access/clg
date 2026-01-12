"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

export interface LPFaqProps {
  sectionTitle?: string;
  items?: FaqItem[];
  defaultOpenIndex?: number;
}

export function LPFaq({
  sectionTitle = "Frequently Asked Questions",
  items = [
    {
      question: "What areas do you service?",
      answer: "We service all of Australia with branches in WA, NT, SA, NSW, VIC, and QLD. Our extensive network ensures we can deliver equipment to most locations across the country.",
    },
    {
      question: "What are your hire rates?",
      answer: "Our rates vary depending on the equipment type, hire duration, and location. Contact us for a competitive quote tailored to your specific needs.",
    },
    {
      question: "Do you offer delivery and pickup?",
      answer: "Yes, we offer delivery and pickup services across all states. Same-day delivery is available in metro areas for urgent requirements.",
    },
    {
      question: "What certifications do your operators need?",
      answer: "Operators require relevant licenses for the equipment being used. We can advise on specific requirements and provide operator training if needed.",
    },
  ],
  defaultOpenIndex = 0,
}: LPFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        {sectionTitle && (
          <h2 className="text-3xl font-bold text-[#1A1A1A] text-center mb-12">
            {sectionTitle}
          </h2>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-semibold text-[#1A1A1A] hover:bg-[#F3F4F6] transition-colors rounded-lg"
              >
                <span>{item.question}</span>
                <svg
                  className={`w-5 h-5 text-[#6B7280] transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-[#6B7280]">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
