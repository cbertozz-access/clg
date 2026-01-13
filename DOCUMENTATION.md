# CLG Project Documentation

> Multi-Brand Builder.io Landing Pages with Figma Component System

**Last Updated:** January 13, 2026
**Deployment:** https://clg-ten.vercel.app
**Repository:** https://github.com/cbertozz-access/clg.git

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Multi-Brand Theming System](#multi-brand-theming-system)
4. [Builder.io Integration](#builderio-integration)
5. [Component Library](#component-library)
6. [API Integration](#api-integration)
7. [Key Files Reference](#key-files-reference)
8. [How-To Guides](#how-to-guides)
9. [Troubleshooting](#troubleshooting)
10. [Future Work](#future-work)

---

## Project Overview

This project creates a multi-brand landing page system using:
- **Next.js** (App Router)
- **Builder.io** (Visual CMS)
- **Tailwind CSS** (v4 with CSS variables)
- **Figma-generated components** with CSS variable theming

The system supports multiple brands (Access Hire, Blue Corp, Green Solutions, etc.) with a single codebase. Brand themes are applied via CSS variables, allowing content creators to build pages in Builder.io that automatically adapt to different brand styles.

---

## Architecture

```
src/
├── app/
│   ├── builder-ai/[[...slug]]/page.tsx   # Builder.io page routes
│   ├── equipment/[[...slug]]/page.tsx    # Equipment pages
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Homepage
│   └── globals.css                       # Global styles + CSS variables
│
├── components/
│   ├── ThemeProvider.tsx                 # Injects CSS variables per brand
│   └── builder/
│       ├── BuilderContent.tsx            # Renders Builder.io content
│       ├── CategoryHeroCC.tsx            # Category hero component
│       ├── figma/                        # Figma-generated components
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Dialog.tsx
│       │   ├── ProductCard.tsx
│       │   ├── ProductCardAPI.tsx        # Single product picker
│       │   ├── ProductGrid.tsx           # API-connected grid
│       │   ├── Hero.tsx
│       │   └── index.ts
│       └── lp/                           # Landing page components
│           ├── LPHeader.tsx
│           ├── LPHero.tsx
│           ├── LPTrustBadges.tsx
│           ├── LPBenefits.tsx
│           ├── LPProductsGrid.tsx
│           ├── LPTestimonials.tsx
│           ├── LPQuoteForm.tsx
│           ├── LPFaq.tsx
│           ├── LPCtaBanner.tsx
│           ├── LPFooter.tsx
│           ├── LPBreadcrumb.tsx
│           ├── LPStickyForm.tsx
│           └── index.ts
│
└── lib/
    ├── builder-registry.ts               # Component definitions for Builder.io
    ├── builder-register.ts               # Client-side registration (editor)
    ├── builder/
    │   ├── brand-model.ts                # Builder.io brand data model
    │   └── index.ts
    └── themes/
        ├── brands.ts                     # Brand theme definitions
        ├── types.ts                      # TypeScript types
        ├── css-variables.ts              # CSS variable generator
        └── index.ts
```

---

## Multi-Brand Theming System

### How It Works

1. **CSS Variables** are defined in `globals.css` with default values
2. **Brand definitions** in `src/lib/themes/brands.ts` override these values
3. **ThemeProvider** wraps content and injects brand-specific CSS variables
4. **Components** use `var(--color-primary)` etc. for automatic theming

### CSS Variables

```css
/* Available CSS variables */
--color-primary          /* Main brand color */
--color-primary-dark     /* Darker variant */
--color-primary-foreground  /* Text on primary bg */
--color-accent           /* Secondary brand color */
--color-accent-foreground
--color-background       /* Page background */
--color-background-alt   /* Alternate/section bg */
--color-card             /* Card backgrounds */
--color-foreground       /* Main text color */
--color-muted-foreground /* Secondary text */
--color-border           /* Border color */
--color-input            /* Input borders */
--color-success          /* Success states */
--color-warning          /* Warning states */
--color-error            /* Error states */
--font-heading           /* Heading font family */
--font-body              /* Body font family */
--radius                 /* Default border radius */
--radius-sm              /* Small radius */
--radius-lg              /* Large radius */
```

### Adding a New Brand

Edit `src/lib/themes/brands.ts`:

```typescript
export const brands: Record<string, BrandTheme> = {
  // ... existing brands ...

  "new-brand-id": {
    id: "new-brand-id",
    name: "New Brand Name",
    colors: {
      primary: "#YOUR_COLOR",
      primaryDark: "#DARKER_VARIANT",
      primaryForeground: "#ffffff",
      accent: "#ACCENT_COLOR",
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
};
```

### Existing Brands

| Brand ID      | Name            | Primary Color |
|---------------|-----------------|---------------|
| `default`     | Default         | #0f172a       |
| `access-hire` | Access Hire     | #E63229 (Red) |
| `brand-blue`  | Blue Corp       | #2563eb       |
| `brand-green` | Green Solutions | #16a34a       |

---

## Builder.io Integration

### Two Registration Files

1. **`builder-registry.ts`** - Server-side component definitions with inputs
2. **`builder-register.ts`** - Client-side registration for visual editor

### Design Tokens

Design tokens are registered in `builder-register.ts` and appear in Builder.io's styling panel:

- **Colors:** Primary, Accent, Background, Foreground, Border, etc.
- **Spacing:** XS (4px), SM (8px), MD (16px), LG (24px), XL (32px), 2XL (48px)
- **Font Family:** Heading, Body
- **Font Size:** XS through 4XL
- **Border Radius:** None, SM, Default, LG, Full

### Data Sources

The Products API is registered as a data source:

```typescript
register("dataSource", {
  name: "Products API",
  url: "https://acccessproducts.netlify.app/api/products",
  schema: { /* ... */ }
});
```

### Builder.io Block Reset

Default margins are removed from Builder.io blocks via CSS in `globals.css`:

```css
.builder-block {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
```

---

## Component Library

### Figma Components (Multi-Brand)

These use CSS variables for automatic theming:

| Component | File | Description |
|-----------|------|-------------|
| `FigmaButton` | `figma/Button.tsx` | Primary/secondary/outline variants |
| `FigmaInput` | `figma/Input.tsx` | Form input with validation states |
| `FigmaDialog` | `figma/Dialog.tsx` | Email subscription modal |
| `FigmaProductCard` | `figma/ProductCard.tsx` | Manual product card |
| `FigmaProductCardAPI` | `figma/ProductCardAPI.tsx` | Single product picker (API) |
| `FigmaProductGrid` | `figma/ProductGrid.tsx` | Product grid from API |
| `FigmaHero` | `figma/Hero.tsx` | Full-width hero section |

### LP Components (Landing Page)

| Component | Description |
|-----------|-------------|
| `LPHeader` | Header with logo, nav, CTA |
| `LPHero` | Hero with standard/squeeze/product-focused variants |
| `LPTrustBadges` | Stats/trust indicators row |
| `LPBenefits` | Benefits grid with icons |
| `LPProductsGrid` | Products from API |
| `LPTestimonials` | Customer testimonials |
| `LPQuoteForm` | Lead capture form |
| `LPFaq` | FAQ accordion |
| `LPCtaBanner` | Full-width CTA banner |
| `LPFooter` | Footer with links |
| `LPBreadcrumb` | Navigation breadcrumb |
| `LPStickyForm` | Sticky sidebar form |

### Other Components

| Component | Description |
|-----------|-------------|
| `CategoryHeroCC` | Equipment category hero (CLG-39) |

---

## API Integration

### Products API

**Endpoint:** `https://acccessproducts.netlify.app/api/products`

**Product Schema:**
```typescript
interface Product {
  productId: string;
  model: string;
  description?: string;
  brand?: string;
  category: string;           // e.g., "Forklift", "Scissor Lift"
  subCategory?: string;
  heroLabel?: string;
  productImages?: Array<{
    imageUrl: string;
    imageThumbUrl?: string;
    imageAltText?: string;
  }>;
  transportSpecification?: {
    weightKg?: number;
    widthM?: number;
    lengthM?: number;
    heightM?: number;
    heightFt?: string;
  };
  operationalSpecification?: {
    horizontalReachFt?: string;
    horizontalReachM?: number;
    platformHeightFt?: string;
    platformHeightM?: number;
    workingHeightFt?: string;
    workingHeightM?: number;
    capacityKg?: number;
    capacityT?: number;
  };
  pricing?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
}
```

### Using FigmaProductGrid

1. Drag "Figma - Product Grid (API)" into your page
2. Configure:
   - **API Endpoint:** Leave default or customize
   - **Category Filter:** e.g., "Forklift", "Scissor Lift"
   - **Subcategory Filter:** Optional further filtering
   - **Columns:** 2, 3, or 4
   - **Max Products:** Number to display

### Using FigmaProductCardAPI (Single Product)

1. Drag "Figma - Product Card (API Picker)" into your page
2. Enter **Product ID** (get from API response)
3. The component fetches and displays that specific product

---

## Key Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `src/lib/builder-registry.ts` | Component definitions with Builder.io inputs |
| `src/lib/builder-register.ts` | Client-side editor registration |
| `src/lib/themes/brands.ts` | Brand theme definitions |
| `src/lib/themes/css-variables.ts` | CSS variable generator |
| `src/app/globals.css` | Global CSS with default variables |

### Component Files

| File | Purpose |
|------|---------|
| `src/components/ThemeProvider.tsx` | Wraps content with CSS variables |
| `src/components/builder/figma/` | Figma-generated components |
| `src/components/builder/lp/` | Landing page components |

### Page Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Homepage |
| `/builder-ai/*` | `app/builder-ai/[[...slug]]/page.tsx` | Builder.io pages |
| `/equipment/*` | `app/equipment/[[...slug]]/page.tsx` | Equipment pages |

---

## How-To Guides

### Adding a New Figma Component

1. Create component in `src/components/builder/figma/NewComponent.tsx`
2. Export from `src/components/builder/figma/index.ts`
3. Add to `customComponents` array in `src/lib/builder-registry.ts`:

```typescript
{
  component: NewComponent,
  name: "NewComponent",
  friendlyName: "Figma - New Component",
  description: "Description here",
  inputs: [
    {
      name: "propName",
      type: "string",
      defaultValue: "default",
      friendlyName: "Property Name",
    },
  ],
},
```

4. Register in `src/lib/builder-register.ts` (inside the `if (typeof window !== "undefined")` block):

```typescript
register("editor.component", {
  name: "NewComponent",
  friendlyName: "Figma - New Component",
  component: NewComponent,
});
```

5. Deploy to Vercel

### Using CSS Variables in Components

```tsx
// Use inline styles
<div style={{ backgroundColor: "var(--color-primary)" }}>

// Or Tailwind arbitrary values
<div className="bg-[var(--color-primary)]">

// Or utility classes from globals.css
<div className="bg-primary text-primary">
```

### Styling Components for Multi-Brand

Always use CSS variables instead of hardcoded colors:

```tsx
// BAD - hardcoded
<button className="bg-red-600">

// GOOD - theme-aware
<button className="bg-[var(--color-primary)]">
```

---

## Troubleshooting

### Components Not Appearing in Builder.io

1. Check browser console for errors
2. Ensure `builder-register.ts` is imported in your app
3. Verify components are inside `if (typeof window !== "undefined")` block
4. Clear Builder.io cache and refresh editor
5. **IMPORTANT:** Never set `customInsertMenu: true` unless defining a custom menu

### API Products Not Loading

1. Check API endpoint is correct
2. Check browser Network tab for API response
3. Verify product field names match API response
4. Check category/subcategory filters match API data (case-sensitive)

### Themes Not Applying

1. Ensure `ThemeProvider` wraps your content
2. Check brand ID matches a key in `brands.ts`
3. Verify CSS variables are being set (inspect element)
4. Check for CSS specificity issues

### Build Errors

1. Check TypeScript errors with `npm run build`
2. Ensure all imports exist
3. Verify `"use client"` directive on client components

---

## Future Work

### Pending Tasks

- [ ] Visual product picker dropdown in Builder.io
- [ ] Brand selection in Builder.io editor
- [ ] Additional Figma components as needed
- [ ] Form submission handling

### Potential Enhancements

- Product search/filter UI in Builder.io
- Dynamic API endpoint configuration per brand
- Additional theme properties (shadows, animations)
- Component variants system

---

## Quick Reference

### Deployment

```bash
git add -A
git commit -m "Your message"
git push
# Vercel auto-deploys from main branch
```

### Local Development

```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Builder.io

- **API Key:** Set in environment variables
- **Model:** `page`
- **Preview URL:** https://clg-ten.vercel.app

---

## Contact & Support

For questions about this implementation, refer to the conversation history or contact the development team.
