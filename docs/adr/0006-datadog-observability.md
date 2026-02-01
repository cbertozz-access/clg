# ADR-0006: Datadog for Application Observability

## Status
Proposed

## Date
2025-01-31

## Context

CLG production environment needs comprehensive observability:
- Real User Monitoring (RUM) - Frontend performance
- Application Performance Monitoring (APM) - Backend traces
- Log aggregation - Centralized logging
- Error tracking - Exception monitoring
- Alerts - Proactive incident response

Observability platforms considered:
1. **Datadog** - Full-stack observability platform
2. **New Relic** - APM-focused, similar feature set
3. **Vercel Analytics** - Built-in, limited features
4. **Grafana Cloud** - Open-source based
5. **Sentry** - Error tracking focused

Requirements:
- Next.js 14 App Router support
- Vercel deployment integration
- RUM for Core Web Vitals
- Distributed tracing for API calls
- Under $500/month budget

## Decision

We will use **Datadog** for end-to-end observability with:
- RUM SDK for browser performance
- APM via OpenTelemetry for backend traces
- Logs integration with Vercel log drain
- Synthetic monitoring for uptime

## Rationale

### Why Datadog?

1. **Full stack**: Single platform for RUM, APM, logs
2. **Vercel integration**: Native log drain, deployment tracking
3. **OpenTelemetry**: Standard instrumentation, not locked in
4. **Dashboards**: Pre-built Next.js dashboards
5. **Alerting**: Sophisticated alert conditions

### Why NOT alternatives?

**New Relic**: Similar capabilities, less strong RUM offering.

**Vercel Analytics**: Limited to Web Vitals. No APM or custom events.

**Grafana Cloud**: Requires more setup, less polished UX.

**Sentry**: Excellent for errors, but not full APM/RUM solution.

### Architecture

```
Browser                    Vercel                     Datadog
   │                         │                          │
   ├─── RUM SDK ─────────────┼────────────────────────▶│ RUM
   │                         │                          │
   │    Next.js              │                          │
   │      │                  │                          │
   │    OpenTelemetry ───────┼────────────────────────▶│ APM
   │      │                  │                          │
   │    Logs ────────────────┼─── Log Drain ──────────▶│ Logs
   │                         │                          │
                             │                          │
   Synthetics ◀──────────────┼──────────────────────────┤
```

### Implementation Phases

**Phase 1 - RUM (Week 1)**
- Add @datadog/browser-rum SDK
- Configure Core Web Vitals collection
- Create performance dashboard

**Phase 2 - APM (Week 2)**
- Add @vercel/otel instrumentation
- Export traces to Datadog
- Create service map

**Phase 3 - Logs (Week 3)**
- Configure Vercel log drain
- Set up log parsing rules
- Create log dashboard

**Phase 4 - Alerts (Week 4)**
- Define SLOs (p99 latency, error rate)
- Create alert conditions
- Configure PagerDuty integration

## Consequences

### Positive
- End-to-end visibility across stack
- Automatic distributed tracing
- Core Web Vitals monitoring
- Unified dashboards and alerts
- Historical data for debugging

### Negative
- Monthly cost (~$200-400)
- Additional JavaScript bundle (~30KB)
- Learning curve for team
- Data egress from Vercel

### Risks
- Datadog outage doesn't affect app, but loses visibility
- High cardinality custom tags could increase cost
- RUM sampling needed at scale

## Implementation

RUM setup (client component):
```typescript
// src/components/DatadogRum.tsx
"use client";

import { datadogRum } from "@datadog/browser-rum";

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APP_ID!,
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site: "datadoghq.com",
  service: "clg-website",
  env: process.env.NODE_ENV,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: "mask-user-input",
});
```

APM setup (instrumentation.ts):
```typescript
// src/instrumentation.ts
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "clg-website",
    // Datadog OTLP endpoint
    traceExporter: "otlp",
  });
}
```

Environment variables:
- `NEXT_PUBLIC_DD_APP_ID` - RUM Application ID
- `NEXT_PUBLIC_DD_CLIENT_TOKEN` - RUM Client Token
- `DD_API_KEY` - Server-side API key
- `DD_SITE` - Datadog site (datadoghq.com)

Vercel Log Drain:
```bash
vercel integrations add datadog
```

## Cost Estimate

| Component | Volume | Cost/Month |
|-----------|--------|------------|
| RUM | 100K sessions | ~$100 |
| APM | 1M spans | ~$50 |
| Logs | 5GB/month | ~$25 |
| Synthetics | 5 tests | ~$25 |
| **Total** | | **~$200** |

## Related Decisions
- ADR-0001: Rate Limiting (uses same observability)
- ADR-0005: NS Adapter (traces API calls)
