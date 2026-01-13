"use client";

import { createContext, useContext, useMemo } from "react";
import type { BrandTheme } from "@/lib/themes/types";
import { getBrand, defaultBrand } from "@/lib/themes/brands";
import { generateCssVariablesObject } from "@/lib/themes/css-variables";

interface ThemeContextValue {
  brand: BrandTheme;
  brandId: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  brand: defaultBrand,
  brandId: "default",
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  /** Brand ID to look up from local brands.ts */
  brandId?: string;
  /** Full brand theme object (from Builder.io) - takes precedence over brandId */
  theme?: BrandTheme | null;
  children: React.ReactNode;
}

/**
 * ThemeProvider
 *
 * Wraps content with brand-specific CSS variables.
 * Supports two modes:
 * 1. brandId - looks up theme from local brands.ts
 * 2. theme - uses a full BrandTheme object (from Builder.io data model)
 *
 * @example
 * // With brandId (local lookup)
 * <ThemeProvider brandId="access-hire">
 *   <BuilderContent content={content} />
 * </ThemeProvider>
 *
 * @example
 * // With theme from Builder.io
 * const theme = await getBrandThemeFromContent(content);
 * <ThemeProvider theme={theme}>
 *   <BuilderContent content={content} />
 * </ThemeProvider>
 */
export function ThemeProvider({ brandId, theme, children }: ThemeProviderProps) {
  // Use provided theme, or fall back to local brand lookup
  const brand = useMemo(() => {
    if (theme) return theme;
    return getBrand(brandId);
  }, [theme, brandId]);

  const cssVariables = useMemo(
    () => generateCssVariablesObject(brand),
    [brand]
  );

  const contextValue = useMemo(
    () => ({
      brand,
      brandId: brand.id,
    }),
    [brand]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        style={cssVariables as React.CSSProperties}
        className="contents"
        data-brand={brand.id}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/**
 * Server-side helper to get CSS variables for SSR
 * Use this when you need to inject variables in a server component
 */
export function getServerThemeStyles(brandId?: string): string {
  const brand = getBrand(brandId);
  const vars = generateCssVariablesObject(brand);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}
