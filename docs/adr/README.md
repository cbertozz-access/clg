# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the CLG Enterprise project.

## What are ADRs?

ADRs document significant architectural decisions made during the project. Each ADR describes:
- **Context**: Why we needed to make a decision
- **Decision**: What we decided
- **Rationale**: Why we chose this over alternatives
- **Consequences**: Trade-offs and implications

## ADR Index

| # | Title | Status | Date |
|---|-------|--------|------|
| [0001](./0001-use-upstash-redis-for-rate-limiting.md) | Use Upstash Redis for Rate Limiting | Accepted | 2025-01-31 |
| [0002](./0002-csrf-protection-double-submit-cookie.md) | CSRF Protection via Double-Submit Cookie | Accepted | 2025-01-31 |
| [0003](./0003-zod-validation-with-sanitization.md) | Input Validation with Zod and DOMPurify | Accepted | 2025-01-31 |
| [0004](./0004-firebase-identity-resolution.md) | Firebase Firestore for Identity Resolution | Accepted | 2025-01-31 |
| [0005](./0005-ns-adapter-integration.md) | NetSuite Integration via NS Adapter | Accepted | 2025-01-31 |
| [0006](./0006-datadog-observability.md) | Datadog for Application Observability | Proposed | 2025-01-31 |

## Statuses

- **Proposed**: Under discussion, not yet implemented
- **Accepted**: Approved and being implemented
- **Deprecated**: No longer applies, superseded by another ADR
- **Superseded**: Replaced by a newer ADR (link to replacement)

## Creating New ADRs

1. Copy the template below
2. Number sequentially (e.g., `0007-new-decision.md`)
3. Fill in all sections
4. Submit PR for review
5. Update this README index

## Template

```markdown
# ADR-NNNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX](./xxxx.md)

## Date
YYYY-MM-DD

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Rationale
Why is this the best choice? What alternatives were considered?

## Consequences
What are the positive and negative effects of this decision?

## Implementation
Code examples, configuration, etc.

## Related Decisions
Links to related ADRs
```

## Further Reading

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's original post](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Lightweight ADRs](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records)
