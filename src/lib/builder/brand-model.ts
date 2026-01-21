/**
 * Builder.io Brand Data Model Integration
 *
 * This file defines the structure for brands stored in Builder.io
 * and utilities for fetching/using them.
 */

import type { BrandTheme, ColorScale } from "../themes/types";
import { defaultBrand, brands } from "../themes/brands";

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

  // Brand color scale (50-950)
  colorBrand50?: string;
  colorBrand100?: string;
  colorBrand200?: string;
  colorBrand300?: string;
  colorBrand400?: string;
  colorBrand500?: string;
  colorBrand600?: string;
  colorBrand700?: string;
  colorBrand800?: string;
  colorBrand900?: string;
  colorBrand950?: string;

  // Semantic colors with hover states
  colorPrimary: string;
  colorPrimaryHover?: string;
  colorPrimaryForeground: string;

  colorSecondary?: string;
  colorSecondaryHover?: string;
  colorSecondaryForeground?: string;

  colorAccent: string;
  colorAccentForeground: string;

  // Backgrounds
  colorBackground: string;
  colorBackgroundAlt: string;
  colorCard: string;
  colorCardForeground?: string;

  // Text
  colorForeground: string;
  colorMutedForeground: string;

  // Borders
  colorBorder: string;
  colorInput: string;
  colorRing?: string;

  // Semantic status
  colorSuccess: string;
  colorSuccessHover?: string;
  colorWarning: string;
  colorError: string;
  colorErrorHover?: string;

  // Typography
  fontHeading: string;
  fontBody: string;
  fontMono?: string;

  // Spacing
  radius: string;
  radiusSm: string;
  radiusLg: string;

  // Equipment brands (optional JSON object)
  equipmentBrands?: Record<string, string>;
}

/**
 * Build a ColorScale from Builder.io brand data
 * Falls back to default brand colors if not provided
 */
function buildColorScale(brand: BuilderBrand): ColorScale {
  const defaultScale = defaultBrand.colors.brand;
  return {
    50: brand.colorBrand50 || defaultScale[50],
    100: brand.colorBrand100 || defaultScale[100],
    200: brand.colorBrand200 || defaultScale[200],
    300: brand.colorBrand300 || defaultScale[300],
    400: brand.colorBrand400 || defaultScale[400],
    500: brand.colorBrand500 || brand.colorPrimary || defaultScale[500],
    600: brand.colorBrand600 || defaultScale[600],
    700: brand.colorBrand700 || defaultScale[700],
    800: brand.colorBrand800 || brand.colorPrimaryHover || defaultScale[800],
    900: brand.colorBrand900 || defaultScale[900],
    950: brand.colorBrand950 || defaultScale[950],
  };
}

/**
 * Convert Builder.io brand data to our BrandTheme format
 */
export function builderBrandToTheme(brand: BuilderBrand): BrandTheme {
  const colorScale = buildColorScale(brand);

  return {
    id: brand.id,
    name: brand.name,
    colors: {
      brand: colorScale,

      // Semantic colors with hover states
      primary: brand.colorPrimary,
      primaryHover: brand.colorPrimaryHover || colorScale[800],
      primaryForeground: brand.colorPrimaryForeground,

      secondary: brand.colorSecondary || defaultBrand.colors.secondary,
      secondaryHover: brand.colorSecondaryHover || defaultBrand.colors.secondaryHover,
      secondaryForeground: brand.colorSecondaryForeground || defaultBrand.colors.secondaryForeground,

      accent: brand.colorAccent,
      accentForeground: brand.colorAccentForeground,

      // Backgrounds
      background: brand.colorBackground,
      backgroundAlt: brand.colorBackgroundAlt,
      card: brand.colorCard,
      cardForeground: brand.colorCardForeground || brand.colorForeground,

      // Text
      foreground: brand.colorForeground,
      mutedForeground: brand.colorMutedForeground,

      // Borders
      border: brand.colorBorder,
      input: brand.colorInput,
      ring: brand.colorRing || brand.colorPrimary,

      // Semantic status
      success: brand.colorSuccess,
      successHover: brand.colorSuccessHover || defaultBrand.colors.successHover,
      warning: brand.colorWarning,
      error: brand.colorError,
      errorHover: brand.colorErrorHover || defaultBrand.colors.errorHover,

      // Equipment brands
      equipmentBrands: brand.equipmentBrands,
    },
    fonts: {
      heading: brand.fontHeading,
      body: brand.fontBody,
      mono: brand.fontMono,
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
 * Falls back to local brands.ts definitions
 */
export async function getBrandThemeFromContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
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
    // First check local brands (from brands.ts)
    if (brands[content.data.brandId]) {
      return brands[content.data.brandId];
    }
    // Then try Builder.io brand model
    const brand = await fetchBrand(content.data.brandId);
    if (brand) return builderBrandToTheme(brand);
  }

  return null;
}

/**
 * Get list of available local brand IDs for Builder.io enum inputs
 */
export function getLocalBrandIds(): string[] {
  return Object.keys(brands);
}

/**
 * Get local brands as options for Builder.io select inputs
 */
export function getLocalBrandOptions(): Array<{ label: string; value: string }> {
  return Object.values(brands).map((brand) => ({
    label: brand.name,
    value: brand.id,
  }));
}
