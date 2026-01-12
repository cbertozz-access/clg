/**
 * Landing Page Design Tokens
 *
 * Consistent design system for all LP components.
 * Based on Access Group brand guidelines.
 */

export const lpTheme = {
  colors: {
    // Primary
    accessRed: "#E63229",
    accessRedDark: "#C42920",

    // Neutrals
    accessBlack: "#1A1A1A",
    accessGray: "#6B7280",
    accessLight: "#F3F4F6",
    white: "#FFFFFF",

    // Semantic
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  fonts: {
    sans: "'Inter', system-ui, sans-serif",
  },

  spacing: {
    section: {
      py: "py-16",
      px: "px-4",
    },
    container: "max-w-7xl mx-auto",
  },

  borderRadius: {
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
    full: "rounded-full",
  },
} as const;

// Tailwind class utilities
export const lpClasses = {
  // Buttons
  buttonPrimary: "bg-[#E63229] hover:bg-[#C42920] text-white px-8 py-4 rounded-lg font-semibold transition-colors",
  buttonSecondary: "bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-colors",
  buttonOutline: "border border-gray-300 hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold transition-colors",

  // Inputs
  input: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63229] focus:border-[#E63229] outline-none transition-all",
  select: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63229] focus:border-[#E63229] outline-none transition-all bg-white",

  // Text
  heading1: "text-4xl md:text-5xl lg:text-6xl font-bold",
  heading2: "text-3xl font-bold",
  heading3: "text-xl font-bold",
  body: "text-base",
  bodySmall: "text-sm",

  // Layout
  section: "py-16",
  container: "max-w-7xl mx-auto px-4",
} as const;
