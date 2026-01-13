/**
 * Landing Page Design Tokens
 *
 * DEPRECATED: Use src/lib/themes instead for multi-brand support.
 * This file is kept for backwards compatibility.
 *
 * For new components, use CSS variables:
 * - bg-[var(--color-primary)] instead of bg-[#E63229]
 * - text-[var(--color-foreground)] instead of text-[#1A1A1A]
 */

export const lpTheme = {
  colors: {
    // Primary - USE var(--color-primary) INSTEAD
    accessRed: "var(--color-primary)",
    accessRedDark: "var(--color-primary-dark)",

    // Neutrals - USE CSS VARIABLES INSTEAD
    accessBlack: "var(--color-foreground)",
    accessGray: "var(--color-muted-foreground)",
    accessLight: "var(--color-background-alt)",
    white: "var(--color-background)",

    // Semantic
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
  },

  fonts: {
    sans: "var(--font-body)",
  },

  spacing: {
    section: {
      py: "py-16",
      px: "px-4",
    },
    container: "max-w-7xl mx-auto",
  },

  borderRadius: {
    sm: "rounded-[var(--radius-sm)]",
    md: "rounded-[var(--radius)]",
    lg: "rounded-[var(--radius-lg)]",
    xl: "rounded-2xl",
    full: "rounded-full",
  },
} as const;

/**
 * Tailwind class utilities - THEME-AWARE VERSION
 * These use CSS variables and will adapt to the active brand
 */
export const lpClasses = {
  // Buttons - Theme-aware
  buttonPrimary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-primary-foreground)] px-8 py-4 rounded-[var(--radius)] font-semibold transition-colors",
  buttonSecondary: "bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-[var(--radius)] font-semibold transition-colors",
  buttonOutline: "border border-[var(--color-border)] hover:bg-[var(--color-background-alt)] text-[var(--color-foreground)] px-8 py-4 rounded-[var(--radius)] font-semibold transition-colors",

  // Inputs - Theme-aware
  input: "w-full px-4 py-3 border border-[var(--color-input)] rounded-[var(--radius-sm)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all",
  select: "w-full px-4 py-3 border border-[var(--color-input)] rounded-[var(--radius-sm)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all bg-[var(--color-background)]",

  // Text
  heading1: "text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-foreground)]",
  heading2: "text-3xl font-bold text-[var(--color-foreground)]",
  heading3: "text-xl font-bold text-[var(--color-foreground)]",
  body: "text-base text-[var(--color-foreground)]",
  bodySmall: "text-sm text-[var(--color-muted-foreground)]",

  // Layout
  section: "py-16",
  container: "max-w-7xl mx-auto px-4",
} as const;
