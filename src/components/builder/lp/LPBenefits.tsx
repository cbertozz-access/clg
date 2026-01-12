"use client";

import type { ReactNode } from "react";

interface BenefitCard {
  icon?: string;
  title: string;
  description: string;
}

export interface LPBenefitsProps {
  sectionTitle?: string;
  benefits?: BenefitCard[];
  columns?: 2 | 3 | 4;
}

// Default SVG icons
const defaultIcons: Record<string, ReactNode> = {
  shield: (
    <svg className="w-8 h-8 text-[#E63229]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  clock: (
    <svg className="w-8 h-8 text-[#E63229]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  location: (
    <svg className="w-8 h-8 text-[#E63229]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  badge: (
    <svg className="w-8 h-8 text-[#E63229]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
};

const defaultBenefits = [
  { icon: "shield", title: "Safety Certified", description: "All equipment meets strict Australian safety standards and is regularly maintained." },
  { icon: "clock", title: "24/7 Support", description: "Round-the-clock assistance whenever you need it, wherever you are." },
  { icon: "location", title: "Australia Wide", description: "Delivery and pickup across all states from our 20+ branch locations." },
  { icon: "badge", title: "25+ Years Experience", description: "Industry expertise you can trust since 1985." },
];

export function LPBenefits(props: Partial<LPBenefitsProps>) {
  const sectionTitle = props.sectionTitle || "Why Choose Access Hire?";
  const benefits = props.benefits?.length ? props.benefits : defaultBenefits;
  const columns = props.columns || 4;
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-[#1A1A1A] text-center mb-12">
          {sectionTitle}
        </h2>
        <div className={`grid ${gridCols[columns]} gap-8`}>
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-[#E63229]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {benefit.icon && defaultIcons[benefit.icon]
                  ? defaultIcons[benefit.icon]
                  : defaultIcons.shield}
              </div>
              <h3 className="font-bold text-[#1A1A1A] mb-2">{benefit.title}</h3>
              <p className="text-[#6B7280] text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
