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

const defaultFaqItems = [
  {
    question: "Lorem ipsum dolor sit amet?",
    answer: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  },
  {
    question: "Ut enim ad minim veniam?",
    answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
  },
  {
    question: "Duis aute irure dolor?",
    answer: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa.",
  },
  {
    question: "Excepteur sint occaecat?",
    answer: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem.",
  },
];

export function LPFaq(props: Partial<LPFaqProps>) {
  const sectionTitle = props.sectionTitle || "Lorem Ipsum Dolor Sit";
  const items = props.items?.length ? props.items : defaultFaqItems;
  const defaultOpenIndex = props.defaultOpenIndex ?? 0;

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
