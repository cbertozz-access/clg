"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { EquipmentCard } from "./EquipmentCard";

/**
 * Equipment Grid Component
 *
 * Displays a grid of equipment cards fetched from the API.
 * Supports filtering by category, subcategory, and text search.
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

export interface EquipmentGridProps {
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** API endpoint URL */
  apiEndpoint?: string;
  /** Category filter */
  category?: string;
  /** Subcategory filter */
  subcategory?: string;
  /** Brand filter */
  brand?: string;
  /** Number of columns */
  columns?: "2" | "3" | "4";
  /** Maximum products to display */
  maxProducts?: number;
  /** Show search input */
  showSearch?: boolean;
  /** Show category filter */
  showCategoryFilter?: boolean;
  /** View all link */
  viewAllLink?: string;
  /** View all text */
  viewAllText?: string;
  /** Card CTA text */
  cardCtaText?: string;
  /** Product detail base URL */
  productBaseUrl?: string;
  /** Card variant */
  cardVariant?: "default" | "compact" | "featured";
  /** Show pricing on cards */
  showPricing?: boolean;
  /** Background color variant */
  background?: "white" | "light" | "none";
}

export function EquipmentGrid({
  title = "Equipment",
  subtitle,
  apiEndpoint = "https://acccessproducts.netlify.app/api/products",
  category,
  subcategory,
  brand,
  columns = "3",
  maxProducts = 12,
  showSearch = false,
  showCategoryFilter = false,
  viewAllLink,
  viewAllText = "View All",
  cardCtaText = "View Details",
  productBaseUrl = "/equipment",
  cardVariant = "default",
  showPricing = true,
  background = "light",
}: EquipmentGridProps) {
  // URL parameters for deep linking
  const searchParams = useSearchParams();
  const urlParamsApplied = useRef(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [selectedBrand, setSelectedBrand] = useState(brand || "");
  const [categories, setCategories] = useState<string[]>([]);

  // Read URL parameters on mount
  useEffect(() => {
    if (urlParamsApplied.current) return;
    urlParamsApplied.current = true;

    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const searchParam = searchParams.get("q") || searchParams.get("search");
    const subcategoryParam = searchParams.get("subcategory");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const allProducts: Product[] = Array.isArray(data) ? data : data.products || [];
        setProducts(allProducts);

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category))).sort();
        setCategories(uniqueCategories);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [apiEndpoint]);

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    // Apply category filter from props, URL param, or selection
    const activeCategory = selectedCategory || category;
    if (activeCategory) {
      filtered = filtered.filter(
        p => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Apply subcategory filter
    if (subcategory) {
      filtered = filtered.filter(
        p => p.subCategory?.toLowerCase() === subcategory.toLowerCase()
      );
    }

    // Apply brand filter from props, URL param, or selection
    const activeBrand = selectedBrand || brand;
    if (activeBrand) {
      filtered = filtered.filter(
        p => p.brand?.toLowerCase() === activeBrand.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.model?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Limit results
    setFilteredProducts(filtered.slice(0, maxProducts));
  }, [products, category, subcategory, brand, searchQuery, selectedCategory, selectedBrand, maxProducts]);

  const gridCols = {
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  const bgClasses = {
    white: "bg-[var(--color-card,white)]",
    light: "bg-[var(--color-background-alt,#ffffff)]",
    none: "",
  };

  const getProductTitle = (product: Product): string => {
    if (product.heroLabel) {
      const match = product.heroLabel.match(/title="([^"]+)"/);
      return match ? match[1] : product.model;
    }
    return product.model;
  };

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

  return (
    <section className={`py-8 md:py-12 px-4 ${bgClasses[background]}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground,#0f172a)]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-[var(--color-muted-foreground,#64748b)]">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllLink && (
            <a
              href={viewAllLink}
              className="inline-flex items-center gap-1 text-[var(--color-primary,#e31937)] hover:underline font-medium"
            >
              {viewAllText}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>

        {/* Filters */}
        {(showSearch || showCategoryFilter) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {showSearch && (
              <div className="relative flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] bg-[var(--color-card,white)] text-[var(--color-foreground,#0f172a)] placeholder:text-[var(--color-muted-foreground,#64748b)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#e31937)] focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground,#64748b)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}

            {showCategoryFilter && categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] bg-[var(--color-card,white)] text-[var(--color-foreground,#0f172a)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#e31937)]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--color-border,#e2e8f0)] border-t-[var(--color-primary,#e31937)]" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 px-4 bg-[var(--color-error,#ef4444)]/10 rounded-[var(--radius,8px)]">
            <p className="text-[var(--color-error,#ef4444)]">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
            {filteredProducts.map((product) => (
              <EquipmentCard
                key={product.productId}
                id={product.productId}
                imageUrl={product.productImages?.[0]?.imageUrl}
                brand={product.brand}
                model={product.model}
                name={getProductTitle(product)}
                category={product.category}
                spec1={getSpec1(product)}
                spec2={getSpec2(product)}
                dailyPrice={product.pricing?.daily}
                weeklyPrice={product.pricing?.weekly}
                ctaText={cardCtaText}
                ctaLink={`${productBaseUrl}/${product.productId}`}
                variant={cardVariant}
                showPricing={showPricing}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-[var(--color-muted-foreground,#64748b)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[var(--color-muted-foreground,#64748b)] text-lg">
              No equipment found
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="mt-4 text-[var(--color-primary,#e31937)] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-6 text-center text-sm text-[var(--color-muted-foreground,#64748b)]">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </section>
  );
}

export default EquipmentGrid;
