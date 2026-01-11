"use client";

/**
 * CategoryHeroCC - Equipment Category Hero Component
 *
 * Created by: CLG-39 (CLG-39)
 * Purpose: AI Platform Comparison Test
 *
 * Naming Convention: "CC" suffix = CLG-39 created
 * Compare with: Builder.io AI version (CLG-38)
 */

interface BenefitItem {
  benefit: string;
}

interface CategoryHeroCCProps {
  // Content
  categoryName: string;
  valueProposition: string;
  benefits: BenefitItem[] | string[];
  trustBadgeText: string;

  // CTAs
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;

  // Styling
  backgroundColor: string;
  backgroundImage?: string;
  overlayOpacity: number;
  primaryButtonColor: string;
}

export function CategoryHeroCC(props: Partial<CategoryHeroCCProps>) {
  // Use defaults for any undefined/null props (Builder.io may pass undefined explicitly)
  const categoryName = props.categoryName || "Equipment Hire";
  const valueProposition = props.valueProposition || "Access Australia's largest fleet of equipment for projects of any size";
  const benefits = props.benefits?.length ? props.benefits : [
    { benefit: "24/7 equipment support" },
    { benefit: "Flexible hire periods" },
    { benefit: "Delivery to any site" },
    { benefit: "Fully maintained fleet" },
  ];
  const trustBadgeText = props.trustBadgeText || "Available across 5 locations Australia-wide";
  const primaryButtonText = props.primaryButtonText || "Get a Quote";
  const primaryButtonLink = props.primaryButtonLink || "/quote";
  const secondaryButtonText = props.secondaryButtonText || "Browse Equipment";
  const secondaryButtonLink = props.secondaryButtonLink || "#equipment-grid";
  const backgroundColor = props.backgroundColor || "#1F2937";
  const backgroundImage = props.backgroundImage;
  const overlayOpacity = props.overlayOpacity ?? 60;
  const primaryButtonColor = props.primaryButtonColor || "#F97316";
  return (
    <section
      className="relative w-full py-12 lg:py-20"
      style={{ backgroundColor }}
    >
      {/* Background Image with Overlay */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />
        </>
      )}

      {/* Content Container */}
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">

          {/* Left Column - Content */}
          <div className="lg:col-span-3 text-center lg:text-left">
            <h1 className="text-white text-4xl lg:text-5xl font-bold mb-4">
              {categoryName}
            </h1>

            <p className="text-white text-lg lg:text-xl mb-6 max-w-lg mx-auto lg:mx-0">
              {valueProposition}
            </p>

            {/* Benefits List */}
            <ul className="space-y-3 mb-6">
              {benefits.map((item, index) => {
                // Handle both string[] and BenefitItem[] formats
                const benefitText = typeof item === "string" ? item : item.benefit;
                return (
                  <li
                    key={index}
                    className="flex items-center justify-center lg:justify-start text-white text-base"
                  >
                    <CheckIcon className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    {benefitText}
                  </li>
                );
              })}
            </ul>

            {/* Trust Badge */}
            <p className="text-gray-300 text-sm italic mt-6">
              {trustBadgeText}
            </p>
          </div>

          {/* Right Column - CTAs */}
          <div className="lg:col-span-2 flex flex-col gap-4 justify-center">
            <a
              href={primaryButtonLink}
              className="w-full py-4 px-8 rounded-lg font-bold text-lg text-white text-center transition hover:opacity-90"
              style={{ backgroundColor: primaryButtonColor }}
            >
              {primaryButtonText}
            </a>

            <a
              href={secondaryButtonLink}
              className="w-full py-4 px-8 rounded-lg font-bold text-lg text-white text-center border-2 border-white bg-transparent transition hover:bg-white/10"
            >
              {secondaryButtonText}
            </a>
          </div>

        </div>
      </div>

      {/* Component Attribution (visible in dev) */}
      <div className="absolute bottom-2 right-2 text-xs text-white/30">
        CategoryHeroCC - CLG-39
      </div>
    </section>
  );
}

// Simple Check Icon component
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default CategoryHeroCC;
