# CLG Technical Specification

## Executive Summary

CLG (Composable Landing Generator) is a multi-brand landing page system built for Access Group. It enables marketing teams to create and manage landing pages across multiple brands using a visual editor, while maintaining consistent brand theming, equipment enquiry functionality, and visitor tracking capabilities.

The system combines a Next.js frontend with Builder.io as the headless CMS, Google Cloud Platform for serverless visitor identification, Vercel for hosting with continuous deployment, and a comprehensive security layer protecting all API endpoints.

### Key Integrations

| Service | Purpose | Type |
|---------|---------|------|
| **Builder.io** | Headless CMS, visual editing | Content |
| **Vercel** | Hosting, edge functions, CI/CD | Infrastructure |
| **Firebase** | Cloud Functions, Firestore database | Backend |
| **Algolia** | Equipment search | Search |
| **NS Adapter** | NetSuite lead creation | CRM |
| **Amplitude** | Product analytics, event tracking | Analytics |
| **Iterable** | Email marketing automation | Marketing |
| **Datadog** | Real User Monitoring (RUM) | Observability |
| **Upstash Redis** | Rate limiting | Security |

---

## System Architecture

### Overview

The architecture follows a composable approach where content management, visitor tracking, and frontend rendering are handled by separate specialised services that communicate via APIs. This separation allows each component to scale independently and be updated without affecting others.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLG WEBSITE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js    │  │  API Routes │  │  clg-visitor.js SDK     │  │
│  │  Frontend   │  │  /api/*     │  │  (client-side identity) │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│   NS Adapter    │ │   Firebase  │ │    Amplitude    │
│ (dev-agws.au)   │ │  Functions  │ │    Analytics    │
└────────┬────────┘ └──────┬──────┘ └────────┬────────┘
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│    NetSuite     │ │  Firestore  │ │    Iterable     │
│      CRM        │ │   Database  │ │     Email       │
└─────────────────┘ └─────────────┘ └─────────────────┘
```

### Frontend Application

The frontend is built on Next.js using the App Router architecture. All pages are server-side rendered to ensure optimal search engine indexing and fast initial page loads. The application uses dynamic routing with catch-all segments to handle any URL structure defined in the CMS.

When a request comes in, the server fetches the corresponding page content from Builder.io, resolves the brand theme, and renders the page with the appropriate styling. The rendered HTML includes the brand's CSS variables, making theming instantaneous without client-side JavaScript overhead.

### Content Management System

Builder.io serves as the headless CMS, providing both content storage and a visual editing interface. Content editors can drag and drop registered components onto pages, configure their properties, and preview changes in real-time. The system uses two primary data models: one for pages and one for brands.

Pages store the visual layout, component configurations, SEO metadata, and a reference to a brand. When pages are published, they become available at their configured URL path. The visual editor supports both desktop and mobile preview modes.

Brands store the complete design token set for each visual identity. This includes colour scales, semantic colour mappings, typography settings, spacing values, and asset URLs. Brands are created once and can be referenced by any number of pages.

### Multi-Brand Theming System

The theming system enables multiple brands to share the same codebase while maintaining distinct visual identities. It operates through four layers:

The definition layer stores brand configurations as structured data objects containing all design tokens. Each brand defines a complete colour scale from light to dark shades, semantic colour mappings for primary actions, secondary elements, accents, backgrounds, and status indicators, plus typography and spacing values.

The resolution layer determines which brand applies to each page request. It first checks if the page content includes a brand reference. If found, it fetches that brand's configuration. As a fallback, it checks for a brand identifier in the URL query string. If neither exists, the default brand applies.

The injection layer converts the resolved brand configuration into CSS custom properties. These variables are injected as inline styles on a wrapper element, scoping them to the page content. This approach ensures brand styles don't leak between different brand pages and enables instant theming without stylesheet switching.

The consumption layer is where components read their styles. All brand-aware components use CSS variable references for colours and can access brand data directly via a React context hook for assets like logos.

### Visitor Identification System

The visitor identification system provides persistent tracking of anonymous visitors across sessions. It uses a serverless architecture with Cloud Functions handling identification logic and Firestore providing persistent storage.

#### Firebase Cloud Functions

The system includes four Cloud Functions for identity management:

| Function | Purpose | Trigger |
|----------|---------|---------|
| `visitorId` | Generate/retrieve visitor IDs | HTTP GET/POST |
| `checkIdentity` | Check if email/phone exists in identity graph | HTTP POST |
| `linkIdentity` | Link visitor to known identity (email/phone) | HTTP POST |
| `mergeIdentity` | Consolidate duplicate visitor records | HTTP POST |

When a visitor first arrives, the browser SDK calls the `visitorId` function. The function generates a UUID, creates a visitor document in Firestore with initial metadata, and returns the ID to the browser. The SDK stores this ID in both a cookie and localStorage for redundancy.

On subsequent visits, the SDK retrieves the stored ID and sends it to the API. The API looks up the existing visitor document, increments the page view counter, updates the last seen timestamp, and returns the full profile including any accumulated behavioural data.

#### Identity Graph Structure

The identity resolution system uses two Firestore collections:

**`visitors` collection:**
- `id` (string, primary key) - Visitor UUID
- `master_uid` (string) - Canonical identity reference
- `devices` (string[]) - Associated device fingerprints
- `status` (string) - active/merged/archived
- `merged_uids` (string[]) - Previously merged visitor IDs
- `brands` (string[]) - Brands this visitor has interacted with

**`identity_graph` collection:**
- `id` (string, primary key) - Graph node ID
- `email_hash` (string) - SHA-256 hashed email
- `phone_hash` (string) - SHA-256 hashed phone
- `device_id` (string) - Device fingerprint
- `master_uid` (string) - Links to canonical visitor

### Lead Scoring

The system automatically computes a lead score based on visitor behaviour. Different events contribute different point values reflecting their indication of purchase intent:

| Event | Points | Category |
|-------|--------|----------|
| Page view | 1 | Basic engagement |
| Equipment view | 2 | Interest signal |
| Add to enquiry cart | 5 | High intent |
| Form start | 10 | Conversion signal |
| Form completion | 25 | Conversion |
| Contact request | 50 | High-value lead |

The lead score accumulates over time as visitors interact with the site. This score can be used for personalisation decisions, such as showing different content to high-intent versus casual visitors, or for prioritising leads in sales workflows.

### Google Tag Manager Integration

The visitor SDK automatically pushes identification data to the GTM data layer when a visitor is identified. This includes:

- `clg_visitor_id` - The visitor UUID
- `clg_is_new_visitor` - Boolean for first visit
- `clg_page_views` - Total page view count
- `clg_session_count` - Number of sessions
- `clg_lead_score` - Computed lead score
- `clg_segments` - Array of assigned segments

This integration enables GTM tags and triggers to access visitor data for analytics, advertising pixels, and other marketing tools without additional implementation work.

---

## Observability

### Datadog Real User Monitoring

The application integrates Datadog RUM for comprehensive frontend observability. The integration is implemented via a React component (`DatadogRum`) that initialises the Datadog browser SDK.

**Capabilities:**
- Real-time performance metrics (Core Web Vitals)
- User session replay
- Error tracking with stack traces
- Resource timing analysis
- Custom action tracking

**Configuration:**
```typescript
// Environment variables required
NEXT_PUBLIC_DATADOG_APPLICATION_ID
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
NEXT_PUBLIC_DATADOG_SITE // e.g., "datadoghq.com"
NEXT_PUBLIC_DATADOG_SERVICE // e.g., "clg-frontend"
NEXT_PUBLIC_DATADOG_ENV // e.g., "production"
```

**Session Sampling:**
- 100% of sessions tracked for errors
- Configurable sample rate for session replay (default 20%)

### OpenTelemetry Tracing

Server-side tracing is enabled via Vercel's OpenTelemetry integration (`@vercel/otel`). This provides:

- Distributed tracing across API routes
- Automatic span creation for fetch requests
- Integration with Vercel's observability dashboard

---

## Analytics

### Amplitude Integration

Amplitude serves as the primary product analytics platform, tracking user behaviour and enabling cohort analysis.

**Event Types:**

| Event | Trigger | Properties |
|-------|---------|------------|
| `page_view` | Page load | url, referrer, brand |
| `equipment_view` | Equipment modal open | product_id, category |
| `cart_add` | Add to enquiry | product_id, cart_size |
| `cart_remove` | Remove from enquiry | product_id, cart_size |
| `form_start` | Form field focus | form_type |
| `form_submit` | Form submission | form_type, success |
| `contact_request` | Contact form complete | lead_score, visitor_id |

**Implementation:**
- Browser SDK (`@amplitude/analytics-browser`) for client events
- Server SDK (`@amplitude/analytics-node`) for secure server-side events
- PII is hashed before sending to Amplitude (email → SHA-256)

**User Identity:**
- Anonymous ID: CLG visitor_id
- Known ID: Linked after form submission via `linkIdentity`

---

## Email Marketing

### Iterable Integration

Iterable handles automated email campaigns triggered by visitor actions and form submissions.

**Integration Flow:**
```
Form Submit → NS Adapter → NetSuite
                ↓
           Amplitude (event)
                ↓
           Iterable (webhook)
                ↓
           Email Campaign Triggered
```

**Campaign Triggers:**
- Contact form submission → Welcome sequence
- Quote request → Quote follow-up sequence
- High lead score (>50) → Sales outreach notification

**Data Sync:**
- Amplitude cohorts can sync to Iterable user lists
- Email engagement (opens, clicks) syncs back to visitor profile

---

## API Connections

### Builder.io Content API

The application connects to Builder.io's Content Delivery Network for fetching pages and brand data. Content is retrieved using the official SDK which handles query parameter construction, caching headers, and visual editor integration automatically.

Page content is fetched by URL path, returning the full component tree and associated data. Brand content is fetched either by reference ID when linked from a page or by slug for direct lookups. Both endpoints support query-based filtering and pagination.

Content responses are cached using Incremental Static Regeneration with a revalidation period. This balances content freshness with API efficiency, ensuring published changes appear within the revalidation window while avoiding unnecessary API calls for unchanged content.

### Builder.io Write API

For programmatic content management, the Write API enables creating and updating content entries. This is used by maintenance scripts for tasks like creating new brand entries or bulk-updating content fields. The Write API requires authentication with a private API key that is never exposed to the browser.

### Algolia Search API

Equipment search is powered by Algolia, providing:

- Instant search with typo tolerance
- Faceted filtering (category, brand, power type)
- Geo-search for location-based results
- Search analytics for query insights

**Index Structure:**
- `equipment` - Main equipment catalogue
- `equipment_categories` - Category hierarchy
- `equipment_brands` - Brand metadata

### Visitor Identification API

The visitor identification API is a Cloud Function that handles both GET and POST requests. GET requests retrieve or create visitor profiles. POST requests track events and update visitor data.

The API accepts the visitor ID (if known), current page URL, referrer, and user agent. It returns the complete visitor profile including all stored data. For event tracking, it also accepts an event name and optional properties object.

### Contact Request API

The application includes an API endpoint (`/api/contact`) for processing contact form submissions. This endpoint applies multiple security layers before forwarding to downstream systems:

1. **Rate Limiting** - 5 requests per minute per IP (Upstash Redis)
2. **CSRF Validation** - Double-submit cookie pattern
3. **Input Validation** - Zod schema validation with DOMPurify sanitisation
4. **Security Headers** - Applied via middleware

After validation, the endpoint:
1. Forwards to NS Adapter → NetSuite (creates lead)
2. Calls `linkIdentity` → Firebase (links visitor to email)
3. Triggers tracking event → Amplitude
4. Returns success response to frontend

---

## Functionality

### Equipment Enquiry System

The equipment enquiry system allows visitors to build a list of equipment they're interested in and submit a grouped enquiry. This workflow reduces friction compared to enquiring about each item individually.

The enquiry cart is managed through a React context that persists state to localStorage. This ensures the cart survives page navigation and browser refreshes. The context provides methods for adding items, removing items, checking if an item is in the cart, and clearing the cart entirely.

Equipment cards throughout the site display an "Add to Enquiry" button. When clicked, the item is added to the cart with its ID, name, brand, category, and image URL. Visual feedback shows when an item is already in the cart, and clicking again removes it.

A floating bubble appears in the corner when items are in the cart. It displays the current item count and animates when new items are added to draw attention. Clicking the bubble opens the enquiry panel.

The enquiry panel slides out to show all selected equipment with the ability to remove individual items. Below the equipment list, a form collects contact details including name, phone, email, company, industry, preferred branch, and project location. Submitting the form sends the enquiry to the contact API and clears the cart on success.

A quick view modal provides detailed equipment information without leaving the current page. It displays multiple images with thumbnail navigation, specifications, pricing tiers, and power/environment badges. The modal includes both an add-to-enquiry button and a direct call button.

### Content Personalisation

The Hero component supports URL-based personalisation through campaign parameters. When visitors arrive via marketing campaigns, the URL typically includes tracking parameters identifying the campaign source and content variant.

The personalisation system reads these parameters and builds a context object containing the campaign identifier, any category targeting, and override content. This context can modify the headline, subheadline, background image, and call-to-action text.

Category-specific campaigns can highlight relevant keywords in the headline using the brand's primary colour. Geographic parameters can localise content to specific regions. The system falls back to default content when no personalisation parameters are present.

### Visual Editing

Builder.io's visual editor is fully integrated into the application. When content editors access a page through the Builder.io interface, the application detects the editing context and adjusts its behaviour accordingly.

In editing mode, the page renders with additional metadata that enables the visual editor's drag-and-drop functionality. Editors can select any registered component, modify its properties through the sidebar panel, and see changes reflected immediately in the preview.

Components are registered with Builder.io including their property schemas, default values, and friendly names. This registration enables the editor to present appropriate input controls for each property type, from simple text fields to complex nested configurations.

---

## Component Library

The application includes a comprehensive library of components registered for use in Builder.io:

Layout components include a brand-aware header with logo switching based on the active brand, and a footer with location-based contact information, social links, and brand-appropriate styling.

Hero components provide full-width introductory sections with configurable background images, overlay intensity, headlines with optional category highlighting, subheadlines, and primary/secondary call-to-action buttons. They support personalisation overrides and multiple height presets.

Content components include a rich text block with WYSIWYG editing capabilities and a contact form with full validation, API integration, and configurable field visibility.

Equipment components include a grid layout that fetches and displays equipment from the API with filtering capabilities, individual equipment cards with pricing and specifications, a search interface with category and brand filters, and a detail modal for quick viewing.

Landing page components provide a complete toolkit for building conversion-focused pages, including trust badges, benefits sections, testimonials, FAQ accordions, call-to-action banners, and sticky forms.

All components use CSS variables for theming and automatically adapt to the active brand without any component-level configuration.

---

## CI/CD Process

### Branch Strategy

The codebase follows a three-environment deployment model:

```
feature/* ──► develop (Dev) ──► staging (UAT) ──► main (Production)
     │              │                │                  │
     │              ▼                ▼                  ▼
  Preview      clg-dev.         clg-uat.           clg.
  deploys      vercel.app       vercel.app         vercel.app
```

### Environment Configuration

| Environment | Branch | Domain | Approvers | Tests |
|-------------|--------|--------|-----------|-------|
| Production | `main` | `clg.vercel.app` | 2 required | Full E2E |
| UAT | `staging` | `clg-uat.vercel.app` | 1 required | Unit + Integration |
| Development | `develop` | `clg-dev.vercel.app` | 1 required | Lint + Build |
| Preview | `feature/*` | Auto-generated | None | Lint + Build |

### GitHub Actions Workflows

#### CI Pipeline (`.github/workflows/ci.yml`)

Runs on all pull requests:
1. **Lint & TypeScript** - ESLint + `tsc --noEmit`
2. **Security Scan** - `npm audit` + Snyk vulnerability check
3. **Unit Tests** - Jest with coverage reporting
4. **Build Validation** - Next.js production build
5. **E2E Tests** - Playwright (staging/main PRs only)

#### PR Checks (`.github/workflows/pr-checks.yml`)

Additional validation for pull requests:
- Lighthouse performance audit
- Bundle size analysis
- Visual regression tests (optional)

### Branch Protection Rules

**`main` (Production):**
- 2 approvers required
- All status checks must pass
- Require signed commits
- Restrict push to release managers

**`staging` (UAT):**
- 1 approver required
- Status checks: lint, security, test, build

**`develop` (Dev):**
- 1 approver required
- Status checks: lint, build

### Preview Deployments

For pull requests, Vercel automatically creates preview deployments on unique URLs. This allows changes to be tested in a production-like environment before merging. Preview URLs are posted as comments on the pull request for easy access.

### Rollback Strategy

1. **Instant Rollback:** Vercel dashboard → Deployments → Promote previous
2. **Git-based Rollback:** Create `hotfix/rollback-*` branch, revert commits, expedited PR

### Cloud Function Deployment

The Firebase Cloud Functions are deployed separately through Google Cloud Platform's tooling. Deployment can be triggered via npm script or directly through the gcloud CLI. The functions automatically scale based on traffic and require no capacity planning.

---

## Security

### Security Layers

All API routes pass through multiple security layers implemented in middleware and route handlers:

```
Request → Rate Limiting → CSRF Check → Input Validation → Security Headers → Handler
              ↓               ↓              ↓                  ↓
           429 Error      403 Error      400 Error         Response Headers
```

### Rate Limiting

Implemented using Upstash Redis with a sliding window algorithm:

- **Limit:** 5 requests per minute per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response:** 429 with `Retry-After` header

```typescript
// Configuration
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "clg:ratelimit",
});
```

### CSRF Protection

Double-submit cookie pattern implementation:

1. Server generates cryptographic token
2. Token stored in HTTP-only cookie AND returned to client
3. Client includes token in request body
4. Server validates cookie token matches body token

### Input Validation

Zod schemas with DOMPurify sanitisation:

```typescript
// All text inputs are sanitised
const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
};

// Schema validates and transforms
const ContactFormSchema = z.object({
  contactEmail: z.string().email().transform(val => val.toLowerCase().trim()),
  contactMessage: z.string().min(10).max(5000).transform(sanitizeHtml),
  // ... other fields
});
```

### Security Headers

Applied via Next.js middleware:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Strict CSP | XSS prevention |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing prevention |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking prevention |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer control |

### Secrets Management

**Server-only (never exposed):**
- `AG_API_CLIENT_SECRET`
- `ITERABLE_API_KEY`
- `AMPLITUDE_SERVER_API_KEY`
- `PII_ENCRYPTION_KEY`
- `CSRF_SECRET`
- `UPSTASH_REDIS_REST_TOKEN`

**Public (safe to expose):**
- `NEXT_PUBLIC_BUILDER_API_KEY`
- `NEXT_PUBLIC_AMPLITUDE_API_KEY`
- `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`
- `NEXT_PUBLIC_ENVIRONMENT`

### PII Handling

- Email addresses are SHA-256 hashed before sending to analytics
- Phone numbers are normalised and hashed
- Full PII only sent to NS Adapter over HTTPS
- Visitor tracking uses anonymous UUIDs

---

## Brand Configuration

### Default Brand

The default brand uses a red colour scheme reflecting Access Hire Australia's established identity. The header uses a white background with dark text for contrast, while the footer uses the brand red with white text. Typography pairs a geometric sans-serif for headings with a humanist sans-serif for body text.

### Secondary Brand

The secondary brand uses a navy colour scheme for a more corporate appearance. Both header and footer use the deep navy background with white text, creating a distinctive look that immediately differentiates it from the primary brand. An orange secondary colour provides vibrant call-to-action buttons, while a blue accent colour handles links and highlights. Typography uses different font families to further distinguish the brand identity.

### Adding New Brands

New brands can be added through the CMS interface by creating a new brand entry and populating all required colour, typography, and asset fields. Alternatively, brands can be added to the local configuration file for developer-managed brands. Once created, brands become immediately available for selection when editing pages.

---

## Performance Considerations

Server-side rendering ensures fast initial page loads by delivering fully-rendered HTML before JavaScript executes. This also ensures content is indexable by search engines without requiring JavaScript execution.

CSS variable theming operates entirely in CSS, avoiding JavaScript overhead for style calculations. Theme switching between brands requires no additional network requests or style recalculation.

Content caching through Incremental Static Regeneration reduces API calls to the CMS while ensuring published changes propagate within a reasonable timeframe. Static assets are served from edge locations geographically close to visitors.

Image optimisation happens automatically through the framework's image component, which handles responsive sizing, format selection, and lazy loading without manual intervention.

Font loading uses the display swap strategy to prevent invisible text during font loading, with fallback system fonts specified to maintain layout stability.

---

## Appendix: Environment Variables

### Required Variables

```bash
# Builder.io
NEXT_PUBLIC_BUILDER_API_KEY=
BUILDER_PRIVATE_KEY=

# Firebase
GOOGLE_CLOUD_PROJECT=
FIREBASE_LINK_IDENTITY_URL=

# Analytics
NEXT_PUBLIC_AMPLITUDE_API_KEY=
AMPLITUDE_SERVER_API_KEY=

# Observability
NEXT_PUBLIC_DATADOG_APPLICATION_ID=
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=
NEXT_PUBLIC_DATADOG_SITE=
NEXT_PUBLIC_DATADOG_SERVICE=
NEXT_PUBLIC_DATADOG_ENV=

# Security
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CSRF_SECRET=

# Integrations
NS_ADAPTER_URL=
NS_ADAPTER_API_KEY=
ITERABLE_API_KEY=

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
ALGOLIA_ADMIN_KEY=
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - High-level architecture overview
- [ENTERPRISE-ARCHITECTURE-PLAN.md](./ENTERPRISE-ARCHITECTURE-PLAN.md) - Implementation roadmap
- [identity-graph-plan.md](./identity-graph-plan.md) - Identity resolution design
- [diagrams/README.md](./diagrams/README.md) - Architecture diagrams
- [adr/README.md](./adr/README.md) - Architecture Decision Records
