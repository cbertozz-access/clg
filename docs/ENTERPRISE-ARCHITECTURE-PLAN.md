# CLG Enterprise Architecture Plan

**Created:** January 2026
**Status:** Draft - Pending Implementation

## Executive Summary

This plan designs an enterprise-grade architecture for CLG covering:
1. **CI/CD Pipeline** - Dev/UAT/Production environments with automated testing
2. **Secure Data Pipeline** - Forms → Amplitude → AG Internal (replacing unsecured AG API)
3. **Security & Compliance** - Enterprise security posture

**Current State:** Single `main` branch auto-deploys to Vercel. No CI/CD, no staging, contact forms POST to unsecured `dev-agws.aghost.au` API.

**Vercel Upgrade Required:** Yes (Pro plan for multiple environments)

---

## Part 1: CI/CD Architecture

### Branch Strategy

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

#### 1. CI Pipeline (`.github/workflows/ci.yml`)
Runs on all PRs:
- Lint & TypeScript check
- Security scan (npm audit + Snyk)
- Unit tests with coverage
- Build validation
- E2E tests (staging/main PRs only)

#### 2. Deploy Pipeline (`.github/workflows/deploy.yml`)
Runs on push to `develop`, `staging`, `main`:
- Deploy to corresponding Vercel environment
- Slack notification on success/failure

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

### Rollback Strategy

1. **Instant:** Vercel dashboard → Deployments → Promote previous
2. **Git-based:** Create `hotfix/rollback-*` branch, revert commits, expedited PR

### Builder.io Multi-Environment

**Recommended: Separate Builder.io Spaces**
- Production space with production API key
- Staging space with staging API key
- Dev space with dev API key
- Use "Duplicate Space" to promote content

---

## Part 2: Secure Data Pipeline

### Current Problem
Forms POST directly to `https://dev-agws.aghost.au/api/contact-request` - unsecured, no validation, no audit trail.

### New Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────►│  API Layer  │────►│  Amplitude  │
│  (Forms)    │     │  (Secure)   │     │  (Data Hub) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   AG API    │◄────│ NS Adapters │
                    │  (Secured)  │     │ (Webhooks)  │
                    └─────────────┘     └─────────────┘
```

### Key Components

#### 1. Event Schema (`/src/lib/analytics/schemas.ts`)
Standardised TypeScript interfaces for all events:
- `ContactFormEvent` - Form submissions
- `QuoteRequestEvent` - Equipment quotes
- `UserIdentifyEvent` - Bidirectional sync

#### 2. Amplitude Integration (`/src/lib/analytics/amplitude.ts`)
- Browser SDK for client tracking
- Server SDK for secure event sending
- PII never sent to Amplitude (hashed only)

#### 3. Secure API Gateway (`/src/app/api/v1/contact/route.ts`)
Replace current `/api/contact` with:
- Rate limiting (Upstash Redis)
- CSRF validation
- Zod schema validation
- PII hashing for analytics
- Encrypted payload for AG API
- Full audit logging

#### 4. Amplitude Webhooks (`/src/app/api/webhooks/amplitude/route.ts`)
Bidirectional sync:
- Receive events from Amplitude
- Sync to NetSuite via NS Adapters
- Support cohort updates, conversions

#### 5. Secure AG API Client (`/src/lib/integrations/ag-api.ts`)
- JWT authentication (short-lived tokens)
- Encrypted payloads
- Request signing
- Retry with backoff

---

## Part 3: Security & Compliance

### Secrets Management

**Server-only (never exposed):**
- `AG_API_CLIENT_SECRET`
- `ITERABLE_API_KEY`
- `AMPLITUDE_SERVER_API_KEY`
- `PII_ENCRYPTION_KEY`
- `CSRF_SECRET`

**Public (safe to expose):**
- `NEXT_PUBLIC_BUILDER_API_KEY`
- `NEXT_PUBLIC_AMPLITUDE_API_KEY`
- `NEXT_PUBLIC_ENVIRONMENT`

### Security Controls

| Control | Implementation |
|---------|---------------|
| Rate Limiting | Upstash Redis, 5 req/min for forms |
| CSRF Protection | Double-submit cookie pattern |
| Input Validation | Zod schemas with sanitization |
| PII Protection | SHA-256 hash for analytics, AES-256-GCM for storage |
| Audit Logging | All API calls logged with request ID |
| Security Headers | CSP, HSTS, X-Frame-Options, etc. |

### Middleware (`/src/middleware.ts`)
Add security headers:
- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Upgrade Vercel to Pro plan
- [ ] Create `develop` and `staging` branches
- [ ] Configure branch protection rules
- [ ] Set up environment-specific Vercel domains
- [ ] Create GitHub Actions CI/CD workflows
- [ ] Set up Slack deployment notifications

### Phase 2: Security Hardening (Week 3-4)
- [ ] Install dependencies: `zod`, `@upstash/ratelimit`, `jose`, `isomorphic-dompurify`
- [ ] Create CSRF token generation/validation
- [ ] Implement rate limiting with Upstash Redis
- [ ] Add input validation schemas for all forms
- [ ] Create security headers middleware
- [ ] Set up audit logging infrastructure

### Phase 3: Data Pipeline (Week 5-6)
- [ ] Create Amplitude account and project
- [ ] Install `@amplitude/analytics-browser` and server SDK
- [ ] Define event schemas in TypeScript
- [ ] Create secure `/api/v1/contact` endpoint
- [ ] Implement PII hashing and encryption
- [ ] Create Amplitude webhook receiver
- [ ] Design secure AG API contract with JWT auth

### Phase 4: Testing & Compliance (Week 7-8)
- [ ] Add Jest unit tests for security functions
- [ ] Add Playwright E2E tests for form flows
- [ ] Run Snyk security scan
- [ ] Create data flow documentation
- [ ] Document PII handling procedures
- [ ] Create incident response plan

---

## Critical Files to Modify/Create

### New Files
- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/deploy.yml` - Deploy pipeline
- `/src/lib/analytics/schemas.ts` - Event type definitions
- `/src/lib/analytics/amplitude.ts` - Amplitude SDK wrapper
- `/src/lib/security/rate-limit.ts` - Rate limiting
- `/src/lib/security/csrf.ts` - CSRF protection
- `/src/lib/security/pii.ts` - PII encryption/hashing
- `/src/lib/security/audit.ts` - Audit logging
- `/src/lib/security/validation.ts` - Input schemas
- `/src/lib/integrations/ag-api.ts` - Secure AG client
- `/src/app/api/v1/contact/route.ts` - New secure contact endpoint
- `/src/app/api/webhooks/amplitude/route.ts` - Amplitude webhook handler

### Modified Files
- `/src/middleware.ts` - Add security headers
- `/package.json` - Add dependencies
- `/next.config.ts` - CSP configuration

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@amplitude/analytics-browser": "^2.x",
    "@amplitude/analytics-node": "^1.x",
    "zod": "^3.x",
    "jose": "^5.x",
    "isomorphic-dompurify": "^2.x"
  },
  "devDependencies": {
    "@upstash/ratelimit": "^1.x",
    "@upstash/redis": "^1.x",
    "@playwright/test": "^1.x",
    "snyk": "^1.x"
  }
}
```

---

## Verification Plan

### CI/CD Verification
1. Create feature branch, verify preview deploy
2. PR to develop, verify Dev deployment
3. PR to staging, verify UAT deployment
4. PR to main, verify Production deployment
5. Test rollback via Vercel dashboard

### Security Verification
1. Submit form without CSRF token → expect 403
2. Exceed rate limit → expect 429 with Retry-After
3. Submit invalid data → expect 400 with validation errors
4. Verify PII is hashed in Amplitude events
5. Verify audit logs contain all API calls

### Data Pipeline Verification
1. Submit contact form → verify Amplitude event received
2. Verify AG API receives encrypted payload
3. Trigger Amplitude webhook → verify NS Adapter sync
4. Check bidirectional data flow end-to-end

---

## Cost Considerations

| Service | Plan | Est. Monthly Cost |
|---------|------|-------------------|
| Vercel Pro | Team | $20/member |
| Upstash Redis | Pay-as-you-go | $10-50 |
| Amplitude | Growth | Free tier to start |
| Snyk | Free tier | $0 |
| GitHub Actions | Included | $0 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Deployment breaks production | Branch protection + E2E tests + instant rollback |
| Data breach | PII encryption + audit logs + rate limiting |
| AG API unavailable | Queue failed requests + retry with backoff |
| Amplitude outage | Graceful degradation, events queued locally |
| Secret exposure | Server-only env vars + no secrets in code |

---

## Appendix: GitHub Actions Workflow Examples

### CI Pipeline Example

```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [develop, staging, main]

jobs:
  lint-and-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=moderate
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-types]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_BUILDER_API_KEY: ${{ secrets.BUILDER_API_KEY_DEV }}
```

### Deploy Pipeline Example

```yaml
name: Deploy

on:
  push:
    branches: [develop, staging, main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name == 'main' && 'production' || github.ref_name == 'staging' && 'uat' || 'development' }}
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref_name == 'main' && '--prod' || '' }}
```
