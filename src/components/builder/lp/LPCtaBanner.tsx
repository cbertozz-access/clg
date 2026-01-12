"use client";

export interface LPCtaBannerProps {
  headline?: string;
  subtext?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export function LPCtaBanner(props: Partial<LPCtaBannerProps>) {
  const headline = props.headline || "Lorem Ipsum Dolor Sit?";
  const subtext = props.subtext || "Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.";
  const primaryCtaText = props.primaryCtaText || "Lorem Ipsum";
  const primaryCtaLink = props.primaryCtaLink || "#quote-form";
  const secondaryCtaText = props.secondaryCtaText || "Dolor Sit";
  const secondaryCtaLink = props.secondaryCtaLink || "tel:134000";
  return (
    <section className="bg-[#E63229] py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {headline}
        </h2>
        <p className="text-white/90 mb-6">{subtext}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={primaryCtaLink}
            className="bg-white text-[#E63229] hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {primaryCtaText}
          </a>
          <a
            href={secondaryCtaLink}
            className="bg-[#C42920] hover:bg-[#1A1A1A] text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-white/30"
          >
            {secondaryCtaText}
          </a>
        </div>
      </div>
    </section>
  );
}
