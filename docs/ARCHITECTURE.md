# CLG Multi-Brand Theming System

## Overview

CLG is a Next.js 16 application with a multi-brand theming system that allows the same codebase to serve multiple brands (Access Hire Australia, Access Express, etc.) with distinct visual identities.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Builder.io CMS                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Pages    │  │   Brands    │  │ Components  │         │
│  │  (content)  │  │ (data model)│  │ (registered)│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Page (SSR)                         │    │
│  │  1. Fetch content from Builder.io                   │    │
│  │  2. Extract brand reference                          │    │
│  │  3. Fetch brand data → BrandTheme                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              ThemeProvider (React Context)           │    │
│  │  - Converts BrandTheme → CSS Variables              │    │
│  │  - Injects variables via inline style               │    │
│  │  - Provides brand data via useTheme() hook          │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Brand-Aware Components                     │    │
│  │  - Read colors via var(--color-*)                   │    │
│  │  - Read assets via useTheme().brand.assets          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | App Router, SSR, API routes |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Builder.io** | Visual CMS, page editing, brand data model |
| **Vercel** | Hosting, edge deployment |
| **CSS Variables** | Runtime theming |

---

## Key Files

### Theme System

| File | Purpose |
|------|---------|
| `src/lib/themes/types.ts` | TypeScript interfaces for BrandTheme, BrandColors, etc. |
| `src/lib/themes/brands.ts` | Local brand definitions (fallback if Builder.io unavailable) |
| `src/lib/themes/css-variables.ts` | Converts BrandTheme → CSS custom properties |
| `src/lib/builder/brand-model.ts` | Fetches brands from Builder.io, transforms to BrandTheme |
| `src/components/ThemeProvider.tsx` | React Context provider, injects CSS variables |

### Brand-Aware Components

| Component | Location |
|-----------|----------|
| Header | `src/components/layout/Header.tsx` |
| Footer | `src/components/layout/Footer.tsx` |
| EnquiryCartBubble | `src/components/EnquiryCartBubble.tsx` |
| EnquiryCartPanel | `src/components/builder/equipment/EnquiryCartPanel.tsx` |
| QuickViewModal | `src/components/builder/equipment/QuickViewModal.tsx` |
| ContactForm | `src/components/builder/ContactForm.tsx` |
| EquipmentCard | `src/components/builder/equipment/EquipmentCard.tsx` |
| Hero | `src/components/builder/figma/Hero.tsx` |

---

## CSS Variables

All brand colors are exposed as CSS custom properties:

```css
/* Brand Color Scale */
--color-brand-50 through --color-brand-950

/* Semantic Colors */
--color-primary
--color-primary-hover
--color-primary-foreground
--color-secondary
--color-secondary-hover
--color-secondary-foreground
--color-accent
--color-accent-foreground

/* Layout */
--color-header
--color-header-foreground
--color-footer
--color-footer-foreground

/* Backgrounds */
--color-background
--color-background-alt
--color-card
--color-card-foreground

/* Text */
--color-foreground
--color-muted-foreground

/* Borders */
--color-border
--color-input
--color-ring

/* Status */
--color-success
--color-warning
--color-error

/* Typography */
--font-heading
--font-body

/* Spacing */
--radius
--radius-sm
--radius-lg
```

---

## Brand Configuration

### Access Hire Australia (Default)

| Property | Value |
|----------|-------|
| Primary | `rgb(227 25 55)` - Red |
| Header | White background |
| Footer | Red background |
| Fonts | Lato (headings), Roboto (body) |

### Access Express

| Property | Value |
|----------|-------|
| Primary | `rgb(10 22 40)` - Navy/Black |
| Secondary | `rgb(245 166 35)` - Orange |
| Accent | `rgb(0 168 232)` - Blue |
| Header | Navy background |
| Footer | Navy background |
| Fonts | Montserrat (headings), Open Sans (body) |

---

## How Theming Works

### 1. Page Load (SSR)

```typescript
// In page.tsx
const content = await fetchBuilderContent(urlPath);
const brandTheme = await getBrandThemeFromContent(content);

return (
  <ThemeProvider theme={brandTheme}>
    <BuilderContent content={content} />
    <EnquiryCartBubble />
  </ThemeProvider>
);
```

### 2. ThemeProvider Injects CSS Variables

```typescript
// ThemeProvider generates CSS variables from brand theme
const cssVariables = generateCssVariablesObject(brand);

return (
  <div style={cssVariables}>
    {children}
  </div>
);
```

### 3. Components Read Variables

```tsx
// Components use CSS variables for colors
<button style={{
  backgroundColor: "var(--color-primary)",
  color: "var(--color-primary-foreground)"
}}>
  Get a Quote
</button>

// Or access brand data directly via hook
const { brand } = useTheme();
const logoUrl = brand.assets?.logoUrl;
```

---

## Builder.io Integration

### Brand Data Model

The `brand` data model in Builder.io stores brand configuration:

- `id`, `name`, `slug` - Identity
- `colorPrimary`, `colorPrimaryHover`, etc. - Color tokens
- `colorHeader`, `colorFooter` - Layout colors
- `logoUrl`, `logoUrlDark` - Asset URLs
- `fontHeading`, `fontBody` - Typography
- `radius`, `radiusSm`, `radiusLg` - Spacing

### Page → Brand Reference

Pages in Builder.io have a `brand` reference field that links to a brand entry. When a page loads, the brand data is fetched and converted to CSS variables.

---

## Adding a New Brand

1. **Create brand entry in Builder.io**
   - Go to Content → Brand → Create New
   - Fill in all color/font/asset fields
   - Publish

2. **Or add to local brands.ts** (fallback)
   ```typescript
   // src/lib/themes/brands.ts
   "new-brand": {
     id: "new-brand",
     name: "New Brand",
     colors: { ... },
     fonts: { ... },
     spacing: { ... },
     assets: { logoUrl: "..." }
   }
   ```

3. **Assign brand to page**
   - Edit page in Builder.io
   - Set `brand` reference field
   - Publish

---

## Testing Brands

Use URL parameter to test any brand:

```
https://clg-ten.vercel.app/demo-express?brandId=access-express
https://clg-ten.vercel.app/?brandId=access-hire
```

---

## Deployment

- **Hosting**: Vercel
- **Production URL**: https://clg-ten.vercel.app
- **Auto-deploy**: Push to `main` branch
- **Manual deploy**: `vercel --prod`
- **Force deploy (clear cache)**: `vercel --prod --force`
