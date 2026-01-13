/**
 * Brand Theme Type Definitions
 *
 * Supports up to 20+ brands with consistent token structure.
 * Tokens are aligned with Figma variables from Whitelabel Master File.
 */

export interface BrandColors {
  // Primary brand colors
  primary: string;
  primaryDark: string;
  primaryForeground: string;

  // Secondary/accent
  accent: string;
  accentForeground: string;

  // Backgrounds
  background: string;
  backgroundAlt: string;
  card: string;

  // Text
  foreground: string;
  mutedForeground: string;

  // Borders
  border: string;
  input: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
}

export interface BrandSpacing {
  radius: string;
  radiusSm: string;
  radiusLg: string;
}

export interface BrandTheme {
  id: string;
  name: string;
  colors: BrandColors;
  fonts: BrandFonts;
  spacing: BrandSpacing;
}

/**
 * Builder.io Brand Data Model shape
 * This matches what you'll create in Builder.io's Data Models
 */
export interface BuilderBrandModel {
  id: string;
  name: string;
  theme: BrandTheme;
  logoUrl?: string;
  faviconUrl?: string;
}
