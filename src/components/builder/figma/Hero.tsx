"use client";

import { useEffect, useState } from "react";
import {
  buildPersonalizationContext,
  getUrlParams,
  categoryLabels,
  type PersonalizationContext,
  type FirebaseUserData,
} from "@/lib/personalization";

/**
 * Hero Component - Figma Design System
 *
 * Full-width hero with dynamic personalization support.
 * Uses text shadows instead of heavy overlay for image visibility.
 * Supports Firebase UID and URL param personalization.
 */

// Component-level design tokens
const heroTokens = {
  // Text shadows for readability without heavy overlay
  textShadow: {
    headline: "0 2px 8px rgba(0,0,0,0.6)",
    subheadline: "0 1px 4px rgba(0,0,0,0.5)",
    greeting: "0 2px 4px rgba(0,0,0,0.5)",
  },
  // Overlay gradients (lighter to show image)
  overlay: {
    light: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)",
    medium: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
    dark: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)",
  },
  // Button sizes
  button: {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  },
  // Height presets
  height: {
    sm: "min-h-[300px]",
    md: "min-h-[450px]",
    lg: "min-h-[550px]",
    full: "min-h-screen",
  },
};

export interface FigmaHeroProps {
  /** Background image URL */
  backgroundImage?: string;
  /** Overlay intensity */
  overlayIntensity?: "light" | "medium" | "dark" | "none";
  /** Main headline (supports {{category}} and {{geo}} placeholders) */
  headline?: string;
  /** Subheadline/description */
  subheadline?: string;
  /** Category keyword to highlight in headline */
  highlightCategory?: boolean;
  /** Primary CTA text */
  primaryCtaText?: string;
  /** Primary CTA link */
  primaryCtaLink?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaLink?: string;
  /** Button size */
  buttonSize?: "sm" | "md" | "lg";
  /** Minimum height */
  minHeight?: "sm" | "md" | "lg" | "full";
  /** Show personalized greeting */
  showGreeting?: boolean;
  /** Enable dynamic personalization from URL params */
  enablePersonalization?: boolean;
  /** Firebase user data for personalization */
  firebaseUser?: FirebaseUserData;
  /** Text alignment */
  textAlign?: "left" | "center";
  /** Content max width */
  contentMaxWidth?: "sm" | "md" | "lg" | "xl";
}

export function FigmaHero({
  backgroundImage,
  overlayIntensity = "light",
  headline,
  subheadline,
  highlightCategory = true,
  primaryCtaText = "Get a Quote",
  primaryCtaLink = "#quote",
  secondaryCtaText,
  secondaryCtaLink,
  buttonSize = "md",
  minHeight = "md",
  showGreeting = true,
  enablePersonalization = true,
  firebaseUser,
  textAlign = "left",
  contentMaxWidth = "lg",
}: FigmaHeroProps) {
  const [context, setContext] = useState<PersonalizationContext | null>(null);

  // Initialize personalization on client
  useEffect(() => {
    if (enablePersonalization) {
      const urlParams = getUrlParams();
      const ctx = buildPersonalizationContext({
        urlParams,
        firebaseUser,
        overrides: {
          headline,
          subheadline,
        },
      });
      setContext(ctx);
    } else {
      // No personalization - use props directly
      setContext({
        category: "default",
        categoryLabel: "Equipment",
        headline: headline || "Equipment Hire Across Australia",
        subheadline: subheadline || "Get competitive quotes from Australia's largest privately-owned equipment fleet.",
      });
    }
  }, [enablePersonalization, firebaseUser, headline, subheadline]);

  // Render headline with category highlighting
  const renderHeadline = () => {
    if (!context) return null;

    const text = context.headline;

    if (highlightCategory && context.category !== "default") {
      const categoryWord = categoryLabels[context.category]?.replace(/s$/, "") || context.category;
      const parts = text.split(new RegExp(`(${categoryWord})`, "i"));

      return parts.map((part, i) =>
        part.toLowerCase() === categoryWord.toLowerCase() ? (
          <span key={i} className="text-[var(--color-primary,#E63229)]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    }

    return text;
  };

  // Background styles
  const bgStyle = backgroundImage
    ? {
        backgroundImage:
          overlayIntensity === "none"
            ? `url(${backgroundImage})`
            : `${heroTokens.overlay[overlayIntensity]}, url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: "var(--color-primary, #1A1A1A)",
      };

  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-3xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
  };

  return (
    <section
      className={`relative flex items-center ${heroTokens.height[minHeight]} px-4 py-16`}
      style={bgStyle}
    >
      <div className={`w-full ${maxWidthClasses[contentMaxWidth]} ${textAlign === "center" ? "mx-auto" : ""}`}>
        <div className={`flex flex-col ${alignClasses[textAlign]}`}>
          {/* Personalized Greeting */}
          {showGreeting && context?.greeting && (
            <p
              className="text-xl md:text-2xl text-white mb-3 font-medium"
              style={{ textShadow: heroTokens.textShadow.greeting }}
            >
              {context.greeting}
            </p>
          )}

          {/* Headline */}
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ textShadow: heroTokens.textShadow.headline }}
          >
            {renderHeadline()}
          </h1>

          {/* Subheadline */}
          {context?.subheadline && (
            <p
              className="text-base md:text-lg text-white/90 mb-6 max-w-2xl"
              style={{ textShadow: heroTokens.textShadow.subheadline }}
            >
              {context.subheadline}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            {primaryCtaText && (
              <a
                href={primaryCtaLink}
                className={`
                  ${heroTokens.button[buttonSize]}
                  bg-[var(--color-primary,#E63229)]
                  hover:bg-[var(--color-primary-hover,#C42920)]
                  text-white
                  rounded-lg
                  font-semibold
                  transition-colors
                  inline-flex items-center gap-2
                `}
              >
                {primaryCtaText}
              </a>
            )}

            {secondaryCtaText && secondaryCtaLink && (
              <a
                href={secondaryCtaLink}
                className={`
                  ${heroTokens.button[buttonSize]}
                  bg-white/10 backdrop-blur-sm
                  hover:bg-white/20
                  text-white
                  rounded-lg
                  font-semibold
                  transition-colors
                  border border-white/20
                  inline-flex items-center gap-2
                `}
              >
                {secondaryCtaText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
