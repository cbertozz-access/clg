"use client";

import { useState } from "react";

/**
 * Filter Chips - Mobile Component
 *
 * Horizontal scrolling filter chips/pills for mobile product filtering.
 */

export interface FilterChip {
  label: string;
  value: string;
}

export interface LPFilterChipsProps {
  /** Filter chip options */
  chips?: FilterChip[];
  /** Currently selected value */
  selectedValue?: string;
  /** Callback when selection changes */
  onSelectionChange?: (value: string) => void;
  /** Include "All" option */
  showAllOption?: boolean;
  /** "All" option label */
  allOptionLabel?: string;
}

const defaultChips: FilterChip[] = [
  { label: "Counterbalance", value: "counterbalance" },
  { label: "Reach Truck", value: "reach-truck" },
  { label: "Heavy Duty", value: "heavy-duty" },
  { label: "Warehouse", value: "warehouse" },
];

export function LPFilterChips({
  chips = defaultChips,
  selectedValue = "",
  onSelectionChange,
  showAllOption = true,
  allOptionLabel = "All",
}: LPFilterChipsProps) {
  const [selected, setSelected] = useState(selectedValue);

  const handleSelect = (value: string) => {
    setSelected(value);
    onSelectionChange?.(value);
  };

  const allChips = showAllOption
    ? [{ label: allOptionLabel, value: "" }, ...chips]
    : chips;

  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div
        className="flex gap-2 px-4 overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {allChips.map((chip) => {
          const isSelected = selected === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => handleSelect(chip.value)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full min-h-[40px] transition-colors ${
                isSelected
                  ? "bg-[var(--color-primary,#1A1A1A)] text-white"
                  : "bg-[var(--color-background-alt,#F3F4F6)] text-[var(--color-foreground,#1A1A1A)] hover:bg-gray-200"
              }`}
              style={{ scrollSnapAlign: "start" }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
