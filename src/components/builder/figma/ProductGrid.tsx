"use client";

import { useEffect, useState } from "react";
import { FigmaProductCard } from "./ProductCard";

/**
 * Product Grid Component - Fetches from Live API
 *
 * Connects to the products API and displays cards using FigmaProductCard.
 * Uses CSS variables for multi-brand theming.
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
  transportSpecification?: {
    weightKg?: number;
    widthM?: number;
    lengthM?: number;
    heightM?: number;
    heightFt?: string;
  };
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

export interface FigmaProductGridProps {
  /** Section title */
  sectionTitle?: string;
  /** API endpoint URL */
  apiEndpoint?: string;
  /** Category filter */
  category?: string;
  /** Subcategory filter */
  subcategory?: string;
  /** Number of columns (2 or 3) */
  columns?: "2" | "3" | "4";
  /** Maximum number of products to display */
  maxProducts?: number;
  /** View all link */
  viewAllLink?: string;
  /** View all button text */
  viewAllText?: string;
  /** CTA text on each card */
  cardCtaText?: string;
  /** Base URL for product detail pages */
  productBaseUrl?: string;
  /** Show brand logo on cards */
  showBrandLogo?: boolean;
  /** Brand logo URL */
  brandLogoUrl?: string;
}

export function FigmaProductGrid({
  sectionTitle = "Featured Equipment",
  apiEndpoint = "https://acccessproducts.netlify.app/api/products",
  category,
  subcategory,
  columns = "3",
  maxProducts = 6,
  viewAllLink,
  viewAllText = "View All Equipment",
  cardCtaText = "View Details",
  productBaseUrl = "/equipment",
  showBrandLogo = false,
  brandLogoUrl,
}: FigmaProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let filteredProducts: Product[] = Array.isArray(data) ? data : data.products || [];

        // Apply category filter
        if (category) {
          filteredProducts = filteredProducts.filter(
            (p: Product) => p.category?.toLowerCase() === category.toLowerCase()
          );
        }

        // Apply subcategory filter
        if (subcategory) {
          filteredProducts = filteredProducts.filter(
            (p: Product) => p.subCategory?.toLowerCase() === subcategory.toLowerCase()
          );
        }

        // Limit results
        setProducts(filteredProducts.slice(0, maxProducts));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [apiEndpoint, category, subcategory, maxProducts]);

  const gridCols = {
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const formatPrice = (price?: number) => {
    if (!price) return "POA";
    return `$${price.toFixed(2)}`;
  };

  const getProductImage = (product: Product) => {
    return product.productImages?.[0]?.imageUrl ||
      `https://placehold.co/300x300/f3f4f6/64748b?text=${encodeURIComponent(product.model)}`;
  };

  const getProductTitle = (product: Product) => {
    // Extract title from heroLabel or use model
    if (product.heroLabel) {
      // Parse title from heroLabel HTML
      const match = product.heroLabel.match(/title="([^"]+)"/);
      return match ? match[1] : product.model;
    }
    return product.model;
  };

  const getSpec1 = (product: Product) => {
    const ops = product.operationalSpecification;
    if (ops?.capacityT) return `Capacity: ${ops.capacityT}T`;
    if (ops?.platformHeightFt) return `Platform Height: ${ops.platformHeightFt}`;
    if (ops?.horizontalReachFt && ops.horizontalReachFt !== "NA") return `Reach: ${ops.horizontalReachFt}`;
    return "";
  };

  const getSpec2 = (product: Product) => {
    const ops = product.operationalSpecification;
    if (ops?.workingHeightFt && ops.workingHeightFt !== "NA") return `Working Height: ${ops.workingHeightFt}`;
    if (ops?.platformHeightM) return `Height: ${ops.platformHeightM}m`;
    return "";
  };

  return (
    <section className="pb-12 px-4 bg-[var(--color-background-alt,#f3f4f6)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground,#020617)]">
            {sectionTitle}
          </h2>
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="text-[var(--color-primary,#0f172a)] hover:underline font-medium"
            >
              {viewAllText} →
            </a>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary,#0f172a)]" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-[var(--color-error,#ef4444)]">
            <p>Error loading products: {error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className={`grid ${gridCols[columns]} gap-6`}>
            {products.map((product) => (
              <FigmaProductCard
                key={product.productId}
                imageUrl={getProductImage(product)}
                logoUrl={showBrandLogo ? brandLogoUrl : undefined}
                fuelType={product.category}
                modelNumber={product.model}
                title={getProductTitle(product)}
                spec1={getSpec1(product)}
                spec2={getSpec2(product)}
                dailyPrice={formatPrice(product.pricing?.daily)}
                weeklyPrice={formatPrice(product.pricing?.weekly)}
                ctaText={cardCtaText}
                ctaLink={`${productBaseUrl}/${product.productId}`}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12 text-[var(--color-muted-foreground,#64748b)]">
            <p>No products found</p>
          </div>
        )}
      </div>
    </section>
  );
}
