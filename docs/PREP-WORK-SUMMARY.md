# CLG Enterprise - Prep Work Summary

This document summarizes all the preparatory work completed while offline.

## Files Created/Modified

### Security Layer (`src/lib/security/`)

| File | Purpose |
|------|---------|
| `rate-limit.ts` | Upstash Redis rate limiting (5 req/min per IP) |
| `csrf.ts` | Double-submit cookie CSRF protection |
| `validation.ts` | Zod schema with DOMPurify sanitization |
| `index.ts` | Barrel export for all security utilities |

### Middleware (`src/middleware.ts`)

Security headers applied to all routes:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-XSS-Protection: 1; mode=block
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### API Routes

| File | Purpose |
|------|---------|
| `src/app/api/contact/route.ts` | Updated with full security layer integration |
| `src/app/api/csrf-token/route.ts` | CSRF token endpoint for client-side forms |

### Components

| File | Purpose |
|------|---------|
| `src/components/analytics/DatadogRum.tsx` | Datadog RUM initialization |
| `src/components/analytics/index.ts` | Analytics barrel export |
| `src/components/forms/CSRFToken.tsx` | Server component for CSRF tokens |

### Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useCSRFToken.ts` | Client hook for fetching CSRF tokens |

### Configuration

| File | Purpose |
|------|---------|
| `next.config.ts` | Updated with instrumentation hook, CSP for Datadog/Upstash |
| `src/instrumentation.ts` | OpenTelemetry setup for Vercel |
| `package.json` | Added security/observability dependencies |
| `.env.example` | Environment variables template |
| `lighthouserc.json` | Lighthouse CI performance thresholds |

### CI/CD (`.github/workflows/`)

| File | Purpose |
|------|---------|
| `ci.yml` | Main pipeline: lint, build, security scan, deploy |
| `pr-checks.yml` | PR preview deploys with Lighthouse audits |

### ADRs (`docs/adr/`)

| ADR | Title |
|-----|-------|
| 0001 | Use Upstash Redis for Rate Limiting |
| 0002 | CSRF Protection via Double-Submit Cookie |
| 0003 | Input Validation with Zod and DOMPurify |
| 0004 | Firebase Firestore for Identity Resolution |
| 0005 | NetSuite Integration via NS Adapter |
| 0006 | Datadog for Application Observability |

---

## Dependencies Added

```json
{
  "@datadog/browser-rum": "^5.0.0",
  "@upstash/ratelimit": "^2.0.0",
  "@upstash/redis": "^1.34.0",
  "@vercel/otel": "^1.10.0",
  "isomorphic-dompurify": "^2.16.0",
  "zod": "^3.24.0"
}
```

---

## Environment Variables Required

```bash
# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# CSRF
CSRF_SECRET=  # Generate with: openssl rand -hex 32

# Datadog (optional, for observability)
NEXT_PUBLIC_DD_APP_ID=
NEXT_PUBLIC_DD_CLIENT_TOKEN=
DD_API_KEY=

# Firebase
FIREBASE_PROJECT_ID=composable-lg
```

---

## Next Steps When Back Online

1. **Install dependencies**: `npm install`
2. **Create Upstash Redis database**: https://console.upstash.com/
3. **Generate CSRF secret**: `openssl rand -hex 32`
4. **Set environment variables** in Vercel dashboard
5. **Test locally**: `npm run dev`
6. **Commit and push**: All files ready for commit

---

## Architecture Overview

```
Browser Request
      │
      ▼
┌─────────────────────────────────────────┐
│           Next.js Middleware            │
│  (Security Headers, CSP)                │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│         /api/contact Route              │
│                                         │
│  1. Rate Limit Check (Upstash)          │
│  2. CSRF Validation                     │
│  3. Input Validation (Zod)              │
│  4. Sanitization (DOMPurify)            │
│  5. NS Adapter → NetSuite               │
│  6. Firebase linkIdentity (async)       │
│  7. Response                            │
└─────────────────────────────────────────┘
      │
      ▼
   Success/Error Response
```

---

*Generated: 2025-02-01*
