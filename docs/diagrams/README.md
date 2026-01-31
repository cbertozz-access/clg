# CLG Architecture Diagrams

This directory contains architecture diagrams for the CLG Enterprise system, following the **C4 Model** approach.

## Diagram Overview

| # | Diagram | File | Purpose | Audience |
|---|---------|------|---------|----------|
| 1 | System Context | `01-system-overview.png` | CLG in ecosystem with all integrations | Everyone |
| 2 | Form Submission Flow | `02-form-submission-flow.png` | Data flow from form to NetSuite | Backend devs |
| 3 | Identity Graph | `03-identity-graph.png` | Firebase identity resolution structure | Backend devs |
| 4 | CI/CD Pipeline | `04-cicd-pipeline.png` | GitHub → Vercel deployment flow | DevOps |
| 5 | Security Layer | `05-security-layer.png` | API protection layers | Security review |
| 6 | Security Architecture | `06-security-architecture.png` | Full security zones and controls | Security review |
| 7 | Security Architecture (Detailed) | `07-security-architecture-detailed.png` | Comprehensive security with all zones | Security audit |

## Interactive Diagrams (Eraser.io)

These diagrams are also available as interactive, editable versions in Eraser:

- **[Combined Master Canvas](https://app.eraser.io/new?requestId=h7pAaQu7g0uJd4JPfakZ)** - All sections in one view
- **[C4 Level 1: System Context](https://app.eraser.io/new?requestId=E1VKIB5xZcjIM1Z6Vx0q)** - CLG + users + external systems
- **[C4 Level 2: Containers](https://app.eraser.io/new?requestId=CbgNSR0eeLZaFADwD8wf)** - Next.js, API, Firebase, SDKs
- **[Data Flow: Form Submission](https://app.eraser.io/new?requestId=ug3MzKlKaocyAK4kwFxY)** - Form → NS Adapter → NetSuite
- **[Data Flow: Identity Resolution](https://app.eraser.io/new?requestId=BroINGO3goFdohPJb0XL)** - How linkIdentity resolves duplicates
- **[Deployment](https://app.eraser.io/new?requestId=nhIgl0WdLFls09kTKcJi)** - Vercel + Firebase + SaaS services
- **[Security Architecture](https://app.eraser.io/new?requestId=A1TzWjjz8IUnVezY2tW4)** - Security zones and controls
- **[Security Architecture (Detailed)](https://app.eraser.io/new?requestId=v3Q3HLS4pXgCLjuCoy77)** - Comprehensive security with all layers
- **[CI/CD Pipeline](https://app.eraser.io/new?requestId=ofyoSjmVe1fvCzCBUjDc)** - GitHub → Vercel deploy flow

## C4 Model Structure

These diagrams follow the [C4 Model](https://c4model.com/) approach:

```
Level 1: System Context
└── Shows CLG as a box surrounded by users and external systems

Level 2: Container
└── Breaks CLG into: Next.js Frontend, API Routes, Firebase Functions, Firestore

Level 3: Component (not included - not needed for this project size)

Level 4: Code (not included)
```

## System Architecture Summary

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

## Key Data Flows

### Form Submission
```
User → Form → /api/contact → NS Adapter → NetSuite (lead created)
                    ↓
              linkIdentity → Firestore (identity linked)
                    ↓
              Amplitude → Iterable (email triggered)
```

### Identity Resolution
```
Page Load → checkIdentity → device match? → return master_uid
Form Submit → linkIdentity → email/phone match? → link to master
NetSuite Merge → mergeIdentity → consolidate UIDs
```

## Updating Diagrams

1. **PNG files**: Regenerate using Eraser API or export from Eraser.io
2. **Eraser links**: These are temporary - save to your Eraser workspace for persistence
3. **Keep in sync**: Update diagrams when architecture changes

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - High-level architecture overview
- [ENTERPRISE-ARCHITECTURE-PLAN.md](../ENTERPRISE-ARCHITECTURE-PLAN.md) - Implementation plan
- [TECHNICAL-SPECIFICATION.md](../TECHNICAL-SPECIFICATION.md) - Detailed technical spec
- [identity-graph-plan.md](../identity-graph-plan.md) - Identity resolution design
