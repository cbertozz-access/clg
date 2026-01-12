"use client";

interface BenefitItem {
  text: string;
}

export interface LPHeroProps {
  variant?: "standard" | "squeeze" | "product-focused";
  backgroundImage?: string;
  overlayOpacity?: number;
  headline?: string;
  highlightWord?: string;
  subheadline?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  benefits?: BenefitItem[];
  showBadge?: boolean;
  badgeText?: string;
}

export function LPHero({
  variant = "standard",
  backgroundImage,
  overlayOpacity = 60,
  headline = "Equipment Hire Across Australia",
  highlightWord = "Equipment",
  subheadline = "Get competitive quotes from Australia's largest privately-owned equipment fleet. Hire or buy with confidence.",
  primaryCtaText = "Get a Quote",
  primaryCtaLink = "#quote-form",
  secondaryCtaText = "Call 13 4000",
  secondaryCtaLink = "tel:134000",
  benefits = [],
  showBadge = false,
  badgeText = "Fast Response Guaranteed",
}: LPHeroProps) {
  // Replace highlight word in headline
  const formattedHeadline = headline.replace(
    new RegExp(`(${highlightWord})`, "i"),
    '<span class="text-[#E63229]">$1</span>'
  );

  const backgroundStyle = backgroundImage
    ? {
        background: `linear-gradient(to bottom, rgba(26, 26, 26, ${overlayOpacity / 100}) 0%, rgba(26, 26, 26, ${(overlayOpacity + 5) / 100}) 100%), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }
    : { backgroundColor: "#1A1A1A" };

  if (variant === "product-focused") {
    return (
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2"
            dangerouslySetInnerHTML={{ __html: formattedHeadline }}
          />
          <p className="text-[#6B7280] text-lg">{subheadline}</p>
        </div>
      </div>
    );
  }

  if (variant === "squeeze") {
    return (
      <section
        className="min-h-[calc(100vh-120px)] flex items-center py-12"
        style={backgroundStyle}
      >
        <div className="max-w-6xl mx-auto px-4 w-full">
          <div className="text-white">
            {showBadge && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{badgeText}</span>
              </div>
            )}

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
              dangerouslySetInnerHTML={{ __html: formattedHeadline }}
            />

            <p
              className="text-xl text-white/90 mb-8 leading-relaxed max-w-xl"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              {subheadline}
            </p>

            {benefits.length > 0 && (
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-green-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{benefit.text}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="lg:hidden">
              <a
                href={secondaryCtaLink}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {secondaryCtaText}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Standard variant
  return (
    <section className="text-white py-16 md:py-24" style={backgroundStyle}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight whitespace-nowrap"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
              dangerouslySetInnerHTML={{ __html: formattedHeadline }}
            />
            <p
              className="text-xl text-white/90 mb-8"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              {subheadline}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={primaryCtaLink}
                className="bg-[#E63229] hover:bg-[#C42920] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                {primaryCtaText}
              </a>
              <a
                href={secondaryCtaLink}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                {secondaryCtaText}
              </a>
            </div>
          </div>
          <div className="relative hidden md:block">
            {/* Hero image is in background */}
          </div>
        </div>
      </div>
    </section>
  );
}
