"use client";

import { useEffect } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";

export interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    id?: string;
    name?: string;
    brand?: string;
    model?: string;
    category?: string;
    imageUrl?: string;
    spec1?: string;
    spec2?: string;
    dailyPrice?: string | number;
    weeklyPrice?: string | number;
    description?: string;
  } | null;
}

export function QuickViewModal({ isOpen, onClose, equipment }: QuickViewModalProps) {
  const { addItem, removeItem, isInCart } = useEnquiryCart();
  const inCart = equipment?.id ? isInCart(equipment.id) : false;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !equipment) return null;

  const formatPrice = (price?: string | number): string => {
    if (!price) return "POA";
    if (typeof price === "string") return price;
    return `$${price.toFixed(2)}`;
  };

  const handleEnquiryClick = () => {
    if (!equipment.id) return;

    const item = {
      id: equipment.id,
      name: equipment.name || equipment.model || "Equipment",
      brand: equipment.brand,
      category: equipment.category,
      imageUrl: equipment.imageUrl,
    };

    if (inCart) {
      removeItem(equipment.id);
    } else {
      addItem(item);
    }
  };

  const placeholderImage = `https://placehold.co/600x400/f3f4f6/64748b?text=${encodeURIComponent(equipment.model || "Equipment")}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 bg-[#f8fafc] p-6 flex items-center justify-center">
            <img
              src={equipment.imageUrl || placeholderImage}
              alt={equipment.name || equipment.model || "Equipment"}
              className="max-w-full max-h-80 object-contain"
            />
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-6 flex flex-col">
            {/* Category Badge */}
            {equipment.category && (
              <span className="inline-block self-start px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 mb-3">
                {equipment.category}
              </span>
            )}

            {/* Brand & Model */}
            <div className="mb-2">
              {equipment.brand && (
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {equipment.brand}
                </span>
              )}
              {equipment.model && (
                <span className="text-sm text-gray-500 ml-2">
                  {equipment.model}
                </span>
              )}
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {equipment.name || equipment.model || "Equipment"}
            </h2>

            {/* Specs */}
            {(equipment.spec1 || equipment.spec2) && (
              <div className="space-y-2 mb-4 text-gray-600">
                {equipment.spec1 && <p>{equipment.spec1}</p>}
                {equipment.spec2 && <p>{equipment.spec2}</p>}
              </div>
            )}

            {/* Description */}
            {equipment.description && (
              <p className="text-gray-600 mb-4 line-clamp-4">
                {equipment.description}
              </p>
            )}

            {/* Pricing */}
            <div className="flex gap-6 py-4 border-t border-b border-gray-200 mb-6">
              <div>
                <span className="text-sm text-gray-500">Daily Rate</span>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(equipment.dailyPrice)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Weekly Rate</span>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(equipment.weeklyPrice)}
                </p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              {equipment.id && (
                <button
                  onClick={handleEnquiryClick}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-lg
                    transition-colors duration-200 border-2
                    ${inCart
                      ? "bg-[#E31937] border-[#E31937] text-white"
                      : "bg-transparent border-[#E31937] text-[#E31937] hover:bg-[#E31937]/10"
                    }
                  `}
                >
                  {inCart ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Added to Enquiry
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add to Enquiry
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 py-3 font-semibold rounded-lg bg-[#E31937] hover:bg-[#C42920] text-white transition-colors"
              >
                Close
              </button>
            </div>

            {/* Contact Info */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Call <a href="tel:134000" className="text-[#E31937] font-semibold hover:underline">13 4000</a> for immediate assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
