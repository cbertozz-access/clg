# CLG Project Setup & Continuation Guide

This document contains everything needed to continue development on the CLG project from any machine.

---

## Repository

**GitHub URL:** https://github.com/cbertozz-access/clg.git

```bash
git clone https://github.com/cbertozz-access/clg.git
cd clg
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Builder.io
NEXT_PUBLIC_BUILDER_API_KEY=286fbab6792c4f4f86cd9ec36393ea60
BUILDER_PRIVATE_KEY=bpk-1b043b05d8d041c2b478664653978910

# Algolia Search
NEXT_PUBLIC_ALGOLIA_APP_ID=ZVMLPBZ3YI
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=e4a2311272ac551d3ad467d1fc6a984b
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=all-products
```

---

## Services & Accounts

### Builder.io
- **Dashboard:** https://builder.io
- **Space:** Access Group CLG
- **Public API Key:** `286fbab6792c4f4f86cd9ec36393ea60`
- **Private API Key:** `bpk-1b043b05d8d041c2b478664653978910`
- **Model:** `cc-equipment-category` (pages)
- **Model:** `brand` (brand theming data)

### Vercel
- **Dashboard:** https://vercel.com
- **Project:** clg
- **Production URL:** https://clg-ten.vercel.app
- **Deploy:** `vercel --prod` or push to `main` branch

### Algolia
- **Dashboard:** https://dashboard.algolia.com
- **App ID:** `ZVMLPBZ3YI`
- **Index:** `all-products`
- **Search Key:** `e4a2311272ac551d3ad467d1fc6a984b`

### External APIs
- **Netlify Products API:** https://acccessproducts.netlify.app/api/products
  - Used for detailed equipment data in QuickViewModal

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

**Local URL:** http://localhost:3000

---

## Deployment

### Automatic (recommended)
Push to `main` branch triggers automatic deployment on Vercel.

### Manual
```bash
# Deploy to production
vercel --prod

# Force deploy (clear cache)
vercel --prod --force
```

---

## Key URLs

| URL | Description |
|-----|-------------|
| https://clg-ten.vercel.app | Production site |
| https://clg-ten.vercel.app/admin | Admin dashboard |
| https://clg-ten.vercel.app/demo-express | Access Express brand demo |
| https://clg-ten.vercel.app/equipment | Equipment browse page |
| https://builder.io | CMS editor |

---

## Project Structure

```
clg/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [[...slug]]/        # Catch-all page route
│   │   ├── equipment/          # Equipment category pages
│   │   ├── admin/              # Admin dashboard
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── admin/              # Admin UI components
│   │   ├── builder/            # Builder.io registered components
│   │   │   ├── equipment/      # Equipment cards, grid, search, modal
│   │   │   └── figma/          # Design-system components (Hero, etc.)
│   │   ├── layout/             # Header, Footer
│   │   └── debug/              # Visitor debug panel
│   └── lib/
│       ├── api/                # Algolia integration
│       ├── builder/            # Builder.io utilities
│       ├── themes/             # Multi-brand theming system
│       └── enquiry-cart.tsx    # Equipment enquiry cart context
├── public/
│   └── clg-visitor.js          # Visitor tracking SDK
├── scripts/                    # Utility scripts
└── docs/                       # Documentation
```

---

## Key Features Implemented

1. **Multi-brand theming** - CSS variables, brand context, AHA & Access Express brands
2. **Equipment search** - Algolia-powered with filters, QuickViewModal
3. **Enquiry cart** - Add equipment, floating bubble, slide-out panel
4. **Visual editing** - Builder.io integration with registered components
5. **Admin dashboard** - Page generator at /admin
6. **Visitor tracking** - Anonymous visitor ID, lead scoring

---

## Brand Configuration

### Access Hire Australia (Default)
- Primary: `#E31937` (Red)
- Fonts: Lato (headings), Roboto (body)

### Access Express
- Primary: `#0A1628` (Navy)
- Secondary: `#F5A623` (Orange)
- Accent: `#00A8E8` (Blue)
- Fonts: Montserrat (headings), Open Sans (body)

Test brands with URL parameter: `?brandId=access-express`

---

## Common Tasks

### Add a new page in Builder.io
1. Go to https://builder.io → Content → cc-equipment-category
2. Click "New Entry"
3. Set URL path in targeting
4. Add components, publish

### Create page via Admin
1. Go to https://clg-ten.vercel.app/admin
2. Select template, brand, fill details
3. Click "Create Page" (creates as draft)
4. Open in Builder.io to publish

### Add a new component
1. Create component in `src/components/builder/`
2. Register in `src/lib/builder/components.ts`
3. Component appears in Builder.io editor

### Update brand colors
1. Edit `src/lib/themes/brands.ts`
2. Or update brand entry in Builder.io

---

## Troubleshooting

### Page not showing content
- Check URL path matches in Builder.io targeting
- Verify model is `cc-equipment-category`
- Check brand reference if using brand-specific styling

### Builder.io changes not appearing
- Content may be cached (ISR)
- Force redeploy: `vercel --prod --force`
- Add `?cachebust=1` to URL for testing

### Brand styling not applied
- Ensure page has brand reference set in Builder.io
- Or use `?brandId=access-express` URL parameter
- Check ThemeProvider wraps the content

---

## Support

- **Claude Code:** Available for development assistance
- **Builder.io Docs:** https://www.builder.io/c/docs
- **Next.js Docs:** https://nextjs.org/docs
