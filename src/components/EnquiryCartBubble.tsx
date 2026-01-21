"use client";

import { useState, useEffect, useRef } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";
import { EnquiryCartPanel } from "./builder/equipment/EnquiryCartPanel";

/**
 * Floating Enquiry Cart Bubble - Brand Aware
 *
 * Shows in top-right corner with item count badge.
 * Opens the enquiry cart panel when clicked.
 * Animates when items are added.
 * Uses CSS variables from ThemeProvider for brand colors.
 */
export function EnquiryCartBubble() {
  const { itemCount } = useEnquiryCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(itemCount);

  // Animate when item count increases
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  // Don't show if cart is empty
  if (itemCount === 0) return null;

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed top-20 right-4 z-[9999]
          flex items-center gap-3
          pl-5 pr-4 py-3.5
          rounded-full
          shadow-xl shadow-black/20
          transition-all duration-200
          hover:scale-105 hover:shadow-2xl
          active:scale-95
          ${isAnimating ? "animate-bounce-subtle" : ""}
        `}
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        }}
        aria-label={`Enquiry cart with ${itemCount} items`}
      >
        <span className="font-bold text-base whitespace-nowrap">Enquire Now</span>

        {/* Cart Icon */}
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>

          {/* Count Badge */}
          <span
            className={`
              absolute -top-2.5 -right-2.5
              bg-white
              text-sm font-bold
              min-w-[24px] h-6 px-1.5
              rounded-full
              flex items-center justify-center
              shadow-md
              ${isAnimating ? "animate-ping-once" : ""}
            `}
            style={{ color: "var(--color-primary)" }}
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        </div>
      </button>

      {/* Pulse ring animation when items added */}
      {isAnimating && (
        <span
          className="fixed top-20 right-4 z-[9998] w-[160px] h-[56px] rounded-full animate-ping opacity-30 pointer-events-none"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
      )}

      {/* Enquiry Panel */}
      <EnquiryCartPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Custom animation styles */}
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-8px) scale(1.05); }
          50% { transform: translateY(-4px) scale(1.02); }
          75% { transform: translateY(-2px) scale(1.01); }
        }
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-out;
        }
        .animate-ping-once {
          animation: ping-once 0.4s ease-out;
        }
      `}</style>
    </>
  );
}

export default EnquiryCartBubble;
