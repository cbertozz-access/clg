# CLG Enterprise Architecture Session Notes

**Date:** 1 February 2026
**Session:** Continued from interrupted session (power cut)
**Status:** Phase 1 & 2 Complete, Phase 3 Partial

---

## Session Summary

This session recovered from a power cut interruption and completed the majority of the CLG Enterprise Architecture implementation. The session focused on CI/CD setup, security hardening, and third-party integrations.

---

## What Was Completed

### 1. CI/CD Infrastructure ✅

**Branches Created:**
- `develop` - Development environment
- `staging` - UAT environment
- `main` - Production (existing)

**Branch Protection Rules Configured:**
- `main`: 1 approver required, status checks (Lint & Type Check, Build, Security Scan)
- `develop`: Status checks (Lint & Type Check)

**GitHub Workflows Created:**
- `.github/workflows/ci.yml` - Full CI pipeline (lint, build, security, deploy)
- `.github/workflows/pr-checks.yml` - PR validation
- `.github/workflows/changelog.yml` - Auto-update CHANGELOG on push to main
- `.github/workflows/update-diagrams.yml` - Auto-regenerate diagrams via Eraser API

### 2. Security Layer ✅

**Files Implemented:**
- `src/lib/security/rate-limit.ts` - Upstash Redis rate limiting (5 req/min)
- `src/lib/security/csrf.ts` - Double-submit cookie CSRF protection
- `src/lib/security/validation.ts` - Zod schema validation with HTML sanitization
- `src/lib/security/index.ts` - Security module exports
- `src/middleware.ts` - Security headers (CSP, HSTS, X-Frame-Options, etc.)

**Unit Tests:**
- `src/lib/security/__tests__/csrf.test.ts` - 8 tests
- `src/lib/security/__tests__/validation.test.ts` - 15 tests
- `src/lib/security/__tests__/rate-limit.test.ts` - 4 tests
- **Total: 27 tests passing**

### 3. Third-Party Integrations ✅

**Amplitude Analytics:**
- Installed `@amplitude/analytics-browser`
- Created `src/lib/analytics/amplitude.ts` - SDK wrapper with typed events
- Created `src/lib/analytics/index.ts` - Module exports
- Created `src/components/AnalyticsProvider.tsx` - React context provider
- Integrated into `src/app/layout.tsx`

**Iterable Email Marketing:**
- Created `src/lib/integrations/iterable.ts` - API wrapper
- Integrated into `/api/contact` route
- Syncs contact form submissions for email campaigns

**Upstash Redis:**
- Configured for rate limiting
- Lazy initialization (graceful fallback if not configured)

### 4. Vercel Environment Variables ✅

| Variable | Environments | Status |
|----------|--------------|--------|
| `UPSTASH_REDIS_REST_URL` | All | ✅ Set |
| `UPSTASH_REDIS_REST_TOKEN` | All | ✅ Set |
| `NEXT_PUBLIC_AMPLITUDE_API_KEY` | All | ✅ Set |
| `ITERABLE_API_KEY` | All | ✅ Set |
| `ERASER_API_TOKEN` | GitHub Secret | ✅ Set |
| `BUILDER_PRIVATE_KEY` | All | ✅ Pre-existing |
| `NEXT_PUBLIC_BUILDER_API_KEY` | Production | ✅ Pre-existing |

### 5. Code Quality ✅

**ESLint:**
- Fixed from 15 errors → 0 errors
- 39 warnings remain (non-blocking)
- Updated `eslint.config.mjs` to ignore `functions/` and `public/*.js`

**Testing Framework:**
- Installed Jest with ts-jest
- Created `jest.config.js` and `jest.setup.js`
- Added npm scripts: `test`, `test:watch`, `test:coverage`

### 6. Documentation ✅

**Updated:**
- `docs/TECHNICAL-SPECIFICATION.md` - Added Observability, Analytics, Email Marketing, CI/CD, Security sections
- `CHANGELOG.md` - Created with Keep a Changelog format

**Diagrams Regenerated (via Eraser API):**
- `docs/diagrams/01-system-overview.png`
- `docs/diagrams/03-identity-graph.png`
- `docs/diagrams/04-cicd-pipeline.png`
- `docs/diagrams/05-security-layer.png`

---

## GitHub Issues Status

| # | Task | Status |
|---|------|--------|
| 1 | Set up Upstash Redis env vars | ✅ Closed |
| 2 | Configure Datadog RUM env vars | 🟡 Open |
| 3 | Set up Amplitude analytics | ✅ Closed |
| 4 | Create develop/staging branches | ✅ Closed |
| 5 | Configure Iterable email integration | ✅ Closed |
| 6 | Fix ESLint errors | ✅ Closed |
| 7 | Add unit tests for security functions | ✅ Closed |

---

## What Remains To Do

### Immediate (Next Session)

1. **Datadog RUM Configuration** (Issue #2)
   - Need credentials: `DD_CLIENT_TOKEN`, `DD_APPLICATION_ID`
   - Datadog SDK already installed (`@datadog/browser-rum`)
   - Need to create `DatadogRum` provider component
   - Integrate into layout

### Builder.io Work Required

Based on the Enterprise Architecture Plan, the following Builder.io work is needed:

1. **Multi-Environment Spaces**
   - Create separate Builder.io spaces for Dev/Staging/Production
   - Or configure content targeting by environment
   - Set up content promotion workflow between environments

2. **Content Enhancements**
   - Ensure all pages reference a brand
   - Add UTM parameter handling for personalization
   - Configure preview modes for each environment

3. **Visual Editor Testing**
   - Verify editing works in each environment
   - Test brand switching in editor
   - Validate component registration

### Phase 3 Remaining (Data Pipeline)

1. **Analytics Schema**
   - Create `src/lib/analytics/schemas.ts` with TypeScript event interfaces
   - Standardize event naming across the application

2. **Amplitude Server SDK**
   - Install `@amplitude/analytics-node` for server-side events
   - Implement PII hashing before analytics

3. **Amplitude Webhooks**
   - Create `/api/webhooks/amplitude/route.ts`
   - Enable bidirectional sync with NS Adapters

### Phase 4 (Testing & Compliance)

1. **E2E Tests**
   - Install Playwright
   - Write tests for form submission flows
   - Test equipment enquiry workflow

2. **Security Verification**
   - Test rate limiting manually
   - Verify CSRF protection
   - Run Snyk security scan

3. **Documentation**
   - Create data flow documentation
   - Document PII handling procedures
   - Create incident response plan

---

## Technical Notes

### Rate Limiting Behavior
- Uses lazy initialization - if Upstash env vars missing, rate limiting is disabled (returns 999 remaining)
- 5 requests per minute per IP
- Returns proper `Retry-After` headers

### CSRF Token Format
- Format: `token|hash` where hash = SHA256(token + secret)
- Stored in `__Host-csrf-token` cookie
- 24-hour expiry

### Contact Form Flow
```
Browser → /api/contact
   ↓
1. Rate Limit Check (Upstash Redis)
2. CSRF Validation (cookie + body)
3. Input Validation (Zod + sanitization)
4. Submit to NS Adapter (NetSuite)
5. Link Identity (Firebase)
6. Sync to Iterable (email marketing)
7. Return response
```

### Diagram Auto-Update Triggers
The `update-diagrams.yml` workflow triggers on changes to:
- `src/app/api/**/*.ts`
- `src/lib/security/**/*.ts`
- `src/middleware.ts`
- `functions/index.js`
- `public/clg-visitor.js`
- `.github/workflows/*.yml`

---

## Credentials Reference

### Already Configured
- **Upstash Redis URL:** `https://settled-koala-11658.upstash.io`
- **Upstash Redis Token:** Configured in Vercel
- **Amplitude API Key:** `8b523e98aa59d671b43d1e2411abfec5` (configured)
- **Iterable API Key:** `0b632883d44b49498eb1e7c396222dc5` (configured)
- **Eraser API Token:** Stored in GitHub secrets

### Still Needed
- **Datadog RUM:**
  - `NEXT_PUBLIC_DATADOG_APPLICATION_ID`
  - `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`
  - `NEXT_PUBLIC_DATADOG_SITE`
  - `NEXT_PUBLIC_DATADOG_SERVICE`
  - `NEXT_PUBLIC_DATADOG_ENV`

---

## Files Modified/Created This Session

### New Files
```
.github/workflows/changelog.yml
.github/workflows/update-diagrams.yml
.github/ISSUE_TEMPLATE/task.yml
.github/ISSUE_TEMPLATE/bug.yml
CHANGELOG.md
jest.config.js
jest.setup.js
src/lib/analytics/amplitude.ts
src/lib/analytics/index.ts
src/lib/integrations/iterable.ts
src/lib/security/__tests__/csrf.test.ts
src/lib/security/__tests__/validation.test.ts
src/lib/security/__tests__/rate-limit.test.ts
src/components/AnalyticsProvider.tsx
docs/SESSION-NOTES-2026-02-01.md (this file)
```

### Modified Files
```
eslint.config.mjs
package.json
package-lock.json
src/app/layout.tsx (added AnalyticsProvider)
src/app/api/contact/route.ts (added Iterable sync)
src/lib/security/rate-limit.ts (lazy initialization)
src/lib/security/validation.ts (SSR-safe sanitization)
src/lib/personalization.ts (const fix)
src/components/EnquiryCartBubble.tsx (requestAnimationFrame fix)
src/components/builder/lp/LPTestimonials.tsx (escaped quotes)
docs/TECHNICAL-SPECIFICATION.md (major update)
docs/diagrams/01-system-overview.png
docs/diagrams/03-identity-graph.png
docs/diagrams/04-cicd-pipeline.png
docs/diagrams/05-security-layer.png
```

---

## Git Commits This Session

1. `7292cfd` - Upgrade enterprise security architecture (earlier session)
2. `a3dd409` - Update architecture diagrams via Eraser API
3. `272d4d7` - Add automatic diagram update workflow
4. `c7c7834` - Fix ESLint errors (0 errors, 39 warnings remain)
5. `453cd97` - Add security unit tests (27 tests passing)
6. `08ca0f8` - Add Amplitude analytics integration
7. `f5a9512` - Add Iterable email marketing integration
