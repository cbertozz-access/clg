/**
 * Brand Theme Definitions
 *
 * Each brand gets a complete theme object.
 * Add new brands here - they will automatically be available in Builder.io.
 */

import type { BrandTheme } from "./types";

// ============================================
// DEFAULT / FALLBACK BRAND
// ============================================

export const defaultBrand: BrandTheme = {
  id: "default",
  name: "Default",
  colors: {
    primary: "#0f172a",
    primaryDark: "#020617",
    primaryForeground: "#f8fafc",
    accent: "#3b82f6",
    accentForeground: "#ffffff",
    background: "#ffffff",
    backgroundAlt: "#f3f4f6",
    card: "#ffffff",
    foreground: "#020617",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    input: "#e2e8f0",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  fonts: {
    heading: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  spacing: {
    radius: "8px",
    radiusSm: "4px",
    radiusLg: "12px",
  },
};

// ============================================
// BRAND DEFINITIONS
// ============================================

export const brands: Record<string, BrandTheme> = {
  // Brand 1: Access Hire (original)
  "access-hire": {
    id: "access-hire",
    name: "Access Hire",
    colors: {
      primary: "#E63229",
      primaryDark: "#C42920",
      primaryForeground: "#ffffff",
      accent: "#1A1A1A",
      accentForeground: "#ffffff",
      background: "#ffffff",
      backgroundAlt: "#f3f4f6",
      card: "#ffffff",
      foreground: "#1A1A1A",
      mutedForeground: "#6B7280",
      border: "#e5e7eb",
      input: "#e5e7eb",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    fonts: {
      heading: "'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
    },
    spacing: {
      radius: "8px",
      radiusSm: "4px",
      radiusLg: "12px",
    },
  },

  // Brand 2: Example Blue Brand
  "brand-blue": {
    id: "brand-blue",
    name: "Blue Corp",
    colors: {
      primary: "#2563eb",
      primaryDark: "#1d4ed8",
      primaryForeground: "#ffffff",
      accent: "#06b6d4",
      accentForeground: "#ffffff",
      background: "#ffffff",
      backgroundAlt: "#f0f9ff",
      card: "#ffffff",
      foreground: "#0f172a",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      input: "#e2e8f0",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    fonts: {
      heading: "'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
    },
    spacing: {
      radius: "6px",
      radiusSm: "4px",
      radiusLg: "10px",
    },
  },

  // Brand 3: Example Green Brand
  "brand-green": {
    id: "brand-green",
    name: "Green Solutions",
    colors: {
      primary: "#16a34a",
      primaryDark: "#15803d",
      primaryForeground: "#ffffff",
      accent: "#84cc16",
      accentForeground: "#ffffff",
      background: "#ffffff",
      backgroundAlt: "#f0fdf4",
      card: "#ffffff",
      foreground: "#14532d",
      mutedForeground: "#4b5563",
      border: "#d1d5db",
      input: "#d1d5db",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    fonts: {
      heading: "'Roboto', system-ui, sans-serif",
      body: "'Roboto', system-ui, sans-serif",
    },
    spacing: {
      radius: "4px",
      radiusSm: "2px",
      radiusLg: "8px",
    },
  },

  // Add more brands as needed...
  // Template for new brand:
  /*
  "brand-id": {
    id: "brand-id",
    name: "Brand Name",
    colors: {
      primary: "#000000",
      primaryDark: "#000000",
      primaryForeground: "#ffffff",
      accent: "#000000",
      accentForeground: "#ffffff",
      background: "#ffffff",
      backgroundAlt: "#f3f4f6",
      card: "#ffffff",
      foreground: "#000000",
      mutedForeground: "#666666",
      border: "#e5e5e5",
      input: "#e5e5e5",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    fonts: {
      heading: "'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
    },
    spacing: {
      radius: "8px",
      radiusSm: "4px",
      radiusLg: "12px",
    },
  },
  */
};

/**
 * Get a brand by ID with fallback to default
 */
export function getBrand(brandId: string | undefined): BrandTheme {
  if (!brandId) return defaultBrand;
  return brands[brandId] ?? defaultBrand;
}

/**
 * Get list of all available brands (for Builder.io enum)
 */
export function getAllBrandIds(): string[] {
  return Object.keys(brands);
}

/**
 * Get brands as options for Builder.io select input
 */
export function getBrandOptions(): Array<{ label: string; value: string }> {
  return Object.values(brands).map((brand) => ({
    label: brand.name,
    value: brand.id,
  }));
}
