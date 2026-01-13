"use client";

import { useState } from "react";

/**
 * Sticky Bottom CTA Bar - Mobile Component
 *
 * Fixed bottom bar for mobile with call and quote buttons.
 * Includes optional product count display.
 */

export interface LPStickyBottomCTAProps {
  /** Phone number to call */
  phoneNumber?: string;
  /** Call button text */
  callText?: string;
  /** Quote button text */
  quoteText?: string;
  /** Quote button link (or triggers modal if onQuoteClick provided) */
  quoteLink?: string;
  /** Product count to display */
  productCount?: number;
  /** Product count label */
  productCountLabel?: string;
  /** Show product count */
  showProductCount?: boolean;
  /** Callback when quote button is clicked */
  onQuoteClick?: () => void;
}

export function LPStickyBottomCTA({
  phoneNumber = "13 4000",
  callText = "Call",
  quoteText = "Get Quote",
  quoteLink = "#quote-form",
  productCount,
  productCountLabel = "products available",
  showProductCount = false,
  onQuoteClick,
}: LPStickyBottomCTAProps) {
  const handleQuoteClick = (e: React.MouseEvent) => {
    if (onQuoteClick) {
      e.preventDefault();
      onQuoteClick();
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {/* Product Count */}
        {showProductCount && productCount !== undefined && (
          <div className="text-sm text-[var(--color-muted-foreground,#6B7280)]">
            <span className="font-semibold text-[var(--color-foreground,#1A1A1A)]">
              {productCount}
            </span>{" "}
            {productCountLabel}
          </div>
        )}

        <div className="flex-1" />

        {/* Call Button */}
        <a
          href={`tel:${phoneNumber.replace(/\s/g, "")}`}
          className="flex items-center justify-center gap-1.5 px-4 py-3 border border-gray-300 rounded-lg text-[var(--color-foreground,#1A1A1A)] font-semibold min-h-[48px] text-sm hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {callText}
        </a>

        {/* Quote Button */}
        <a
          href={quoteLink}
          onClick={handleQuoteClick}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[var(--color-primary,#E63229)] hover:opacity-90 text-white font-semibold rounded-lg min-h-[48px] text-sm transition-opacity"
        >
          {quoteText}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
