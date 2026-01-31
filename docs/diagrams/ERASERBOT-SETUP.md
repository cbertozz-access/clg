# Eraserbot Setup for CLG

This guide explains how to set up Eraserbot to automatically keep CLG architecture diagrams in sync with code changes.

## Prerequisites

1. Eraser.io account with GitHub connected
2. `cbertozz-access/clg` repository authorized with "Active and synced" access

## Setup Steps

### 1. Connect Repository

1. Go to [Eraser Settings > Git Connect](https://app.eraser.io/settings/git-connect)
2. Select GitHub and authorize the Eraser app
3. Select `cbertozz-access/clg` repository
4. Set access level to **"Active and synced"**

### 2. Create Monitors

Go to [Eraserbot Dashboard](https://app.eraser.io/dashboard/eraserbot) and create these monitors:

#### Monitor 1: System Architecture

- **Name**: CLG System Architecture
- **Files to monitor**:
  - `src/app/api/**/*.ts`
  - `functions/index.js`
  - `src/lib/api/*.ts`
- **Prompt**:
  ```
  Generate a C4 Container diagram showing CLG architecture.
  Include: Next.js frontend, API routes, Firebase Cloud Functions
  (visitorId, checkIdentity, linkIdentity, mergeIdentity),
  Firestore database, and external integrations (NS Adapter,
  Amplitude, Iterable, Builder.io, Algolia).
  ```

#### Monitor 2: Security Architecture

- **Name**: CLG Security Layer
- **Files to monitor**:
  - `src/app/api/contact/route.ts`
  - `src/middleware.ts`
  - `src/lib/security/*.ts`
- **Prompt**:
  ```
  Generate a security architecture diagram showing the API
  protection layers: rate limiting (Upstash Redis), CSRF
  protection, input validation (Zod + DOMPurify), and
  security headers. Show the request flow through each layer.
  ```

#### Monitor 3: Identity Graph

- **Name**: CLG Identity Resolution
- **Files to monitor**:
  - `functions/index.js`
  - `public/clg-visitor.js`
- **Prompt**:
  ```
  Generate an entity relationship diagram showing the Firebase
  identity graph structure: visitors collection, identity_graph
  collection with email_hash, phone_hash, device_id indexes,
  and the linkIdentity/mergeIdentity flow.
  ```

#### Monitor 4: CI/CD Pipeline

- **Name**: CLG CI/CD
- **Files to monitor**:
  - `.github/workflows/*.yml`
  - `vercel.json`
- **Prompt**:
  ```
  Generate a flowchart showing the CI/CD pipeline: feature
  branches to develop (dev) to staging (UAT) to main (production).
  Include GitHub Actions steps: lint, typecheck, test, deploy.
  Show the three Vercel environments.
  ```

### 3. How It Works

When a PR is opened that modifies any monitored files:

1. Eraserbot detects the change within 1-2 minutes
2. Regenerates the affected diagram(s)
3. Posts a comment on the PR with the updated diagram
4. When PR is merged, the diagram in Eraser is updated

### 4. Manual Regeneration

To manually update a diagram:

1. Go to the monitor in [Eraserbot Dashboard](https://app.eraser.io/dashboard/eraserbot)
2. Click the three-dot menu → "Regenerate"
3. Review and save the updated diagram

## Files Monitored

| Area | Files | Diagram Updated |
|------|-------|-----------------|
| API Routes | `src/app/api/**/*.ts` | System Architecture |
| Cloud Functions | `functions/index.js` | System + Identity |
| Security | `src/lib/security/*.ts`, `src/middleware.ts` | Security Architecture |
| Visitor SDK | `public/clg-visitor.js` | Identity Graph |
| CI/CD | `.github/workflows/*.yml` | CI/CD Pipeline |

## Diagram Storage

Eraserbot can commit `.eraserdiagram` files directly to this repo when:
- Repository access is set to "Active and synced"
- You click "Commit to repo" in the Eraser interface

These files will appear in the repository and can be viewed/edited in Eraser.
