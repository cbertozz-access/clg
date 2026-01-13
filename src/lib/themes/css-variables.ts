/**
 * CSS Variables Generator
 *
 * Converts brand theme objects into CSS custom properties.
 * These are injected at runtime based on the active brand.
 */

import type { BrandTheme } from "./types";

/**
 * Generate CSS variables string from a brand theme
 */
export function generateCssVariables(theme: BrandTheme): string {
  return `
    --color-primary: ${theme.colors.primary};
    --color-primary-dark: ${theme.colors.primaryDark};
    --color-primary-foreground: ${theme.colors.primaryForeground};
    --color-accent: ${theme.colors.accent};
    --color-accent-foreground: ${theme.colors.accentForeground};
    --color-background: ${theme.colors.background};
    --color-background-alt: ${theme.colors.backgroundAlt};
    --color-card: ${theme.colors.card};
    --color-foreground: ${theme.colors.foreground};
    --color-muted-foreground: ${theme.colors.mutedForeground};
    --color-border: ${theme.colors.border};
    --color-input: ${theme.colors.input};
    --color-success: ${theme.colors.success};
    --color-warning: ${theme.colors.warning};
    --color-error: ${theme.colors.error};
    --font-heading: ${theme.fonts.heading};
    --font-body: ${theme.fonts.body};
    --radius: ${theme.spacing.radius};
    --radius-sm: ${theme.spacing.radiusSm};
    --radius-lg: ${theme.spacing.radiusLg};
  `.trim();
}

/**
 * Generate CSS variables as a style object (for inline styles)
 */
export function generateCssVariablesObject(
  theme: BrandTheme
): Record<string, string> {
  return {
    "--color-primary": theme.colors.primary,
    "--color-primary-dark": theme.colors.primaryDark,
    "--color-primary-foreground": theme.colors.primaryForeground,
    "--color-accent": theme.colors.accent,
    "--color-accent-foreground": theme.colors.accentForeground,
    "--color-background": theme.colors.background,
    "--color-background-alt": theme.colors.backgroundAlt,
    "--color-card": theme.colors.card,
    "--color-foreground": theme.colors.foreground,
    "--color-muted-foreground": theme.colors.mutedForeground,
    "--color-border": theme.colors.border,
    "--color-input": theme.colors.input,
    "--color-success": theme.colors.success,
    "--color-warning": theme.colors.warning,
    "--color-error": theme.colors.error,
    "--font-heading": theme.fonts.heading,
    "--font-body": theme.fonts.body,
    "--radius": theme.spacing.radius,
    "--radius-sm": theme.spacing.radiusSm,
    "--radius-lg": theme.spacing.radiusLg,
  };
}

/**
 * Tailwind class mappings for common patterns
 * Use these in components instead of hardcoded colors
 */
export const themeClasses = {
  // Buttons
  buttonPrimary:
    "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-primary-foreground)]",
  buttonSecondary:
    "bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-accent-foreground)]",
  buttonOutline:
    "border border-[var(--color-border)] hover:bg-[var(--color-background-alt)] text-[var(--color-foreground)]",
  buttonGhost:
    "hover:bg-[var(--color-background-alt)] text-[var(--color-foreground)]",

  // Inputs
  input:
    "border border-[var(--color-input)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-[var(--radius-sm)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]",

  // Cards
  card: "bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius)]",

  // Text
  heading: "text-[var(--color-foreground)] font-[var(--font-heading)]",
  body: "text-[var(--color-foreground)] font-[var(--font-body)]",
  muted: "text-[var(--color-muted-foreground)]",

  // Backgrounds
  bgPrimary: "bg-[var(--color-primary)]",
  bgAlt: "bg-[var(--color-background-alt)]",

  // Highlight
  textPrimary: "text-[var(--color-primary)]",
} as const;
