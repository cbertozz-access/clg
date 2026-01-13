"use client";

import { useEffect, useState } from "react";
import { FigmaProductCard } from "./ProductCard";

/**
 * API-Connected Product Card
 *
 * Fetches a specific product from the API by ID and displays it.
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
  };
}

export interface FigmaProductCardAPIProps {
  /** Product ID from API */
  productId?: string;
  /** API endpoint URL */
  apiEndpoint?: string;
  /** CTA button text */
  ctaText?: string;
  /** Base URL for product detail pages */
  productBaseUrl?: string;
  /** Show brand logo */
  showBrandLogo?: boolean;
  /** Brand logo URL */
  brandLogoUrl?: string;
}

export function FigmaProductCardAPI({
  productId,
  apiEndpoint = "https://acccessproducts.netlify.app/api/products",
  ctaText = "View Details",
  productBaseUrl = "/equipment",
  showBrandLogo = false,
  brandLogoUrl,
}: FigmaProductCardAPIProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }

    async function fetchProduct() {
      setLoading(true);
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error("API error");

        const data = await response.json();
        const products = Array.isArray(data) ? data : data.products || [];
        const found = products.find((p: Product) => p.productId === productId);

        if (found) {
          setProduct(found);
          setError(null);
        } else {
          setError("Product not found");
          setProduct(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, apiEndpoint]);

  const formatPrice = (price?: number) => {
    if (!price) return "POA";
    return `$${price.toFixed(2)}`;
  };

  const getProductImage = (p: Product) => {
    return p.productImages?.[0]?.imageUrl ||
      `https://placehold.co/300x300/f3f4f6/64748b?text=${encodeURIComponent(p.model)}`;
  };

  const getProductTitle = (p: Product) => {
    if (p.heroLabel) {
      const match = p.heroLabel.match(/title="([^"]+)"/);
      return match ? match[1] : p.model;
    }
    return p.model;
  };

  const getSpec1 = (p: Product) => {
    const ops = p.operationalSpecification;
    if (ops?.capacityT) return `Capacity: ${ops.capacityT}T`;
    if (ops?.platformHeightFt) return `Platform Height: ${ops.platformHeightFt}`;
    return "";
  };

  const getSpec2 = (p: Product) => {
    const ops = p.operationalSpecification;
    if (ops?.workingHeightFt && ops.workingHeightFt !== "NA") return `Working Height: ${ops.workingHeightFt}`;
    return "";
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full p-8 bg-[var(--color-background,white)] border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary,#0f172a)] mx-auto" />
      </div>
    );
  }

  // No product selected
  if (!productId) {
    return (
      <div className="w-full p-8 bg-[var(--color-background-alt,#f3f4f6)] border-2 border-dashed border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] text-center text-[var(--color-muted-foreground,#64748b)]">
        <p>Select a product ID in the component settings</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full p-8 bg-[var(--color-background,white)] border border-[var(--color-error,#ef4444)] rounded-[var(--radius,8px)] text-center text-[var(--color-error,#ef4444)]">
        <p>{error}</p>
      </div>
    );
  }

  // Product loaded
  if (product) {
    return (
      <FigmaProductCard
        imageUrl={getProductImage(product)}
        logoUrl={showBrandLogo ? brandLogoUrl : undefined}
        fuelType={product.category}
        modelNumber={product.model}
        title={getProductTitle(product)}
        spec1={getSpec1(product)}
        spec2={getSpec2(product)}
        dailyPrice={formatPrice(product.pricing?.daily)}
        weeklyPrice={formatPrice(product.pricing?.weekly)}
        ctaText={ctaText}
        ctaLink={`${productBaseUrl}/${product.productId}`}
      />
    );
  }

  return null;
}
