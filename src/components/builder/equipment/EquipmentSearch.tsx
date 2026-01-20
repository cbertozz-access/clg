"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { EquipmentCard } from "./EquipmentCard";
import {
  searchProducts,
  getCategories,
  getBrands,
  mapAlgoliaToEquipment,
  type SearchFilters,
} from "@/lib/api/algolia";

/**
 * Equipment Search Component
 *
 * Full-featured equipment browser with search, filters, and grid/list view.
 * Uses Algolia for fast, server-side search and filtering.
 * Uses CSS variables for multi-brand theming.
 */

interface Equipment {
  id: string;
  objectId: string;
  name: string;
  model: string;
  brand: string;
  category: string;
  subcategory?: string;
  slug: string;
  imageUrl?: string;
  images: string[];
  specs: {
    workingHeight?: string;
    horizontalReach?: string;
    capacity?: string;
  };
  energySource?: string;
  isHire: boolean;
  isSale: boolean;
  isUsed: boolean;
  isInStock: boolean;
}

type ViewMode = "grid" | "list";
type SortOption = "name-asc" | "name-desc" | "category";

export interface EquipmentSearchProps {
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Initial category filter */
  initialCategory?: string;
  /** Products per page */
  productsPerPage?: number;
  /** Number of columns in grid view */
  columns?: "2" | "3" | "4";
  /** Show category filter */
  showCategoryFilter?: boolean;
  /** Show brand filter */
  showBrandFilter?: boolean;
  /** Show sort options */
  showSort?: boolean;
  /** Show view toggle (grid/list) */
  showViewToggle?: boolean;
  /** Show results count */
  showResultsCount?: boolean;
  /** Show load more button */
  showLoadMore?: boolean;
  /** Card CTA text */
  cardCtaText?: string;
  /** Product detail base URL */
  productBaseUrl?: string;
  /** Show pricing on cards */
  showPricing?: boolean;
  /** Filter sidebar position */
  filterPosition?: "left" | "top";
  /** Mobile filter style */
  mobileFilterStyle?: "drawer" | "dropdown" | "chips";
  /** Filter by hire availability */
  isHire?: boolean;
  /** Filter by sale availability */
  isSale?: boolean;
  /** Filter by stock status */
  inStockOnly?: boolean;
}

export function EquipmentSearch({
  title = "Browse Equipment",
  subtitle = "Find the right equipment for your project",
  initialCategory,
  productsPerPage = 12,
  columns = "3",
  showCategoryFilter = true,
  showBrandFilter = true,
  showSort = true,
  showViewToggle = true,
  showResultsCount = true,
  showLoadMore = true,
  cardCtaText = "View Details",
  productBaseUrl = "/equipment",
  showPricing = false,
  filterPosition = "left",
  isHire,
  isSale,
  inStockOnly,
}: EquipmentSearchProps) {
  // Equipment state from Algolia
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalHits, setTotalHits] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter options from Algolia facets
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [brands, setBrands] = useState<{ name: string; count: number }[]>([]);

  // User filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search query
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(0); // Reset to first page on new search
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch categories and brands on mount
  // Also extract from search results as fallback if facets aren't configured
  useEffect(() => {
    async function fetchFacets() {
      const [cats, brnds] = await Promise.all([getCategories(), getBrands()]);
      // Only set if we actually got facet data
      if (cats.length > 0) setCategories(cats);
      if (brnds.length > 0) setBrands(brnds);
    }
    fetchFacets();
  }, []);

  // Extract categories and brands from results as fallback
  useEffect(() => {
    if (equipment.length > 0 && categories.length === 0) {
      const uniqueCats = new Map<string, number>();
      equipment.forEach(item => {
        if (item.category) {
          uniqueCats.set(item.category, (uniqueCats.get(item.category) || 0) + 1);
        }
      });
      const catList = Array.from(uniqueCats.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      if (catList.length > 0) setCategories(catList);
    }

    if (equipment.length > 0 && brands.length === 0) {
      const uniqueBrands = new Map<string, number>();
      equipment.forEach(item => {
        if (item.brand && item.brand !== 'Unknown') {
          uniqueBrands.set(item.brand, (uniqueBrands.get(item.brand) || 0) + 1);
        }
      });
      const brandList = Array.from(uniqueBrands.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      if (brandList.length > 0) setBrands(brandList);
    }
  }, [equipment, categories.length, brands.length]);

  // Build search filters
  const buildFilters = useCallback((): SearchFilters => {
    const filters: SearchFilters = {};
    if (debouncedQuery) filters.query = debouncedQuery;
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedBrand) filters.brand = selectedBrand;
    if (isHire !== undefined) filters.isHire = isHire;
    if (isSale !== undefined) filters.isSale = isSale;
    if (inStockOnly) filters.inStock = true;
    return filters;
  }, [debouncedQuery, selectedCategory, selectedBrand, isHire, isSale, inStockOnly]);

  // Search products with Algolia
  const performSearch = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const filters = buildFilters();

      const result = await searchProducts({
        page,
        hitsPerPage: productsPerPage,
        filters,
      });

      // Map Algolia products to Equipment format
      const mappedEquipment = result.hits.map(mapAlgoliaToEquipment);

      // Sort client-side since Algolia doesn't sort alphabetically by default
      mappedEquipment.sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "category":
            return a.category.localeCompare(b.category);
          default:
            return 0;
        }
      });

      if (page === 0) {
        setEquipment(mappedEquipment);
      } else {
        // Append for load more
        setEquipment(prev => [...prev, ...mappedEquipment]);
      }

      setTotalHits(result.nbHits);
      setCurrentPage(result.page);
      setTotalPages(result.nbPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search equipment");
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [buildFilters, productsPerPage, sortBy]);

  // Perform search when filters change
  useEffect(() => {
    performSearch(0);
  }, [debouncedQuery, selectedCategory, selectedBrand, sortBy, isHire, isSale, inStockOnly]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, selectedBrand]);

  const hasMore = currentPage < totalPages - 1;

  const loadMore = () => {
    if (hasMore && !loading) {
      performSearch(currentPage + 1);
    }
  };

  const gridCols = {
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSortBy("name-asc");
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedBrand;

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground,#0f172a)] mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] bg-[var(--color-card,white)] text-[var(--color-foreground,#0f172a)] placeholder:text-[var(--color-muted-foreground,#64748b)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#e31937)]"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground,#64748b)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Filter */}
      {showCategoryFilter && categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground,#0f172a)] mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] bg-[var(--color-card,white)] text-[var(--color-foreground,#0f172a)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#e31937)]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Brand Filter */}
      {showBrandFilter && brands.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground,#0f172a)] mb-2">
            Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] bg-[var(--color-card,white)] text-[var(--color-foreground,#0f172a)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#e31937)]"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand.name} value={brand.name}>
                {brand.name} ({brand.count})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-sm font-medium text-[var(--color-primary,#e31937)] hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <section className="min-h-screen bg-[var(--color-background,white)]">
      {/* Header */}
      <div className="bg-[var(--color-background-alt,#f8fafc)] border-b border-[var(--color-border,#e2e8f0)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground,#0f172a)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-lg text-[var(--color-muted-foreground,#64748b)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] bg-[var(--color-card,white)] text-[var(--color-foreground,#0f172a)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary,#e31937)]" />
            )}
          </button>

          {/* Mobile Filter Panel */}
          {mobileFiltersOpen && (
            <div className="mt-4 p-4 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] bg-[var(--color-card,white)]">
              <FilterSidebar />
            </div>
          )}
        </div>

        <div className={`flex gap-8 ${filterPosition === "left" ? "flex-row" : "flex-col"}`}>
          {/* Desktop Filter Sidebar */}
          {filterPosition === "left" && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-4 p-4 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius,8px)] bg-[var(--color-card,white)]">
                <h3 className="font-semibold text-[var(--color-foreground,#0f172a)] mb-4">
                  Filters
                </h3>
                <FilterSidebar />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-grow">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Results Count */}
              {showResultsCount && !loading && (
                <p className="text-sm text-[var(--color-muted-foreground,#64748b)]">
                  {totalHits} {totalHits === 1 ? "result" : "results"}
                </p>
              )}

              <div className="flex items-center gap-4">
                {/* Sort */}
                {showSort && (
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 text-sm border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-sm,4px)] bg-[var(--color-card,white)] text-[var(--color-foreground,#0f172a)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#e31937)]"
                  >
                    <option value="name-asc">Name: A-Z</option>
                    <option value="name-desc">Name: Z-A</option>
                    <option value="category">Category</option>
                  </select>
                )}

                {/* View Toggle */}
                {showViewToggle && (
                  <div className="flex border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-sm,4px)] overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${viewMode === "grid" ? "bg-[var(--color-primary,#e31937)] text-white" : "bg-[var(--color-card,white)] text-[var(--color-muted-foreground,#64748b)]"}`}
                      aria-label="Grid view"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${viewMode === "list" ? "bg-[var(--color-primary,#e31937)] text-white" : "bg-[var(--color-card,white)] text-[var(--color-muted-foreground,#64748b)]"}`}
                      aria-label="List view"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-[var(--color-background-alt,#f8fafc)] rounded-full">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-[var(--color-primary,#e31937)]">×</button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-[var(--color-background-alt,#f8fafc)] rounded-full">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("")} className="ml-1 hover:text-[var(--color-primary,#e31937)]">×</button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-[var(--color-background-alt,#f8fafc)] rounded-full">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand("")} className="ml-1 hover:text-[var(--color-primary,#e31937)]">×</button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-[var(--color-primary,#e31937)] hover:underline"
                >
                  Clear all
                </button>
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

            {/* Equipment Grid */}
            {!loading && !error && equipment.length > 0 && (
              <>
                <div className={viewMode === "grid" ? `grid ${gridCols[columns]} gap-4 md:gap-6` : "flex flex-col gap-4"}>
                  {equipment.map((item) => (
                    <EquipmentCard
                      key={item.objectId}
                      id={item.id}
                      imageUrl={item.imageUrl}
                      brand={item.brand}
                      model={item.model}
                      name={item.name}
                      category={item.category}
                      spec1={item.specs.workingHeight ? `Working Height: ${item.specs.workingHeight}` : item.specs.capacity ? `Capacity: ${item.specs.capacity}` : ""}
                      spec2={item.specs.horizontalReach ? `Reach: ${item.specs.horizontalReach}` : ""}
                      ctaText={cardCtaText}
                      ctaLink={`${productBaseUrl}/${item.slug}`}
                      variant={viewMode === "list" ? "compact" : "default"}
                      showPricing={showPricing}
                    />
                  ))}
                </div>

                {/* Load More */}
                {showLoadMore && hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-8 py-3 font-medium border-2 border-[var(--color-primary,#e31937)] text-[var(--color-primary,#e31937)] rounded-[var(--radius,8px)] hover:bg-[var(--color-primary,#e31937)] hover:text-white transition-colors disabled:opacity-50"
                    >
                      {loading ? "Loading..." : `Load More (${totalHits - equipment.length} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && !error && equipment.length === 0 && (
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg className="w-20 h-20 mx-auto text-[var(--color-muted-foreground,#64748b)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-foreground,#0f172a)] mb-2">
                  No equipment found
                </h3>
                <p className="text-[var(--color-muted-foreground,#64748b)] mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 font-medium bg-[var(--color-primary,#e31937)] text-white rounded-[var(--radius,8px)] hover:bg-[var(--color-primary-hover,#841020)] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}

export default EquipmentSearch;
