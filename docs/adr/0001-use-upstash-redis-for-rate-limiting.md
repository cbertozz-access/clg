# ADR-0001: Use Upstash Redis for Rate Limiting

## Status
Accepted

## Date
2025-01-31

## Context

The CLG contact form API needs protection against abuse, including:
- Automated spam submissions
- DoS attempts against the endpoint
- Excessive requests from individual IPs

Rate limiting options considered:
1. **In-memory rate limiting** (e.g., node-rate-limiter-flexible with memory store)
2. **Vercel Edge Config** with custom logic
3. **Upstash Redis** with @upstash/ratelimit SDK
4. **Redis Cloud / AWS ElastiCache** self-managed

Key requirements:
- Works in serverless/edge environment (Vercel)
- Persistent across function invocations
- Low latency (< 50ms overhead)
- No infrastructure management needed
- Cost-effective for expected traffic volume

## Decision

We will use **Upstash Redis with the @upstash/ratelimit SDK** for rate limiting.

Configuration:
- Sliding window algorithm (fairest distribution)
- 5 requests per minute per IP address
- 5 second timeout for Redis operations
- Analytics enabled for monitoring

## Rationale

### Why Upstash?
1. **Serverless-native**: REST API works perfectly in Vercel Edge/Serverless
2. **Zero ops**: No Redis cluster to manage, automatic scaling
3. **Built-in SDK**: @upstash/ratelimit provides battle-tested algorithms
4. **Low latency**: Regional endpoints in Sydney (australia-southeast1)
5. **Cost**: Pay-per-request model, ~$0.20 per 100K commands

### Why NOT alternatives?

**In-memory**: Doesn't persist across serverless invocations. Each cold start resets limits.

**Vercel Edge Config**: Good for feature flags, not designed for high-frequency counter operations.

**Self-managed Redis**: Requires VPC setup, connection pooling, availability management.

### Sliding Window vs Fixed Window

Sliding window chosen because:
- Prevents burst at window boundaries
- Fairer to legitimate users
- Minimal memory overhead with Upstash implementation

## Consequences

### Positive
- Sub-10ms rate limit checks
- Accurate limits across distributed serverless instances
- Built-in analytics dashboard in Upstash console
- Easy to adjust limits without code changes (Upstash console)

### Negative
- Additional external dependency
- Small additional latency (~5-10ms per request)
- Monthly cost (~$10-50 depending on traffic)

### Risks
- Upstash outage would fail-open (requests allowed)
- Need to monitor Redis memory usage

## Implementation

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "clg:ratelimit",
  timeout: 5000,
});
```

Environment variables required:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Related Decisions
- ADR-0002: CSRF Protection Pattern
- ADR-0003: Input Validation with Zod
