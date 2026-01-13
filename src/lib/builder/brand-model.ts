/**
 * Builder.io Brand Data Model Integration
 *
 * This file defines the structure for brands stored in Builder.io
 * and utilities for fetching/using them.
 */

import type { BrandTheme, BrandColors, BrandFonts, BrandSpacing } from "../themes/types";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

/**
 * Brand model as stored in Builder.io
 * This matches the fields you'll create in Builder.io's Brand data model
 */
export interface BuilderBrand {
  // Core identity
  id: string;
  name: string;
  slug: string;

  // Assets
  logoUrl?: string;
  logoUrlDark?: string; // For dark backgrounds
  faviconUrl?: string;

  // Theme colors (stored as individual fields in Builder for easy editing)
  colorPrimary: string;
  colorPrimaryDark: string;
  colorPrimaryForeground: string;
  colorAccent: string;
  colorAccentForeground: string;
  colorBackground: string;
  colorBackgroundAlt: string;
  colorCard: string;
  colorForeground: string;
  colorMutedForeground: string;
  colorBorder: string;
  colorInput: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;

  // Typography
  fontHeading: string;
  fontBody: string;

  // Spacing
  radius: string;
  radiusSm: string;
  radiusLg: string;
}

/**
 * Convert Builder.io brand data to our BrandTheme format
 */
export function builderBrandToTheme(brand: BuilderBrand): BrandTheme {
  return {
    id: brand.id,
    name: brand.name,
    colors: {
      primary: brand.colorPrimary,
      primaryDark: brand.colorPrimaryDark,
      primaryForeground: brand.colorPrimaryForeground,
      accent: brand.colorAccent,
      accentForeground: brand.colorAccentForeground,
      background: brand.colorBackground,
      backgroundAlt: brand.colorBackgroundAlt,
      card: brand.colorCard,
      foreground: brand.colorForeground,
      mutedForeground: brand.colorMutedForeground,
      border: brand.colorBorder,
      input: brand.colorInput,
      success: brand.colorSuccess,
      warning: brand.colorWarning,
      error: brand.colorError,
    },
    fonts: {
      heading: brand.fontHeading,
      body: brand.fontBody,
    },
    spacing: {
      radius: brand.radius,
      radiusSm: brand.radiusSm,
      radiusLg: brand.radiusLg,
    },
  };
}

/**
 * Fetch a single brand from Builder.io by slug
 */
export async function fetchBrand(slug: string): Promise<BuilderBrand | null> {
  try {
    const response = await fetch(
      `https://cdn.builder.io/api/v3/content/brand?apiKey=${BUILDER_API_KEY}&query.data.slug=${slug}&limit=1`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.results?.[0]?.data || null;
  } catch (error) {
    console.error("Error fetching brand:", error);
    return null;
  }
}

/**
 * Fetch all brands from Builder.io
 */
export async function fetchAllBrands(): Promise<BuilderBrand[]> {
  try {
    const response = await fetch(
      `https://cdn.builder.io/api/v3/content/brand?apiKey=${BUILDER_API_KEY}&limit=100`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.results?.map((r: { data: BuilderBrand }) => r.data) || [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

/**
 * Fetch brand by Builder.io entry ID (for reference fields)
 */
export async function fetchBrandById(entryId: string): Promise<BuilderBrand | null> {
  try {
    const response = await fetch(
      `https://cdn.builder.io/api/v3/content/brand/${entryId}?apiKey=${BUILDER_API_KEY}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Error fetching brand by ID:", error);
    return null;
  }
}

/**
 * Get brand theme from Builder.io content
 * Handles both direct brandId and reference field structures
 */
export async function getBrandThemeFromContent(
  content: { data?: { brandId?: string; brand?: { id?: string; value?: { data?: BuilderBrand } } } } | null
): Promise<BrandTheme | null> {
  if (!content?.data) return null;

  // Check for inline brand data (reference field with value populated)
  if (content.data.brand?.value?.data) {
    return builderBrandToTheme(content.data.brand.value.data);
  }

  // Check for brand reference ID
  if (content.data.brand?.id) {
    const brand = await fetchBrandById(content.data.brand.id);
    if (brand) return builderBrandToTheme(brand);
  }

  // Check for simple brandId string
  if (content.data.brandId) {
    const brand = await fetchBrand(content.data.brandId);
    if (brand) return builderBrandToTheme(brand);
  }

  return null;
}
