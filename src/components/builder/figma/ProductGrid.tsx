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
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  fuel_type?: string;
  model?: string;
  image_url?: string;
  specs?: {
    reach?: string;
    height?: string;
    capacity?: string;
    [key: string]: string | undefined;
  };
  pricing?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
  slug?: string;
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
        let filteredProducts = Array.isArray(data) ? data : data.products || [];

        // Apply category filter
        if (category) {
          filteredProducts = filteredProducts.filter(
            (p: Product) => p.category?.toLowerCase() === category.toLowerCase()
          );
        }

        // Apply subcategory filter
        if (subcategory) {
          filteredProducts = filteredProducts.filter(
            (p: Product) => p.subcategory?.toLowerCase() === subcategory.toLowerCase()
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

  const getSpec1 = (product: Product) => {
    if (product.specs?.reach) return `Reach: ${product.specs.reach}`;
    if (product.specs?.capacity) return `Capacity: ${product.specs.capacity}`;
    return "";
  };

  const getSpec2 = (product: Product) => {
    if (product.specs?.height) return `Height: ${product.specs.height}`;
    return "";
  };

  return (
    <section className="py-12 px-4 bg-[var(--color-background-alt,#f3f4f6)]">
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
                key={product.id}
                imageUrl={product.image_url || `https://placehold.co/300x300/f3f4f6/64748b?text=${encodeURIComponent(product.name)}`}
                logoUrl={showBrandLogo ? brandLogoUrl : undefined}
                fuelType={product.fuel_type || product.category}
                modelNumber={product.model || ""}
                title={product.name}
                spec1={getSpec1(product)}
                spec2={getSpec2(product)}
                dailyPrice={formatPrice(product.pricing?.daily)}
                weeklyPrice={formatPrice(product.pricing?.weekly)}
                ctaText={cardCtaText}
                ctaLink={`${productBaseUrl}/${product.slug || product.id}`}
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
