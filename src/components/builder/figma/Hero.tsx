"use client";

/**
 * Hero Component - Generated from Figma
 *
 * Full-width hero section with background image, heading, and CTAs.
 * Uses CSS variables for multi-brand theming.
 */

export interface FigmaHeroProps {
  /** Background image URL */
  backgroundImage?: string;
  /** Overlay opacity (0-100) */
  overlayOpacity?: number;
  /** Main headline */
  headline?: string;
  /** Subheadline/description */
  subheadline?: string;
  /** Primary CTA text */
  primaryCtaText?: string;
  /** Primary CTA link */
  primaryCtaLink?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaLink?: string;
  /** Minimum height */
  minHeight?: "sm" | "md" | "lg" | "full";
}

export function FigmaHero({
  backgroundImage,
  overlayOpacity = 60,
  headline = "Equipment Hire Across Australia",
  subheadline = "Get competitive quotes from Australia's largest privately-owned equipment fleet.",
  primaryCtaText = "Get a Quote",
  primaryCtaLink = "#quote",
  secondaryCtaText = "Browse Equipment",
  secondaryCtaLink = "#equipment",
  minHeight = "md",
}: FigmaHeroProps) {
  const heightClasses = {
    sm: "min-h-[300px]",
    md: "min-h-[450px]",
    lg: "min-h-[600px]",
    full: "min-h-screen",
  };

  const bgStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,${overlayOpacity / 100}), rgba(0,0,0,${(overlayOpacity + 10) / 100})), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: "var(--color-primary, #0f172a)",
      };

  return (
    <section
      className={`
        relative flex items-center justify-center
        ${heightClasses[minHeight]}
        px-4 py-16
      `}
      style={bgStyle}
    >
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {headline}
        </h1>

        {subheadline && (
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {subheadline}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryCtaText && (
            <a
              href={primaryCtaLink}
              className="
                px-8 py-4
                bg-[var(--color-primary,#0f172a)]
                text-[var(--color-primary-foreground,#f8fafc)]
                rounded-[var(--radius,8px)]
                font-semibold text-lg
                hover:bg-[var(--color-primary-dark,#020617)]
                transition-colors
                border-2 border-white/20
              "
            >
              {primaryCtaText}
            </a>
          )}

          {secondaryCtaText && (
            <a
              href={secondaryCtaLink}
              className="
                px-8 py-4
                bg-white/10 backdrop-blur-sm
                text-white
                rounded-[var(--radius,8px)]
                font-semibold text-lg
                hover:bg-white/20
                transition-colors
                border-2 border-white/20
              "
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
