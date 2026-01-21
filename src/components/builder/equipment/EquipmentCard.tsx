"use client";

import { useEffect, useState } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";

/**
 * Equipment Card Component
 *
 * Displays a single equipment item with image, specs, pricing, and CTA.
 * Uses CSS variables for multi-brand theming.
 *
 * Can be used in two modes:
 * 1. Pass all props directly (existing behavior)
 * 2. Pass just `productId` to auto-fetch from the API
 */

interface Product {
  productId: string;
  model: string;
  description?: string;
  brand?: string;
  category: string;
  subCategory?: string;
  heroLabel?: string;
  productImages?: Array<{
    imageUrl: string;
    imageThumbUrl?: string;
    imageAltText?: string;
  }>;
  operationalSpecification?: {
    horizontalReachFt?: string;
    horizontalReachM?: number;
    platformHeightFt?: string;
    platformHeightM?: number;
    workingHeightFt?: string;
    workingHeightM?: number;
    capacityKg?: number;
    capacityT?: number;
  };
  pricing?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
}

export interface EquipmentCardProps {
  /** Product ID to fetch from API (alternative to passing all props) */
  productId?: string;
  /** API endpoint URL (used with productId) */
  apiEndpoint?: string;
  /** Equipment ID */
  id?: string;
  /** Product image URL */
  imageUrl?: string;
  /** Equipment brand */
  brand?: string;
  /** Model number */
  model?: string;
  /** Display name/title */
  name?: string;
  /** Equipment category */
  category?: string;
  /** Primary spec line */
  spec1?: string;
  /** Secondary spec line */
  spec2?: string;
  /** Daily rental price */
  dailyPrice?: string | number;
  /** Weekly rental price */
  weeklyPrice?: string | number;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaLink?: string;
  /** Card variant */
  variant?: "default" | "compact" | "featured";
  /** Show pricing */
  showPricing?: boolean;
  /** Show specs */
  showSpecs?: boolean;
  /** Show add to enquiry button */
  showEnquiryButton?: boolean;
  /** Callback when equipment is added to enquiry */
  onAddToEnquiry?: (item: { id: string; name: string; brand?: string; category?: string; imageUrl?: string }) => void;
  /** Callback for quick view - when provided, View Details becomes a button instead of link */
  onQuickView?: (equipment: EquipmentCardProps) => void;
}

export function EquipmentCard({
  productId,
  apiEndpoint = "https://acccessproducts.netlify.app/api/products",
  id: idProp,
  imageUrl: imageUrlProp,
  brand: brandProp,
  model: modelProp,
  name: nameProp,
  category: categoryProp,
  spec1: spec1Prop,
  spec2: spec2Prop,
  dailyPrice: dailyPriceProp,
  weeklyPrice: weeklyPriceProp,
  ctaText = "View Details",
  ctaLink: ctaLinkProp,
  variant = "default",
  showPricing = true,
  showSpecs = true,
  showEnquiryButton = true,
  onAddToEnquiry,
  onQuickView,
}: EquipmentCardProps) {
  // State for fetched product data
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!!productId);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data when productId is provided
  useEffect(() => {
    if (!productId) return;

    const targetId = productId; // Capture for closure

    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const allProducts: Product[] = Array.isArray(data) ? data : data.products || [];

        // Find matching product by ID (case-insensitive)
        const searchId = targetId.toLowerCase();
        const product = allProducts.find(
          (p) =>
            p.productId === targetId ||
            p.productId?.toLowerCase() === searchId ||
            p.model?.toLowerCase() === searchId
        );

        if (product) {
          setFetchedProduct(product);
          setError(null);
        } else {
          setError(`Product not found: ${targetId}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, apiEndpoint]);

  // Helper to extract title from heroLabel
  const getProductTitle = (product: Product): string => {
    if (product.heroLabel) {
      const match = product.heroLabel.match(/title="([^"]+)"/);
      return match ? match[1] : product.model;
    }
    return product.model;
  };

  // Helper to get spec strings from product
  const getSpec1 = (product: Product): string => {
    const ops = product.operationalSpecification;
    if (ops?.capacityT) return `Capacity: ${ops.capacityT}T`;
    if (ops?.platformHeightFt) return `Platform Height: ${ops.platformHeightFt}`;
    if (ops?.horizontalReachFt && ops.horizontalReachFt !== "NA") return `Reach: ${ops.horizontalReachFt}`;
    return "";
  };

  const getSpec2 = (product: Product): string => {
    const ops = product.operationalSpecification;
    if (ops?.workingHeightFt && ops.workingHeightFt !== "NA") return `Working Height: ${ops.workingHeightFt}`;
    if (ops?.platformHeightM) return `Height: ${ops.platformHeightM}m`;
    return "";
  };

  // Resolve props - use fetched data if available, otherwise use passed props
  const id = fetchedProduct?.productId ?? idProp;
  const imageUrl = fetchedProduct?.productImages?.[0]?.imageUrl ?? imageUrlProp;
  const brand = fetchedProduct?.brand ?? brandProp;
  const model = fetchedProduct?.model ?? modelProp;
  const name = fetchedProduct ? getProductTitle(fetchedProduct) : nameProp;
  const category = fetchedProduct?.category ?? categoryProp;
  const spec1 = fetchedProduct ? getSpec1(fetchedProduct) : spec1Prop;
  const spec2 = fetchedProduct ? getSpec2(fetchedProduct) : spec2Prop;
  const dailyPrice = fetchedProduct?.pricing?.daily ?? dailyPriceProp;
  const weeklyPrice = fetchedProduct?.pricing?.weekly ?? weeklyPriceProp;
  const ctaLink = ctaLinkProp ?? (id ? `/equipment/${id}` : "#");

  const { addItem, removeItem, isInCart } = useEnquiryCart();
  const inCart = id ? isInCart(id) : false;

  // Show loading state
  if (loading) {
    return (
      <div className="animate-pulse bg-[var(--color-card,white)] border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] overflow-hidden">
        <div className="h-48 md:h-56 bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded mt-4" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-[var(--color-card,white)] border border-[var(--color-error,#ef4444)]/30 rounded-[var(--radius,8px)] p-4 text-center">
        <p className="text-sm text-[var(--color-error,#ef4444)]">{error}</p>
      </div>
    );
  }

  const handleEnquiryClick = () => {
    if (!id) return;

    const item = {
      id,
      name: name || model || "Equipment",
      brand,
      category,
      imageUrl: imageUrl || undefined,
    };

    if (inCart) {
      removeItem(id);
    } else {
      addItem(item);
      onAddToEnquiry?.(item);
    }
  };
  const formatPrice = (price?: string | number): string => {
    if (!price) return "POA";
    if (typeof price === "string") return price;
    return `$${price.toFixed(2)}`;
  };

  const placeholderImage = `https://placehold.co/400x300/f3f4f6/64748b?text=${encodeURIComponent(model || "Equipment")}`;

  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  return (
    <div
      className={`
        group relative flex flex-col
        bg-[var(--color-card,white)]
        border border-[var(--color-border,#e2e8f0)]
        rounded-[var(--radius,8px)]
        overflow-hidden
        transition-all duration-200
        hover:shadow-lg hover:border-[var(--color-primary,#e31937)]
        ${isFeatured ? "ring-2 ring-[var(--color-primary,#e31937)]" : ""}
      `}
    >
      {/* Image Container */}
      <div className={`relative ${isCompact ? "h-40" : "h-48 md:h-56"} overflow-hidden bg-white`}>
        <img
          src={imageUrl || placeholderImage}
          alt={name || model || "Equipment"}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Badge */}
        {category && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-[var(--radius-sm,4px)] bg-[var(--color-background,white)]/90 text-[var(--color-foreground,#0f172a)]">
            {category}
          </span>
        )}

        {/* Featured Badge */}
        {isFeatured && (
          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-[var(--radius-sm,4px)] bg-[var(--color-primary,#e31937)] text-[var(--color-primary-foreground,white)]">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-grow ${isCompact ? "p-3" : "p-4"}`}>
        {/* Brand & Model */}
        <div className="mb-2">
          {brand && (
            <span className="text-xs font-medium text-[var(--color-muted-foreground,#64748b)] uppercase tracking-wide">
              {brand}
            </span>
          )}
          {model && (
            <span className="text-xs text-[var(--color-muted-foreground,#64748b)] ml-2">
              {model}
            </span>
          )}
        </div>

        {/* Name/Title */}
        <h3 className={`font-semibold text-[var(--color-foreground,#0f172a)] mb-2 line-clamp-2 ${isCompact ? "text-sm" : "text-base md:text-lg"}`}>
          {name || model || "Equipment"}
        </h3>

        {/* Specs */}
        {showSpecs && (spec1 || spec2) && (
          <div className={`space-y-1 mb-3 ${isCompact ? "text-xs" : "text-sm"} text-[var(--color-muted-foreground,#64748b)]`}>
            {spec1 && <p>{spec1}</p>}
            {spec2 && <p>{spec2}</p>}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Pricing */}
        {showPricing && (
          <div className={`flex gap-4 ${isCompact ? "mb-2" : "mb-4"} border-t border-[var(--color-border,#e2e8f0)] pt-3`}>
            <div>
              <span className="text-xs text-[var(--color-muted-foreground,#64748b)]">Daily</span>
              <p className={`font-bold text-[var(--color-foreground,#0f172a)] ${isCompact ? "text-sm" : "text-base"}`}>
                {formatPrice(dailyPrice)}
              </p>
            </div>
            <div>
              <span className="text-xs text-[var(--color-muted-foreground,#64748b)]">Weekly</span>
              <p className={`font-bold text-[var(--color-foreground,#0f172a)] ${isCompact ? "text-sm" : "text-base"}`}>
                {formatPrice(weeklyPrice)}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex gap-2 ${showEnquiryButton ? "" : ""}`}>
          {showEnquiryButton && id && (
            <button
              onClick={handleEnquiryClick}
              className={`
                flex-1 flex items-center justify-center gap-1.5 font-medium
                rounded-[var(--radius-sm,4px)]
                transition-colors duration-200
                border-2
                ${inCart
                  ? "bg-[var(--color-primary,#e31937)] border-[var(--color-primary,#e31937)] text-[var(--color-primary-foreground,white)]"
                  : "bg-transparent border-[var(--color-primary,#e31937)] text-[var(--color-primary,#e31937)] hover:bg-[var(--color-primary,#e31937)]/10"
                }
                ${isCompact ? "py-2 text-sm" : "py-2.5 text-base"}
              `}
            >
              {inCart ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Enquire
                </>
              )}
            </button>
          )}

          {onQuickView ? (
            <button
              onClick={() => onQuickView({
                id,
                imageUrl,
                brand,
                model,
                name,
                category,
                spec1,
                spec2,
                dailyPrice,
                weeklyPrice,
                ctaText,
                ctaLink,
              })}
              className={`
                ${showEnquiryButton && id ? "flex-1" : "w-full"} block text-center font-medium
                rounded-[var(--radius-sm,4px)]
                transition-colors duration-200
                bg-[var(--color-primary,#e31937)]
                hover:bg-[var(--color-primary-hover,#841020)]
                text-[var(--color-primary-foreground,white)]
                ${isCompact ? "py-2 text-sm" : "py-2.5 text-base"}
              `}
            >
              {ctaText}
            </button>
          ) : (
            <a
              href={ctaLink || `#${id}`}
              className={`
                ${showEnquiryButton && id ? "flex-1" : "w-full"} block text-center font-medium
                rounded-[var(--radius-sm,4px)]
                transition-colors duration-200
                bg-[var(--color-primary,#e31937)]
                hover:bg-[var(--color-primary-hover,#841020)]
                text-[var(--color-primary-foreground,white)]
                ${isCompact ? "py-2 text-sm" : "py-2.5 text-base"}
              `}
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default EquipmentCard;
