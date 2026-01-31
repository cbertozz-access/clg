# Builder.io Spaces & Architecture Comparison

**Date:** January 2026
**Spaces Analyzed:**
- CLG (Composable Landing Generator) - API Key: `286fbab6792c4f4f86cd9ec36393ea60`
- Access Group Australia (UAT) - API Key: `e9c86474ff824dd08b7bd769c8916e94`

---

## Executive Summary

Two distinct architectural approaches for managing multi-brand websites:

| Aspect | CLG | Access Group Australia |
|--------|-----|------------------------|
| **Approach** | Code-centric theming | Builder-centric content |
| **Content Models** | 2 (page, brand) | 15+ specialized models |
| **Multi-brand** | CSS variables + ThemeProvider | Separate models per brand |
| **Products** | External API | Stored in Builder.io |
| **Identity System** | ✅ Firebase/Firestore | ❓ Not in Builder |
| **Environment** | Single space | UAT/Production separation |
| **Design System** | Code (brands.ts) | Builder Design System UI |

---

## Part 1: CLG Architecture

### Builder.io Configuration

**API Key:** `286fbab6792c4f4f86cd9ec36393ea60`
**Deployment:** https://clg-ten.vercel.app

#### Content Models

| Model | Identifier | Type | Purpose |
|-------|------------|------|---------|
| Equipment Category | `cc-equipment-category` | Page | All page content |
| Brand | `brand` | Data | Brand theme definitions |

#### Custom Components (40+)

**Figma Components:**
- FigmaButton, FigmaInput, FigmaDialog
- FigmaProductCard, FigmaProductCardAPI
- FigmaProductGrid, FigmaHero

**Landing Page Components:**
- LPHero (3 variants), LPTrustBadges, LPBenefits
- LPProductsGrid, LPTestimonials, LPFaq
- LPCtaBanner, LPStickyForm, LPFilterBar
- LPStickyBottomCTA, LPQuoteModal

**Equipment Components:**
- EquipmentCard, EquipmentGrid, EquipmentSearch
- EquipmentSelector (6-step wizard)

**Layout/Contact:**
- Header, Footer, ContactForm, TextBlock

### Multi-Brand Theming System

**Implementation:** CSS Variables injected via ThemeProvider

**Brands Configured:**
| Brand | ID | Primary Color | Fonts |
|-------|-----|---------------|-------|
| Access Hire | `access-hire` | Red (#E31937) | Lato / Roboto |
| Access Express | `access-express` | Navy (#0A1628) | Montserrat / Open Sans |
| Blue Corp | `brand-blue` | Blue (#2563EB) | Inter / Inter |
| Green Solutions | `brand-green` | Green (#16A34A) | Poppins / Poppins |

**CSS Variables Generated (50+):**
```css
/* Color Scale */
--color-brand-50 through --color-brand-950

/* Semantic Colors */
--color-primary, --color-primary-hover, --color-primary-foreground
--color-secondary, --color-accent
--color-background, --color-background-alt
--color-header, --color-header-foreground
--color-footer, --color-footer-foreground
--color-foreground, --color-muted-foreground
--color-success, --color-warning, --color-error

/* Typography */
--font-heading, --font-body, --font-mono

/* Spacing */
--radius, --radius-sm, --radius-lg

/* Equipment Brands (20+) */
--color-equipment-brand-genie
--color-equipment-brand-jlg
--color-equipment-brand-haulotte
/* etc. */
```

**Brand Resolution Chain:**
1. Builder content `data.brand.value.data` (inline)
2. Builder content `data.brand.id` (reference fetch)
3. Builder content `data.brandId` (string lookup)
4. URL parameter `?brandId=access-express`
5. Local `brands.ts` definition
6. Default brand (`access-hire`)

### External Integrations

**Products API:**
- Endpoint: `https://acccessproducts.netlify.app/api/products`
- Cache: 5 minutes
- Used by: FigmaProductGrid, EquipmentGrid, EquipmentSearch

**Algolia Search:**
- App ID: `ZVMLPBZ3YI`
- Index: `all-products`
- Used by: EquipmentSearch component

### Key Files

```
/src/lib/
├── builder-register.ts      # 40+ component registrations
├── themes/
│   ├── brands.ts           # Brand definitions
│   ├── types.ts            # BrandTheme interface
│   └── css-variables.ts    # Variable generation
├── api/products.ts         # Product API client
└── builder/brand-model.ts  # Builder brand interface

/src/components/
├── ThemeProvider.tsx       # CSS variable injection
└── builder/               # All Builder components
```

---

## Part 2: Access Group Australia Architecture

### Builder.io Configuration

**API Key:** `e9c86474ff824dd08b7bd769c8916e94`
**Organization:** Access Group Australia
**Environment:** UAT (separate from Production)

#### Content Models (15+)

**Page Models:**
| Model | Identifier | Type |
|-------|------------|------|
| Access Hire: Pages | `aha-pages` | Page |

**Section Models (Reusable Visual Components):**
| Model | Identifier | Type |
|-------|------------|------|
| Access Hire: Brand | `aha-brand` | Section |
| Access Hire: Category | `aha-category` | Section |
| [blueprint] brand | `blueprint-brand` | Section |
| [blueprint] Category | `blueprint-category` | Section |

**Data Models (Structured Content):**
| Model | Identifier | Type | Purpose |
|-------|------------|------|---------|
| core: Product | `core-product` | Data | Master product catalog |
| core: Category | `core-category` | Data | Master category taxonomy |
| core: Brand | `core-brand` | Data | Equipment manufacturer brands |
| Access Hire: Product | `aha-product` | Data | AHA-specific products |
| Access Hire: Product Used | `aha-product-used` | Data | Used equipment |
| Access Hire: Navigation | `aha-navigation` | Data | Site navigation |
| [blueprint] Product | `blueprint-product` | Data | Blueprint products |
| [blueprint] Product Used | `blueprint-product-used` | Data | Used equipment |
| [blueprint] Navigation | `blueprint-navigation` | Data | Site navigation |

### Content Counts (Published)

| Model | Count | Examples |
|-------|-------|----------|
| `core-product` | 3+ | Forklifts, generators, boom lifts |
| `core-category` | 10+ | Vacuum, Demolition, Motor Grader, Large, Medium, Small |
| `core-brand` | 5+ | Hitachi, Komatsu, CAT, Hangcha, Tennant |
| `aha-product` | 3+ | Generators, forklifts, scissor lifts |
| `aha-brand` | 5+ | Komatsu, CAT, Liftsmart, Access Group, Zoomlion |
| `aha-category` | 3+ | Hand Pallet Truck, Narrow Aisle Truck, Reach Truck |
| `aha-navigation` | 2 | Primary, Footer column 1 |

### Data Model Schemas

**core-product:**
```typescript
{
  slug: string;
  productDescription: string;
  primaryImage: string;
  primaryImageAltText: string;
  isUsed: boolean;
  externalProductKey: string;        // External system ID
  externalReferenceData: object;     // Sync metadata
  referenceSourcePrimaryImageMd5: string;
  referenceTargetPrimaryImageMd5: string;
}
```

**core-brand:**
```typescript
{
  slug: string;
  title: string;
  cardImage: string;
  logo: string;
  brandColourHexCode: string;
  externalBrandId: string;           // External system ID
  externalReferenceData: {
    aha: "active" | "archived"       // Brand status per site
  };
}
```

**aha-brand (Section):**
```typescript
{
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  heroImage: string;
  navigationDisplayOrder: number;
  displayInPromoGrid: boolean;
  gridPromoDisplayOrder: number;
  externalBrandId: string;
}
```

**aha-navigation:**
```typescript
{
  internalName: string;
  codeId: string;                    // e.g., "primary", "footer-1"
  links: Array<{
    label: string;
    linkType: "custom url" | "standard page";
    customUrl?: string;
    internalPageLinkStandard?: {
      "@type": "@builder.io/core:Reference";
      id: string;
      model: "aha-pages";
    };
    openLinkInNewWindow: boolean;
  }>;
}
```

### Architecture Pattern

```
                    CORE MODELS (Shared)
                    ├── core-product
                    ├── core-category
                    └── core-brand
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ACCESS HIRE (aha-*)              BLUEPRINT (blueprint-*)
    ├── aha-pages                    ├── (pages not visible)
    ├── aha-product                  ├── blueprint-product
    ├── aha-product-used             ├── blueprint-product-used
    ├── aha-category (Section)       ├── blueprint-category (Section)
    ├── aha-brand (Section)          ├── blueprint-brand (Section)
    └── aha-navigation               └── blueprint-navigation
```

### Key Differences from CLG

| Feature | CLG | Access Group Australia |
|---------|-----|------------------------|
| Product storage | External API | Builder.io Data models |
| Category storage | Hardcoded/API | Builder.io Data models |
| Navigation | Hardcoded in components | Per-brand Data models |
| Brand theming | CSS variables in code | Builder Sections |
| Multi-site | Single codebase + brandId | Separate models per site |
| Environment | Single Builder space | UAT/Prod separation |
| Content sync | N/A | External reference system |

---

## Part 3: Firebase/Firestore Identity System (CLG Only)

### Overview

CLG includes a sophisticated visitor identification and cross-device tracking system built on Firebase/Firestore. **This is NOT present in the Access Group Australia Builder space.**

### Infrastructure

**Firebase Project:** `composable-lg`
**Region:** `australia-southeast1`
**Firestore Database:** `visitors`

### Components

#### Client SDK (`/public/clg-visitor.js` - 1054 lines)

**Initialization:**
```javascript
// Auto-initializes on DOMContentLoaded
window.CLGVisitor = new CLGVisitorSDK();
```

**Features:**
- Visitor ID generation and persistence (cookie + localStorage)
- Session management (30-minute timeout)
- Device fingerprinting (user agent, screen, timezone, etc.)
- UTM parameter capture (first-touch and last-touch)
- PII hashing (SHA-256 for email/phone)
- Server-side GTM integration
- Form submission tracking
- Identity graph integration

**Public Methods:**
```javascript
CLGVisitor.trackPageView(customData)      // Page view tracking
CLGVisitor.track(eventName, properties)   // Custom events
CLGVisitor.trackFormSubmit(name, data)    // Form submissions
CLGVisitor.identify(userData)             // User identification
CLGVisitor.addSegment(segment)            // Segmentation
```

#### Cloud Functions (`/functions/index.js`)

**Endpoints:**

| Function | Method | Purpose |
|----------|--------|---------|
| `visitorId` | GET/POST | Create/retrieve visitor profiles |
| `checkIdentity` | POST | Match device fingerprint to existing visitor |
| `linkIdentity` | POST | Link email/phone hash to visitor (deduplication) |
| `mergeIdentity` | POST | Consolidate duplicate visitors (NS webhook) |
| `debugEvents` | GET/POST | Smoke test event logging |

**Base URL:** `https://australia-southeast1-composable-lg.cloudfunctions.net/`

#### Firestore Collections

```
visitors (database: "visitors")
│
├── {visitor_id}/                    # Visitor profiles
│   ├── id: string
│   ├── first_seen: timestamp
│   ├── last_seen: timestamp
│   ├── page_views: number
│   ├── sessions: number
│   ├── lead_score: number
│   ├── segments: string[]
│   ├── brands: string[]
│   ├── ns_lead_id: string | null   # NetSuite link
│   └── behaviors: object
│
├── identity_graph/                  # Cross-device deduplication
│   ├── email_{sha256_hash}
│   │   ├── master_uid: string
│   │   ├── created_at: timestamp
│   │   └── brands: string[]
│   │
│   ├── phone_{sha256_hash}
│   │   ├── master_uid: string
│   │   ├── created_at: timestamp
│   │   └── brands: string[]
│   │
│   └── device_{fingerprint}
│       ├── master_uid: string
│       ├── last_seen: timestamp
│       └── brands: string[]
│
├── debug_events/                    # Smoke test logs
│   └── {event_id}
│       ├── session_id: string
│       ├── event_type: string
│       ├── timestamp: timestamp
│       └── data: object
│
└── mergedUIDs/                      # Merge audit trail
    └── {merge_id}
        ├── source_uid: string
        ├── target_uid: string
        ├── merged_at: timestamp
        └── match_sources: string[]
```

### Identity Resolution Flow

```
1. Page Load
   └── CLGVisitor SDK initializes
       ├── Check cookie for existing visitor_id
       ├── Generate device fingerprint
       └── Call checkIdentity(uid, device_id)
           └── Firestore: Check identity_graph/device_{fingerprint}
               ├── Match found → Return master_uid, merge profiles
               └── No match → Continue as new/existing visitor

2. Form Submission
   └── User submits contact form
       ├── Hash email/phone with SHA-256
       └── Call linkIdentity(uid, email_hash, phone_hash)
           └── Firestore: Check identity_graph/email_{hash}
               ├── Match found → Link to master_uid, merge data
               └── No match → Create new index entry

3. Cross-Brand Detection
   └── Same email/phone submitted on different brand site
       └── linkIdentity detects existing hash
           ├── Return is_duplicate: true
           ├── Merge visitor profiles
           └── Track all brands in profile
```

### Lead Scoring

Events automatically update lead score:
| Event | Points |
|-------|--------|
| page_view | +1 |
| form_start | +5 |
| form_complete | +20 |
| cta_click | +3 |
| video_play | +2 |
| video_complete | +5 |
| download | +10 |
| contact | +25 |

### Server-Side GTM Integration

**Endpoint:** `https://composable-lg.ts.r.appspot.com/clg/collect`

**Data Sent (sanitized):**
- Event name and properties
- Session context (pages visited, UTM params)
- Hashed PII only (never raw email/phone)
- Visitor profile data (lead score, segments)
- Attribution (first-touch, last-touch)

---

## Part 4: Gap Analysis

### What Access Group Australia Has That CLG Doesn't

| Feature | Status | Notes |
|---------|--------|-------|
| Environment separation | ✅ | UAT/Production in Builder |
| Products in Builder | ✅ | `core-product`, `aha-product` models |
| Categories in Builder | ✅ | `core-category`, `aha-category` models |
| Per-brand navigation | ✅ | `aha-navigation`, `blueprint-navigation` |
| Section components | ✅ | Brand/Category as reusable sections |
| External reference sync | ✅ | `externalProductKey`, `externalBrandId` fields |
| Design System UI | ✅ | Builder Design System feature |

### What CLG Has That Access Group Australia Doesn't (Visible)

| Feature | Status | Notes |
|---------|--------|-------|
| Firebase Identity System | ❓ | Not in Builder - may be in code |
| Visitor tracking SDK | ❓ | Not in Builder - may be in code |
| Cross-device deduplication | ❓ | Not in Builder - may be in code |
| Lead scoring | ❓ | Not in Builder - may be in code |
| Server-side GTM | ❓ | Not in Builder - may be in code |
| CSS variable theming | ❓ | May use different approach |
| 40+ custom components | ❓ | Components registered in consuming app |

### Recommendations

1. **Identity System:** Determine if Access Group Australia sites have a separate identity implementation or if CLG's system should be shared across all AG properties.

2. **Component Library:** The 40+ CLG components could potentially be shared with Access Group Australia sites if they adopt the same frontend framework.

3. **Theming Approach:**
   - CLG: Code-centric (CSS variables, easy to version control)
   - AGA: Builder-centric (content editors control everything)
   - Consider which approach best fits AG's workflow

4. **Product Data:**
   - CLG: External API (single source of truth)
   - AGA: Builder.io storage (content editors manage)
   - Determine canonical source for product data across AG

5. **Environment Strategy:** CLG should adopt Builder environment separation (UAT/Production) like Access Group Australia for safer content deployment.

---

## Appendix: API Query Examples

### CLG Space

```bash
# Get pages
curl "https://cdn.builder.io/api/v3/content/cc-equipment-category?apiKey=286fbab6792c4f4f86cd9ec36393ea60&limit=10"

# Get brands
curl "https://cdn.builder.io/api/v3/content/brand?apiKey=286fbab6792c4f4f86cd9ec36393ea60&limit=10"
```

### Access Group Australia Space

```bash
# Get products
curl "https://cdn.builder.io/api/v3/content/core-product?apiKey=e9c86474ff824dd08b7bd769c8916e94&limit=10"

# Get categories
curl "https://cdn.builder.io/api/v3/content/core-category?apiKey=e9c86474ff824dd08b7bd769c8916e94&limit=10"

# Get AHA navigation
curl "https://cdn.builder.io/api/v3/content/aha-navigation?apiKey=e9c86474ff824dd08b7bd769c8916e94&limit=10"

# Get AHA brand sections
curl "https://cdn.builder.io/api/v3/content/aha-brand?apiKey=e9c86474ff824dd08b7bd769c8916e94&limit=10"
```
