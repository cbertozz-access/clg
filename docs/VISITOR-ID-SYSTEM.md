# CLG Visitor ID System

A serverless visitor identification and behavioral tracking system for Builder.io landing pages.

## Overview

| Property | Value |
|----------|-------|
| **GCP Project** | `composable-lg` |
| **Region** | `australia-southeast1` |
| **Database** | Firestore (database: `visitors`) |
| **Collection** | `visitors` |

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────────────┐
│  Builder.io     │────▶│  Cloud Function: visitorId                   │
│  Landing Pages  │     │  australia-southeast1-composable-lg          │
└─────────────────┘     └──────────────────────────────────────────────┘
        │                                    │
        │ <script src="clg-visitor.js">      │
        ▼                                    ▼
┌─────────────────┐                 ┌──────────────────┐
│  CLG Visitor    │                 │    Firestore     │
│  SDK (browser)  │                 │  (visitors DB)   │
└─────────────────┘                 └──────────────────┘
        │
        ▼
┌─────────────────┐
│  GTM dataLayer  │
└─────────────────┘
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://australia-southeast1-composable-lg.cloudfunctions.net/visitorId` | GET | Get or create visitor profile |
| `https://australia-southeast1-composable-lg.cloudfunctions.net/visitorId` | POST | Track events and update behavior |

## Visitor ID Format

**UUID v4** generated server-side using the `uuid` package.

Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

## How It Works

### First Visit
1. SDK (`clg-visitor.js`) loads on page
2. SDK calls Cloud Function API
3. Cloud Function generates UUID v4
4. Visitor document created in Firestore
5. ID returned to browser and stored in cookie + localStorage

### Return Visit
1. SDK reads existing ID from cookie (`clg_vid`) or localStorage (`clg_visitor`)
2. SDK sends ID to Cloud Function
3. Cloud Function looks up existing profile
4. `pageViews` counter incremented
5. Updated profile returned

### Persistence
| Storage | Key | Duration |
|---------|-----|----------|
| Cookie | `clg_vid` | 365 days |
| localStorage | `clg_visitor` | Permanent |

## Firestore Document Structure

**Collection:** `visitors`
**Document ID:** UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

```javascript
{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  createdAt: "2025-01-15T10:30:00.000Z",
  lastSeen: "2025-01-20T14:22:00.000Z",
  pageViews: 12,
  sessions: 3,
  source: "google",
  referrer: "https://google.com/...",
  userAgent: "Mozilla/5.0...",
  behaviors: [
    { event: "cta_click", properties: {}, timestamp: "2025-01-18T09:00:00.000Z" },
    { event: "form_complete", properties: {}, timestamp: "2025-01-20T14:20:00.000Z" }
  ],
  segments: ["high_intent", "equipment_rental"],
  leadScore: 45
}
```

## Lead Scoring

Events automatically update the visitor's `leadScore`:

| Event | Points |
|-------|--------|
| `page_view` | +1 |
| `video_play` | +2 |
| `cta_click` | +3 |
| `form_start` | +5 |
| `video_complete` | +5 |
| `download` | +10 |
| `form_complete` | +20 |
| `contact` | +25 |

## SDK Usage

### Installation

Add the script to your Builder.io page or GTM:

```html
<script src="https://clg-ten.vercel.app/clg-visitor.js" async></script>
```

### JavaScript API

```javascript
// Get visitor ID
const visitorId = CLGVisitor.getVisitorId();

// Get full profile
const profile = CLGVisitor.getProfile();

// Track custom event
await CLGVisitor.track('cta_click', { button: 'hero-cta' });

// Add to segment
await CLGVisitor.addSegment('high_intent');
```

### GTM Integration

The SDK automatically pushes to `window.dataLayer`:

```javascript
{
  event: 'visitor_identified',
  visitor_id: 'a1b2c3d4-...',
  visitor_type: 'new' | 'returning',
  visitor_page_views: 12,
  visitor_sessions: 3,
  visitor_lead_score: 45,
  visitor_segments: 'high_intent,equipment_rental'
}
```

A custom event `clg:visitor:ready` is also dispatched on the window.

## Source Files

| Component | Location |
|-----------|----------|
| Cloud Function | `clg/functions/index.js` |
| Browser SDK | `clg/public/clg-visitor.js` |

## Deployment

### Cloud Function

```bash
cd clg/functions
npm run deploy
```

Or manually:

```bash
gcloud functions deploy visitorId \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --project=composable-lg \
  --region=australia-southeast1
```

### SDK

The SDK is served from `clg-ten.vercel.app/clg-visitor.js` - it deploys automatically with the CLG Next.js app.

## GCP Console Links

- [Cloud Function](https://console.cloud.google.com/functions/details/australia-southeast1/visitorId?project=composable-lg)
- [Firestore Database](https://console.cloud.google.com/firestore/databases/visitors?project=composable-lg)
