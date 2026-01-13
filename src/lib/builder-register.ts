"use client";

/**
 * Builder.io Component Registration (Client-side)
 *
 * This file registers components with Builder.io's visual editor.
 * It must run on the client side only.
 */

import { register } from "@builder.io/sdk-react-nextjs";

// Register Data Sources for Builder.io data panel
register("dataSource", {
  name: "Products API",
  description: "Equipment products from the live API",
  // Default API endpoint
  url: "https://acccessproducts.netlify.app/api/products",
  // Define the data schema for binding
  schema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        category: { type: "string" },
        subcategory: { type: "string" },
        fuel_type: { type: "string" },
        model: { type: "string" },
        image_url: { type: "string" },
        slug: { type: "string" },
        specs: {
          type: "object",
          properties: {
            reach: { type: "string" },
            height: { type: "string" },
            capacity: { type: "string" },
          },
        },
        pricing: {
          type: "object",
          properties: {
            daily: { type: "number" },
            weekly: { type: "number" },
            monthly: { type: "number" },
          },
        },
      },
    },
  },
});

// Register Design Tokens with Builder.io visual editor
register("editor.settings", {
  designTokens: {
    colors: [
      { name: "Primary", value: "var(--color-primary, #0f172a)" },
      { name: "Primary Dark", value: "var(--color-primary-dark, #020617)" },
      { name: "Primary Foreground", value: "var(--color-primary-foreground, #f8fafc)" },
      { name: "Accent", value: "var(--color-accent, #3b82f6)" },
      { name: "Accent Foreground", value: "var(--color-accent-foreground, #ffffff)" },
      { name: "Background", value: "var(--color-background, #ffffff)" },
      { name: "Background Alt", value: "var(--color-background-alt, #f3f4f6)" },
      { name: "Foreground", value: "var(--color-foreground, #020617)" },
      { name: "Muted Foreground", value: "var(--color-muted-foreground, #64748b)" },
      { name: "Border", value: "var(--color-border, #e2e8f0)" },
      { name: "Success", value: "var(--color-success, #22c55e)" },
      { name: "Warning", value: "var(--color-warning, #f59e0b)" },
      { name: "Error", value: "var(--color-error, #ef4444)" },
    ],
    spacing: [
      { name: "XS", value: "4px" },
      { name: "SM", value: "8px" },
      { name: "MD", value: "16px" },
      { name: "LG", value: "24px" },
      { name: "XL", value: "32px" },
      { name: "2XL", value: "48px" },
    ],
    fontFamily: [
      { name: "Heading", value: "var(--font-heading, 'Inter', system-ui, sans-serif)" },
      { name: "Body", value: "var(--font-body, 'Inter', system-ui, sans-serif)" },
    ],
    fontSize: [
      { name: "XS", value: "12px" },
      { name: "SM", value: "14px" },
      { name: "Base", value: "16px" },
      { name: "LG", value: "18px" },
      { name: "XL", value: "20px" },
      { name: "2XL", value: "24px" },
      { name: "3XL", value: "30px" },
      { name: "4XL", value: "36px" },
    ],
    borderRadius: [
      { name: "None", value: "0" },
      { name: "SM", value: "var(--radius-sm, 4px)" },
      { name: "Default", value: "var(--radius, 8px)" },
      { name: "LG", value: "var(--radius-lg, 12px)" },
      { name: "Full", value: "9999px" },
    ],
  },
});
import { CategoryHeroCC } from "../components/builder/CategoryHeroCC";
import {
  LPHeader,
  LPHero,
  LPTrustBadges,
  LPBenefits,
  LPProductsGrid,
  LPTestimonials,
  LPQuoteForm,
  LPFaq,
  LPCtaBanner,
  LPFooter,
  LPBreadcrumb,
  LPStickyForm,
  LPStickyBottomCTA,
  LPFilterBar,
  LPFilterChips,
  LPQuoteModal,
  LPTrustScroll,
  LPLoadMore,
} from "../components/builder/lp";
import {
  FigmaButton,
  FigmaInput,
  FigmaDialog,
  FigmaProductCard,
  FigmaProductCardAPI,
  FigmaProductGrid,
  FigmaHero,
} from "../components/builder/figma";

// Product options cache for dropdown
let productOptionsCache: Array<{ label: string; value: string }> = [];

async function fetchProductOptions(): Promise<Array<{ label: string; value: string }>> {
  if (productOptionsCache.length > 0) return productOptionsCache;

  try {
    const response = await fetch("https://acccessproducts.netlify.app/api/products");
    const products = await response.json();
    const productList = Array.isArray(products) ? products : products.products || [];

    productOptionsCache = productList.map((p: { productId: string; model: string; category?: string }) => ({
      label: `${p.model}${p.category ? ` (${p.category})` : ""}`,
      value: p.productId,
    }));

    return productOptionsCache;
  } catch (error) {
    console.error("Failed to fetch products for dropdown:", error);
    return [];
  }
}

// Only register on client side
if (typeof window !== "undefined") {
  // Fetch products for dropdown, then register components
  fetchProductOptions().then((productOptions) => {
    // Figma Components
    register("editor.component", {
      name: "FigmaButton",
      friendlyName: "Figma - Button",
      component: FigmaButton,
    });

    register("editor.component", {
      name: "FigmaInput",
      friendlyName: "Figma - Input Field",
      component: FigmaInput,
    });

    register("editor.component", {
      name: "FigmaDialog",
      friendlyName: "Figma - Dialog/Modal",
      component: FigmaDialog,
    });

    register("editor.component", {
      name: "FigmaProductCard",
      friendlyName: "Figma - Product Card",
      component: FigmaProductCard,
    });

    register("editor.component", {
      name: "FigmaProductCardAPI",
      friendlyName: "Figma - Product Card (API Picker)",
      component: FigmaProductCardAPI,
      inputs: [
        {
          name: "productId",
          type: "string",
          friendlyName: "Select Product",
          helperText: "Choose a product from the API",
          required: true,
          enum: productOptions.length > 0 ? productOptions : undefined,
        },
        {
          name: "ctaText",
          type: "string",
          defaultValue: "View Details",
          friendlyName: "CTA Text",
        },
        {
          name: "productBaseUrl",
          type: "string",
          defaultValue: "/equipment",
          friendlyName: "Product Base URL",
          advanced: true,
        },
        {
          name: "showBrandLogo",
          type: "boolean",
          defaultValue: false,
          friendlyName: "Show Brand Logo",
        },
        {
          name: "brandLogoUrl",
          type: "file",
          allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"],
          friendlyName: "Brand Logo",
        },
      ],
    });

    register("editor.component", {
      name: "FigmaProductGrid",
      friendlyName: "Figma - Product Grid (API)",
      component: FigmaProductGrid,
    });

    register("editor.component", {
      name: "FigmaHero",
      friendlyName: "Figma - Hero Section",
      component: FigmaHero,
    });

    // LP Components
    register("editor.component", {
      name: "CategoryHeroCC",
      friendlyName: "Category Hero (CLG-39)",
      component: CategoryHeroCC,
    });

    register("editor.component", {
      name: "LPHeader",
      friendlyName: "LP - Header",
      component: LPHeader,
    });

    register("editor.component", {
      name: "LPHero",
      friendlyName: "LP - Hero Section",
      component: LPHero,
    });

    register("editor.component", {
      name: "LPTrustBadges",
      friendlyName: "LP - Trust Badges / Stats",
      component: LPTrustBadges,
    });

    register("editor.component", {
      name: "LPBenefits",
      friendlyName: "LP - Benefits Grid",
      component: LPBenefits,
    });

    register("editor.component", {
      name: "LPProductsGrid",
      friendlyName: "LP - Products Grid",
      component: LPProductsGrid,
    });

    register("editor.component", {
      name: "LPTestimonials",
      friendlyName: "LP - Testimonials",
      component: LPTestimonials,
    });

    register("editor.component", {
      name: "LPQuoteForm",
      friendlyName: "LP - Quote Form",
      component: LPQuoteForm,
    });

    register("editor.component", {
      name: "LPFaq",
      friendlyName: "LP - FAQ Accordion",
      component: LPFaq,
    });

    register("editor.component", {
      name: "LPCtaBanner",
      friendlyName: "LP - CTA Banner",
      component: LPCtaBanner,
    });

    register("editor.component", {
      name: "LPFooter",
      friendlyName: "LP - Footer",
      component: LPFooter,
    });

    register("editor.component", {
      name: "LPBreadcrumb",
      friendlyName: "LP - Breadcrumb",
      component: LPBreadcrumb,
    });

    register("editor.component", {
      name: "LPStickyForm",
      friendlyName: "LP - Sticky Sidebar Form",
      component: LPStickyForm,
    });

    // Mobile-specific components
    register("editor.component", {
      name: "LPStickyBottomCTA",
      friendlyName: "LP - Sticky Bottom CTA (Mobile)",
      component: LPStickyBottomCTA,
    });

    register("editor.component", {
      name: "LPFilterBar",
      friendlyName: "LP - Filter Bar (Desktop)",
      component: LPFilterBar,
    });

    register("editor.component", {
      name: "LPFilterChips",
      friendlyName: "LP - Filter Chips (Mobile)",
      component: LPFilterChips,
    });

    register("editor.component", {
      name: "LPQuoteModal",
      friendlyName: "LP - Quote Modal (Mobile)",
      component: LPQuoteModal,
    });

    register("editor.component", {
      name: "LPTrustScroll",
      friendlyName: "LP - Trust Scroll (Mobile)",
      component: LPTrustScroll,
    });

    register("editor.component", {
      name: "LPLoadMore",
      friendlyName: "LP - Load More Button",
      component: LPLoadMore,
    });
  });
}

export {};
