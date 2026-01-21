"use client";

/**
 * QuickViewModal - Brand Aware
 *
 * Equipment detail modal that uses CSS variables from ThemeProvider
 * for colors to automatically adapt to the selected brand.
 */

import { useEffect, useState } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";

export interface QuickViewEquipment {
  id?: string;
  name?: string;
  brand?: string;
  model?: string;
  category?: string;
  subcategory?: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  // Specs
  workingHeight?: string;
  platformHeight?: string;
  capacity?: string;
  reach?: string;
  weight?: string;
  dimensions?: string;
  powerSource?: string;
  environment?: string;
  // Pricing
  dailyPrice?: string | number;
  weeklyPrice?: string | number;
  monthlyPrice?: string | number;
  // Legacy spec fields for backwards compatibility
  spec1?: string;
  spec2?: string;
}

export interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: QuickViewEquipment | null;
}

export function QuickViewModal({ isOpen, onClose, equipment }: QuickViewModalProps) {
  const { addItem, removeItem, isInCart } = useEnquiryCart();
  const inCart = equipment?.id ? isInCart(equipment.id) : false;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when equipment changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [equipment?.id]);

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
    return `$${price.toFixed(0)}`;
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

  // Build images array
  const images = equipment.images?.length
    ? equipment.images
    : equipment.imageUrl
      ? [equipment.imageUrl]
      : [];

  const placeholderImage = `https://placehold.co/600x400/f3f4f6/64748b?text=${encodeURIComponent(equipment.model || "Equipment")}`;
  const currentImage = images[currentImageIndex] || placeholderImage;

  // Build specs array from available data
  const specs: { label: string; value: string }[] = [];

  if (equipment.workingHeight) specs.push({ label: "Working Height", value: equipment.workingHeight });
  if (equipment.platformHeight) specs.push({ label: "Platform Height", value: equipment.platformHeight });
  if (equipment.capacity) specs.push({ label: "Capacity", value: equipment.capacity });
  if (equipment.reach) specs.push({ label: "Horizontal Reach", value: equipment.reach });
  if (equipment.weight) specs.push({ label: "Weight", value: equipment.weight });
  if (equipment.dimensions) specs.push({ label: "Dimensions", value: equipment.dimensions });

  // Fallback to legacy spec fields
  if (specs.length === 0) {
    if (equipment.spec1) specs.push({ label: "Specification", value: equipment.spec1 });
    if (equipment.spec2) specs.push({ label: "Specification", value: equipment.spec2 });
  }

  // Power source display
  const powerSourceLabels: Record<string, string> = {
    electric: "Electric",
    diesel: "Diesel",
    gas: "Gas/LPG",
    hybrid: "Hybrid",
    petrol: "Petrol",
  };

  // Environment display
  const environmentLabels: Record<string, string> = {
    indoor: "Indoor Use",
    outdoor: "Outdoor Use",
    both: "Indoor/Outdoor",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
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
          <div className="md:w-1/2 bg-white p-6">
            {/* Main Image */}
            <div className="relative aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden mb-3">
              <img
                src={currentImage}
                alt={equipment.name || equipment.model || "Equipment"}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
                    style={{
                      borderColor: index === currentImageIndex
                        ? "var(--color-primary)"
                        : "#e5e7eb",
                    }}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Power & Environment Badges */}
            {(equipment.powerSource || equipment.environment) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {equipment.powerSource && powerSourceLabels[equipment.powerSource] && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {powerSourceLabels[equipment.powerSource]}
                  </span>
                )}
                {equipment.environment && environmentLabels[equipment.environment] && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {environmentLabels[equipment.environment]}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-6 flex flex-col">
            {/* Category & Subcategory */}
            <div className="flex flex-wrap gap-2 mb-3">
              {equipment.category && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {equipment.category}
                </span>
              )}
              {equipment.subcategory && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  {equipment.subcategory}
                </span>
              )}
            </div>

            {/* Brand & Model */}
            <div className="mb-2">
              {equipment.brand && (
                <span
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-primary)" }}
                >
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

            {/* Description */}
            {equipment.description && (
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {equipment.description}
              </p>
            )}

            {/* Specifications Grid */}
            {specs.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {specs.map((spec, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-500 block">{spec.label}</span>
                      <span className="font-semibold text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Hire Rates
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Daily</span>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(equipment.dailyPrice)}
                  </p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <span className="text-xs text-gray-500 block">Weekly</span>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(equipment.weeklyPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Monthly</span>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(equipment.monthlyPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              {equipment.id && (
                <button
                  onClick={handleEnquiryClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-lg transition-colors duration-200 border-2"
                  style={{
                    backgroundColor: inCart ? "var(--color-primary)" : "transparent",
                    borderColor: "var(--color-primary)",
                    color: inCart ? "var(--color-primary-foreground)" : "var(--color-primary)",
                  }}
                >
                  {inCart ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Added
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

              <a
                href={`tel:134000`}
                className="flex-1 py-3 font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call 13 4000
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
