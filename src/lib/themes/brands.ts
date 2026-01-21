/**
 * Brand Theme Definitions
 *
 * Each brand gets a complete theme object.
 * Add new brands here - they will automatically be available in Builder.io.
 */

import type { BrandTheme } from "./types";

// ============================================
// BRAND DEFINITIONS
// ============================================

export const brands: Record<string, BrandTheme> = {
  // Brand 1: Access Hire Australia (Primary Brand)
  "access-hire": {
    id: "access-hire",
    name: "Access Hire Australia",
    colors: {
      // Full brand color scale (AHA Red)
      brand: {
        50: "rgb(255 229 233)",
        100: "rgb(255 204 211)",
        200: "rgb(255 160 170)",
        300: "rgb(255 109 127)",
        400: "rgb(245 60 89)",
        500: "rgb(227 25 55)", // Primary
        600: "rgb(193 21 47)",
        700: "rgb(161 18 40)",
        800: "rgb(132 16 32)",
        900: "rgb(94 11 23)",
        950: "rgb(94 11 23)",
      },

      // Semantic colors with hover states
      primary: "rgb(227 25 55)", // brand-500
      primaryHover: "rgb(132 16 32)", // brand-800
      primaryForeground: "rgb(255 229 233)", // brand-50

      secondary: "rgb(30 41 59)", // slate-800
      secondaryHover: "rgb(15 23 42)", // slate-900
      secondaryForeground: "rgb(248 250 252)", // slate-50

      accent: "rgb(30 41 59)", // slate-800
      accentForeground: "rgb(255 255 255)",

      // Backgrounds
      background: "rgb(255 255 255)",
      backgroundAlt: "rgb(255 255 255)", // white
      card: "rgb(255 255 255)",
      cardForeground: "rgb(15 23 42)", // slate-900

      // Header/Footer (Access Hire: white header, red footer)
      header: "rgb(255 255 255)",        // white
      headerForeground: "rgb(15 23 42)", // dark text
      footer: "rgb(227 25 55)",          // brand red
      footerForeground: "rgb(255 255 255)", // white text

      // Text
      foreground: "rgb(15 23 42)", // slate-900
      mutedForeground: "rgb(100 116 139)", // slate-500

      // Borders
      border: "rgb(226 232 240)", // slate-200
      input: "rgb(226 232 240)", // slate-200
      ring: "rgb(227 25 55)", // brand-500

      // Semantic status
      success: "rgb(34 197 94)", // green-500
      successHover: "rgb(22 163 74)", // green-600
      warning: "rgb(245 158 11)", // amber-500
      error: "rgb(239 68 68)", // red-500
      errorHover: "rgb(220 38 38)", // red-600

      // Equipment brand colors
      equipmentBrands: {
        genie: "#0064a7",
        jlg: "#f37123",
        haulotte: "#f1bd4b",
        skyjack: "#e41e26",
        snorkel: "#ff8200",
        lgmg: "#00a651",
        dingli: "#003da5",
        manitou: "#b22234",
        zoomlion: "#009b4c",
        sunward: "#ffc72c",
        niftylift: "#00a3e0",
        aichi: "#e60012",
        tadano: "#004c97",
        sinoboom: "#ed1c24",
        xcmg: "#ffc20e",
        bobcat: "#ff6600",
        jcb: "#ffc107",
        merlo: "#004d40",
        magni: "#00529f",
        faresin: "#e30613",
        almac: "#005bac",
        airo: "#0072bc",
        atrium: "#1a1a1a",
        klubb: "#00a0dc",
        palfinger: "#e30614",
      },
    },
    fonts: {
      heading: "'Lato', system-ui, sans-serif",
      body: "'Roboto', system-ui, sans-serif",
      mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
    },
    spacing: {
      radius: "8px",
      radiusSm: "4px",
      radiusLg: "12px",
    },
    assets: {
      logoUrl: "/images/brand/access-hire-logo.webp",
      logoUrlDark: "/images/brand/access-hire-logo-white.webp",
    },
  },

  // Brand 2: Access Express (Secondary Brand)
  "access-express": {
    id: "access-express",
    name: "Access Express",
    colors: {
      // Full brand color scale (Deep Navy Blue)
      brand: {
        50: "rgb(232 242 250)",   // Lightest
        100: "rgb(192 216 236)",
        200: "rgb(138 176 212)",
        300: "rgb(90 132 176)",
        400: "rgb(58 100 144)",
        500: "rgb(35 74 114)",    // Mid
        600: "rgb(26 58 92)",     // #1a3a5c
        700: "rgb(18 42 74)",     // #122a4a
        800: "rgb(13 30 54)",     // #0d1e36
        900: "rgb(10 22 40)",     // #0a1628 - Primary dark
        950: "rgb(5 12 20)",      // Darkest
      },

      // Semantic colors - Navy/Black as primary
      primary: "rgb(10 22 40)",        // Navy/black #0a1628
      primaryHover: "rgb(18 42 74)",   // Lighter navy on hover
      primaryForeground: "rgb(255 255 255)",

      // Orange as secondary (for special CTAs)
      secondary: "rgb(245 166 35)",    // Orange #f5a623
      secondaryHover: "rgb(212 144 30)", // Orange pressed
      secondaryForeground: "rgb(255 255 255)",

      // Blue accent for links and highlights
      accent: "rgb(0 168 232)",        // #00a8e8
      accentForeground: "rgb(255 255 255)",

      // Backgrounds - Light theme
      background: "rgb(255 255 255)",
      backgroundAlt: "rgb(250 250 250)", // neutral-50
      card: "rgb(255 255 255)",
      cardForeground: "rgb(38 38 38)",   // neutral-800

      // Header/Footer - Navy background (Access Express signature dark)
      header: "rgb(10 22 40)",           // #0a1628 - Deep Navy
      headerForeground: "rgb(255 255 255)", // white text
      footer: "rgb(10 22 40)",           // #0a1628 - Deep Navy
      footerForeground: "rgb(255 255 255)", // white text

      // Text
      foreground: "rgb(38 38 38)",       // neutral-800
      mutedForeground: "rgb(115 115 115)", // neutral-500

      // Borders
      border: "rgb(229 229 229)",        // neutral-200
      input: "rgb(212 212 212)",         // neutral-300
      ring: "rgb(0 168 232)",            // accent blue for focus

      // Semantic status
      success: "rgb(34 197 94)",         // green-500
      successHover: "rgb(22 163 74)",    // green-600
      warning: "rgb(245 158 11)",        // amber-500
      error: "rgb(239 68 68)",           // red-500
      errorHover: "rgb(220 38 38)",      // red-600

      // Equipment brand colors (shared with AHA)
      equipmentBrands: {
        genie: "#0064a7",
        jlg: "#f37123",
        haulotte: "#f1bd4b",
        skyjack: "#e41e26",
        snorkel: "#ff8200",
        lgmg: "#00a651",
        dingli: "#003da5",
        manitou: "#b22234",
        bobcat: "#ff6600",
        jcb: "#ffc107",
        merlo: "#004d40",
        toyota: "#eb0a1e",
        hyster: "#ff6600",
        crown: "#00529f",
      },
    },
    fonts: {
      heading: "'Montserrat', system-ui, sans-serif",
      body: "'Open Sans', system-ui, sans-serif",
      mono: "'Fira Code', 'Consolas', monospace",
    },
    spacing: {
      radius: "8px",     // Default for buttons, inputs
      radiusSm: "4px",   // Subtle corners
      radiusLg: "12px",  // Cards
    },
    assets: {
      logoUrl: "/images/logos/ae-logo-white.png",  // White logo for dark header
      logoUrlDark: "/images/logos/ae-logo-white.png",
    },
  },

  // Brand 3: Example Blue Brand
  "brand-blue": {
    id: "brand-blue",
    name: "Blue Corp",
    colors: {
      brand: {
        50: "rgb(239 246 255)",
        100: "rgb(219 234 254)",
        200: "rgb(191 219 254)",
        300: "rgb(147 197 253)",
        400: "rgb(96 165 250)",
        500: "rgb(59 130 246)",
        600: "rgb(37 99 235)",
        700: "rgb(29 78 216)",
        800: "rgb(30 64 175)",
        900: "rgb(30 58 138)",
        950: "rgb(23 37 84)",
      },
      primary: "rgb(37 99 235)",
      primaryHover: "rgb(29 78 216)",
      primaryForeground: "rgb(255 255 255)",
      secondary: "rgb(6 182 212)",
      secondaryHover: "rgb(8 145 178)",
      secondaryForeground: "rgb(255 255 255)",
      accent: "rgb(6 182 212)",
      accentForeground: "rgb(255 255 255)",
      background: "rgb(255 255 255)",
      backgroundAlt: "rgb(240 249 255)",
      card: "rgb(255 255 255)",
      cardForeground: "rgb(15 23 42)",
      foreground: "rgb(15 23 42)",
      mutedForeground: "rgb(100 116 139)",
      border: "rgb(226 232 240)",
      input: "rgb(226 232 240)",
      ring: "rgb(37 99 235)",
      success: "rgb(34 197 94)",
      successHover: "rgb(22 163 74)",
      warning: "rgb(245 158 11)",
      error: "rgb(239 68 68)",
      errorHover: "rgb(220 38 38)",
    },
    fonts: {
      heading: "'Lato', system-ui, sans-serif",
      body: "'Roboto', system-ui, sans-serif",
      mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
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
      brand: {
        50: "rgb(240 253 244)",
        100: "rgb(220 252 231)",
        200: "rgb(187 247 208)",
        300: "rgb(134 239 172)",
        400: "rgb(74 222 128)",
        500: "rgb(34 197 94)",
        600: "rgb(22 163 74)",
        700: "rgb(21 128 61)",
        800: "rgb(22 101 52)",
        900: "rgb(20 83 45)",
        950: "rgb(5 46 22)",
      },
      primary: "rgb(22 163 74)",
      primaryHover: "rgb(21 128 61)",
      primaryForeground: "rgb(255 255 255)",
      secondary: "rgb(132 204 22)",
      secondaryHover: "rgb(101 163 13)",
      secondaryForeground: "rgb(255 255 255)",
      accent: "rgb(132 204 22)",
      accentForeground: "rgb(255 255 255)",
      background: "rgb(255 255 255)",
      backgroundAlt: "rgb(240 253 244)",
      card: "rgb(255 255 255)",
      cardForeground: "rgb(20 83 45)",
      foreground: "rgb(20 83 45)",
      mutedForeground: "rgb(75 85 99)",
      border: "rgb(209 213 219)",
      input: "rgb(209 213 219)",
      ring: "rgb(22 163 74)",
      success: "rgb(34 197 94)",
      successHover: "rgb(22 163 74)",
      warning: "rgb(245 158 11)",
      error: "rgb(239 68 68)",
      errorHover: "rgb(220 38 38)",
    },
    fonts: {
      heading: "'Lato', system-ui, sans-serif",
      body: "'Roboto', system-ui, sans-serif",
      mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
    },
    spacing: {
      radius: "4px",
      radiusSm: "2px",
      radiusLg: "8px",
    },
  },
};

// ============================================
// DEFAULT BRAND (Access Hire Australia)
// ============================================

export const defaultBrand: BrandTheme = brands["access-hire"];

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
