"use client";

import { useState } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";
import { EnquiryCartPanel } from "./builder/equipment/EnquiryCartPanel";

/**
 * Floating Enquiry Cart Bubble
 *
 * Shows in top-right corner with item count badge.
 * Opens the enquiry cart panel when clicked.
 */
export function EnquiryCartBubble() {
  const { itemCount } = useEnquiryCart();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show if cart is empty
  if (itemCount === 0) return null;

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40 flex items-center gap-2 bg-[#E31937] hover:bg-[#C42920] text-white pl-4 pr-3 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        aria-label={`Enquiry cart with ${itemCount} items`}
      >
        <span className="font-semibold text-sm whitespace-nowrap">Enquire Now</span>

        {/* Cart Icon */}
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>

          {/* Count Badge */}
          <span className="absolute -top-2 -right-2 bg-white text-[#E31937] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        </div>
      </button>

      {/* Enquiry Panel */}
      <EnquiryCartPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default EnquiryCartBubble;
