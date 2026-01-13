"use client";

import { useState } from "react";

/**
 * Filter Bar - Desktop Component
 *
 * Horizontal filter bar with dropdown selects for filtering products.
 */

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  name: string;
  label: string;
  options: FilterOption[];
}

export interface LPFilterBarProps {
  /** Filter configurations */
  filters?: FilterConfig[];
  /** Show "Live API" badge */
  showApiBadge?: boolean;
  /** API badge text */
  apiBadgeText?: string;
  /** Product count to display */
  productCount?: number;
  /** Product count suffix */
  productCountSuffix?: string;
  /** Callback when filters change */
  onFilterChange?: (filters: Record<string, string>) => void;
}

const defaultFilters: FilterConfig[] = [
  {
    name: "type",
    label: "All Types",
    options: [
      { label: "All Types", value: "" },
      { label: "Counterbalance", value: "counterbalance" },
      { label: "Reach Truck", value: "reach-truck" },
      { label: "Order Picker", value: "order-picker" },
      { label: "Pallet Jack", value: "pallet-jack" },
    ],
  },
  {
    name: "capacity",
    label: "All Capacities",
    options: [
      { label: "All Capacities", value: "" },
      { label: "1-2.5T", value: "0-2.5" },
      { label: "2.5-5T", value: "2.5-5" },
      { label: "5-10T", value: "5-10" },
      { label: "10T+", value: "10+" },
    ],
  },
];

export function LPFilterBar({
  filters = defaultFilters,
  showApiBadge = true,
  apiBadgeText = "Live API",
  productCount,
  productCountSuffix = "products",
  onFilterChange,
}: LPFilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );

  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...activeFilters, [name]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="bg-white rounded-lg p-4 flex flex-wrap items-center gap-4">
      <span className="text-sm font-semibold text-[var(--color-foreground,#1A1A1A)]">
        Filter by:
      </span>

      {filters.map((filter) => (
        <select
          key={filter.name}
          value={activeFilters[filter.name] || ""}
          onChange={(e) => handleFilterChange(filter.name, e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--color-primary,#E63229)] focus:border-[var(--color-primary,#E63229)] outline-none"
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {showApiBadge && (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {apiBadgeText}
        </span>
      )}

      {productCount !== undefined && (
        <span className="ml-auto text-sm text-[var(--color-muted-foreground,#6B7280)]">
          {productCount} {productCountSuffix}
        </span>
      )}
    </div>
  );
}
