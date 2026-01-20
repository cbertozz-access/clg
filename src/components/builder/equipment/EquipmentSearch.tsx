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
 * Full-featured equipment browser with accordion-style filters.
 * Uses Algolia for fast, server-side search and filtering.
 * Inspired by the leads-aggregator browse page design.
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
  /** Filter by hire availability */
  isHire?: boolean;
  /** Filter by sale availability */
  isSale?: boolean;
  /** Filter by stock status */
  inStockOnly?: boolean;
  /** Equipment selector URL */
  selectorUrl?: string;
}

// Chevron icon component
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// X icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Filter accordion section component
interface FilterSectionProps {
  id: string;
  title: string;
  options: { id: string; label: string; count?: number }[];
  selectedValues: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (values: string[]) => void;
}

function FilterSection({
  id,
  title,
  options,
  selectedValues,
  isExpanded,
  onToggle,
  onChange,
}: FilterSectionProps) {
  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedValues, optionId]
      : selectedValues.filter((v) => v !== optionId);
    onChange(updated);
  };

  return (
    <div className="border-b border-[var(--color-border,#e2e8f0)] pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <span className="font-medium text-[var(--color-foreground,#0f172a)]">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--color-muted-foreground,#64748b)] transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && (
        <div className="space-y-2 mt-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.id)}
                onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border,#e2e8f0)] text-[var(--color-primary,#e31937)] focus:ring-[var(--color-primary,#e31937)] focus:ring-offset-0"
              />
              <span className="text-sm text-[var(--color-foreground,#0f172a)] group-hover:text-[var(--color-primary,#e31937)] flex-1 flex items-center justify-between">
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-[var(--color-muted-foreground,#64748b)]">
                    ({option.count})
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
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
  selectorUrl = "/selector",
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

  // User filters - now supporting multiple selections
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPowerSources, setSelectedPowerSources] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accordion expansion state
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "category",
    "power",
  ]);
  const [showTechnicalFilters, setShowTechnicalFilters] = useState(false);

  // Debounce search query
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Power source options (will be populated from equipment data)
  const [powerSources, setPowerSources] = useState<{ id: string; label: string; count: number }[]>([]);

  // Debounce the search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(0);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch categories and brands on mount
  useEffect(() => {
    async function fetchFacets() {
      const [cats, brnds] = await Promise.all([getCategories(), getBrands()]);
      if (cats.length > 0) setCategories(cats);
      if (brnds.length > 0) setBrands(brnds);
    }
    fetchFacets();
  }, []);

  // Extract categories, brands, and power sources from results as fallback
  useEffect(() => {
    if (equipment.length > 0) {
      // Categories fallback
      if (categories.length === 0) {
        const uniqueCats = new Map<string, number>();
        equipment.forEach((item) => {
          if (item.category) {
            uniqueCats.set(item.category, (uniqueCats.get(item.category) || 0) + 1);
          }
        });
        const catList = Array.from(uniqueCats.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        if (catList.length > 0) setCategories(catList);
      }

      // Brands fallback
      if (brands.length === 0) {
        const uniqueBrands = new Map<string, number>();
        equipment.forEach((item) => {
          if (item.brand && item.brand !== "Unknown") {
            uniqueBrands.set(item.brand, (uniqueBrands.get(item.brand) || 0) + 1);
          }
        });
        const brandList = Array.from(uniqueBrands.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));
        if (brandList.length > 0) setBrands(brandList);
      }

      // Power sources
      const uniquePower = new Map<string, number>();
      equipment.forEach((item) => {
        if (item.energySource) {
          uniquePower.set(item.energySource, (uniquePower.get(item.energySource) || 0) + 1);
        }
      });
      const powerList = Array.from(uniquePower.entries())
        .map(([name, count]) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          label: name,
          count,
        }))
        .sort((a, b) => b.count - a.count);
      if (powerList.length > 0) setPowerSources(powerList);
    }
  }, [equipment, categories.length, brands.length]);

  // Build search filters - only use first selected category for Algolia
  const buildFilters = useCallback((): SearchFilters => {
    const filters: SearchFilters = {};
    if (debouncedQuery) filters.query = debouncedQuery;
    if (selectedCategories.length > 0) filters.category = selectedCategories[0];
    if (selectedBrands.length > 0) filters.brand = selectedBrands[0];
    if (isHire !== undefined) filters.isHire = isHire;
    if (isSale !== undefined) filters.isSale = isSale;
    if (inStockOnly) filters.inStock = true;
    return filters;
  }, [debouncedQuery, selectedCategories, selectedBrands, isHire, isSale, inStockOnly]);

  // Search products with Algolia
  const performSearch = useCallback(
    async (page: number = 0) => {
      try {
        setLoading(true);
        const filters = buildFilters();

        const result = await searchProducts({
          page,
          hitsPerPage: productsPerPage,
          filters,
        });

        // Map Algolia products to Equipment format
        let mappedEquipment = result.hits.map(mapAlgoliaToEquipment);

        // Client-side filtering for multiple selections and power source
        if (selectedCategories.length > 1) {
          mappedEquipment = mappedEquipment.filter((e) =>
            selectedCategories.includes(e.category)
          );
        }
        if (selectedBrands.length > 1) {
          mappedEquipment = mappedEquipment.filter((e) =>
            selectedBrands.includes(e.brand)
          );
        }
        if (selectedPowerSources.length > 0) {
          mappedEquipment = mappedEquipment.filter(
            (e) =>
              e.energySource &&
              selectedPowerSources.includes(e.energySource.toLowerCase().replace(/\s+/g, "-"))
          );
        }

        // Sort client-side
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
          setEquipment((prev) => [...prev, ...mappedEquipment]);
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
    },
    [buildFilters, productsPerPage, sortBy, selectedCategories, selectedBrands, selectedPowerSources]
  );

  // Perform search when filters change
  useEffect(() => {
    performSearch(0);
  }, [debouncedQuery, selectedCategories, selectedBrands, selectedPowerSources, sortBy, isHire, isSale, inStockOnly]);

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedPowerSources([]);
    setSortBy("name-asc");
  };

  const totalActiveFilters =
    selectedCategories.length + selectedBrands.length + selectedPowerSources.length;
  const hasActiveFilters = searchQuery || totalActiveFilters > 0;

  // Get label for active filter badge
  const getFilterLabel = (type: string, value: string): string => {
    if (type === "category") return value;
    if (type === "brand") return value;
    if (type === "power") {
      const source = powerSources.find((p) => p.id === value);
      return source?.label || value;
    }
    return value;
  };

  // Remove individual filter
  const removeFilter = (type: string, value: string) => {
    if (type === "category") {
      setSelectedCategories((prev) => prev.filter((v) => v !== value));
    } else if (type === "brand") {
      setSelectedBrands((prev) => prev.filter((v) => v !== value));
    } else if (type === "power") {
      setSelectedPowerSources((prev) => prev.filter((v) => v !== value));
    }
  };

  // Filter sidebar component with accordion design
  const FilterSidebar = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border,#e2e8f0)]">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="font-semibold text-[var(--color-foreground,#0f172a)]">Filters</span>
          {totalActiveFilters > 0 && (
            <span className="bg-[var(--color-primary,#e31937)] text-white text-xs px-2 py-0.5 rounded-full">
              {totalActiveFilters}
            </span>
          )}
        </div>
        {totalActiveFilters > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-[var(--color-primary,#e31937)] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="pb-4 border-b border-[var(--color-border,#e2e8f0)]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-lg bg-white text-[var(--color-foreground,#0f172a)] placeholder:text-[var(--color-muted-foreground,#64748b)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#e31937)]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground,#64748b)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Category Filter - "What's the job?" */}
      {showCategoryFilter && categories.length > 0 && (
        <FilterSection
          id="category"
          title="What equipment do you need?"
          options={categories.map((cat) => ({
            id: cat.name,
            label: cat.name,
            count: cat.count,
          }))}
          selectedValues={selectedCategories}
          isExpanded={expandedSections.includes("category")}
          onToggle={() => toggleSection("category")}
          onChange={setSelectedCategories}
        />
      )}

      {/* Power Source Filter */}
      {powerSources.length > 0 && (
        <FilterSection
          id="power"
          title="Power preference"
          options={powerSources}
          selectedValues={selectedPowerSources}
          isExpanded={expandedSections.includes("power")}
          onToggle={() => toggleSection("power")}
          onChange={setSelectedPowerSources}
        />
      )}

      {/* Technical Filters Toggle */}
      <div className="pt-4 border-t border-[var(--color-border,#e2e8f0)]">
        <button
          onClick={() => setShowTechnicalFilters(!showTechnicalFilters)}
          className="flex items-center justify-between w-full py-2 text-left text-sm font-medium text-[var(--color-primary,#e31937)]"
        >
          <span>{showTechnicalFilters ? "Hide" : "Show"} technical filters</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              showTechnicalFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {showTechnicalFilters && showBrandFilter && brands.length > 0 && (
          <div className="mt-4">
            <FilterSection
              id="brand"
              title="Brand"
              options={brands.map((brand) => ({
                id: brand.name,
                label: brand.name,
                count: brand.count,
              }))}
              selectedValues={selectedBrands}
              isExpanded={expandedSections.includes("brand")}
              onToggle={() => toggleSection("brand")}
              onChange={setSelectedBrands}
            />
          </div>
        )}
      </div>

      {/* Not Sure CTA */}
      {selectorUrl && (
        <div className="pt-4 border-t border-[var(--color-border,#e2e8f0)]">
          <p className="text-sm text-[var(--color-muted-foreground,#64748b)] mb-2">
            Not sure what you need?
          </p>
          <a
            href={selectorUrl}
            className="block w-full py-2.5 px-4 text-center text-sm font-medium border border-[var(--color-border,#e2e8f0)] rounded-lg hover:bg-[var(--color-background-alt,#f8fafc)] transition-colors"
          >
            Use Equipment Selector
          </a>
        </div>
      )}
    </div>
  );

  // Active filters display
  const ActiveFiltersDisplay = () => {
    const allFilters = [
      ...selectedCategories.map((v) => ({ type: "category", value: v })),
      ...selectedBrands.map((v) => ({ type: "brand", value: v })),
      ...selectedPowerSources.map((v) => ({ type: "power", value: v })),
    ];

    if (allFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {allFilters.map(({ type, value }) => (
          <span
            key={`${type}-${value}`}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-[var(--color-background-alt,#f8fafc)] border border-[var(--color-border,#e2e8f0)] rounded-full"
          >
            {getFilterLabel(type, value)}
            <button
              onClick={() => removeFilter(type, value)}
              className="ml-1 hover:text-[var(--color-primary,#e31937)] p-0.5"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-[var(--color-primary,#e31937)] hover:underline"
        >
          Clear all
        </button>
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-[var(--color-background-alt,#f8fafc)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border,#e2e8f0)]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground,#0f172a)]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-[var(--color-muted-foreground,#64748b)]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Mobile Search */}
            <div className="relative flex-1 lg:hidden">
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-lg bg-white"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground,#64748b)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-lg bg-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Filters
              {totalActiveFilters > 0 && (
                <span className="bg-[var(--color-primary,#e31937)] text-white text-xs px-2 py-0.5 rounded-full">
                  {totalActiveFilters}
                </span>
              )}
            </button>

            {/* Sort */}
            {showSort && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2.5 border border-[var(--color-border,#e2e8f0)] rounded-lg bg-white text-[var(--color-foreground,#0f172a)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#e31937)]"
              >
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="category">Category</option>
              </select>
            )}

            {/* View Toggle */}
            {showViewToggle && (
              <div className="hidden sm:flex border border-[var(--color-border,#e2e8f0)] rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${
                    viewMode === "grid"
                      ? "bg-[var(--color-primary,#e31937)] text-white"
                      : "bg-white text-[var(--color-muted-foreground,#64748b)]"
                  }`}
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${
                    viewMode === "list"
                      ? "bg-[var(--color-primary,#e31937)] text-white"
                      : "bg-white text-[var(--color-muted-foreground,#64748b)]"
                  }`}
                  aria-label="List view"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          {filterPosition === "left" && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-4 bg-white rounded-xl border border-[var(--color-border,#e2e8f0)] p-4">
                <FilterSidebar />
              </div>
            </aside>
          )}

          {/* Results */}
          <main className="flex-1">
            {/* Active Filters */}
            <ActiveFiltersDisplay />

            {/* Results Count */}
            {showResultsCount && !loading && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[var(--color-muted-foreground,#64748b)]">
                  Showing{" "}
                  <span className="font-medium text-[var(--color-foreground,#0f172a)]">
                    {equipment.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-[var(--color-foreground,#0f172a)]">
                    {totalHits}
                  </span>{" "}
                  products
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && equipment.length === 0 && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--color-border,#e2e8f0)] border-t-[var(--color-primary,#e31937)]" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12 px-4 bg-red-50 rounded-xl">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Equipment Grid */}
            {!error && equipment.length > 0 && (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? `grid ${gridCols[columns]} gap-6`
                      : "flex flex-col gap-4"
                  }
                >
                  {equipment.map((item) => (
                    <EquipmentCard
                      key={item.objectId}
                      id={item.id}
                      imageUrl={item.imageUrl}
                      brand={item.brand}
                      model={item.model}
                      name={item.name}
                      category={item.category}
                      spec1={
                        item.specs.workingHeight
                          ? `Working Height: ${item.specs.workingHeight}`
                          : item.specs.capacity
                          ? `Capacity: ${item.specs.capacity}`
                          : ""
                      }
                      spec2={
                        item.specs.horizontalReach
                          ? `Reach: ${item.specs.horizontalReach}`
                          : ""
                      }
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
                      className="px-8 py-3 font-medium border-2 border-[var(--color-primary,#e31937)] text-[var(--color-primary,#e31937)] rounded-lg hover:bg-[var(--color-primary,#e31937)] hover:text-white transition-colors disabled:opacity-50"
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
                <div className="w-16 h-16 bg-[var(--color-muted,#f1f5f9)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[var(--color-muted-foreground,#64748b)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-foreground,#0f172a)] mb-2">
                  No equipment found
                </h3>
                <p className="text-[var(--color-muted-foreground,#64748b)] mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 font-medium border border-[var(--color-border,#e2e8f0)] rounded-lg hover:bg-[var(--color-background-alt,#f8fafc)] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border,#e2e8f0)]">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-[var(--color-background-alt,#f8fafc)] rounded-lg"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-140px)] p-4">
              <FilterSidebar />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-border,#e2e8f0)]">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 font-medium bg-[var(--color-primary,#e31937)] text-white rounded-lg hover:bg-[var(--color-primary-hover,#c42920)] transition-colors"
              >
                Show Results ({equipment.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EquipmentSearch;
