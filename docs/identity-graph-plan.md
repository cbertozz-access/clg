# CLG Identity Graph System - Implementation Plan

## Overview

A first-party identity resolution system using Firebase/Firestore that enables cross-device, cross-brand visitor identification and bidirectional sync with NetSuite.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLG IDENTITY SYSTEM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ Website  │───▶│   SDK    │───▶│ Firestore│◀───│ NetSuite │      │
│  │ (Any)    │    │          │    │          │    │          │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│                       │               │               │              │
│                       ▼               ▼               ▼              │
│                  ┌─────────────────────────────────────┐            │
│                  │           Cloud Functions            │            │
│                  │  • checkIdentity (page load)         │            │
│                  │  • linkIdentity (form submit)        │            │
│                  │  • mergeIdentity (NS webhook)        │            │
│                  └─────────────────────────────────────┘            │
│                                    │                                 │
│                                    ▼                                 │
│                  ┌─────────────────────────────────────┐            │
│                  │      Amplitude / Iterable            │            │
│                  │      (activitySet for merges)        │            │
│                  └─────────────────────────────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Firestore Data Structure

### Collection: `visitors/{uid}`

Stores visitor profiles indexed by UID.

```javascript
{
  uid: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  status: "master" | "merged",
  merged_into: null | "{master_uid}",  // if status === "merged"
  merged_uids: [],                      // UIDs merged into this master

  // Hashed PII (SHA-256)
  email_hash: "a1b2c3d4...",
  phone_hash: "e5f6g7h8...",

  // Device tracking
  devices: [
    { id: "DV-ABC123", first_seen: timestamp, last_seen: timestamp, brand: "access-hire" },
    { id: "DV-DEF456", first_seen: timestamp, last_seen: timestamp, brand: "access-express" }
  ],

  // Brand interactions
  brands: ["access-hire", "access-express"],

  // NetSuite link
  ns_lead_id: "NS-12345" | null,
  ns_customer_id: "NS-67890" | null,

  // Timestamps
  first_seen: timestamp,
  last_seen: timestamp,
  created_at: timestamp,
  updated_at: timestamp,

  // Attribution (first touch)
  first_touch: {
    url: "https://...",
    referrer: "https://google.com/...",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "brand"
  }
}
```

### Collection: `identity_graph/email_{hash}`

Index for email-based lookups.

```javascript
{
  hash: "a1b2c3d4...",
  uids: ["uid-1", "uid-2"],           // All UIDs with this email
  master_uid: "uid-1",                 // Resolved master UID
  created_at: timestamp,
  updated_at: timestamp
}
```

### Collection: `identity_graph/phone_{hash}`

Index for phone-based lookups.

```javascript
{
  hash: "e5f6g7h8...",
  uids: ["uid-3", "uid-4"],
  master_uid: "uid-3",
  created_at: timestamp,
  updated_at: timestamp
}
```

### Collection: `identity_graph/device_{fingerprint}`

Index for device-based lookups.

```javascript
{
  fingerprint: "DV-ABC123",
  uids: ["uid-1"],
  master_uid: "uid-1",
  brands: ["access-hire"],
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## Cloud Functions

### 1. `checkIdentity` - Page Load

Called when SDK initializes to check if visitor is known.

**Trigger:** HTTPS callable from SDK

**Input:**
```javascript
{
  uid: "current-uid",
  device_id: "DV-ABC123",
  brand: "access-hire"
}
```

**Logic:**
1. Check `identity_graph/device_{fingerprint}` for device match
2. If match found, return master UID and profile
3. If no match, return null (new visitor)

**Output:**
```javascript
{
  is_known: true | false,
  master_uid: "uid-1" | null,
  match_type: "device" | null,
  profile: { ... } | null
}
```

---

### 2. `linkIdentity` - Form Submit

Called when user submits a form with PII.

**Trigger:** HTTPS callable from SDK

**Input:**
```javascript
{
  uid: "current-uid",
  device_id: "DV-ABC123",
  brand: "access-hire",
  email_hash: "a1b2c3d4...",
  phone_hash: "e5f6g7h8..."
}
```

**Logic:**
1. Check `identity_graph/email_{hash}` for email match
2. Check `identity_graph/phone_{hash}` for phone match
3. If matches found:
   - Return existing master UID
   - Flag as duplicate
   - Add current UID to matched profile's `merged_uids`
4. If no matches:
   - Create/update visitor profile
   - Create identity graph entries for email/phone hashes
5. Update device index

**Output:**
```javascript
{
  is_duplicate: true | false,
  match_sources: ["email", "phone", "device"],
  master_uid: "uid-1",
  ns_lead_id: "NS-12345" | null,
  action: "created" | "linked" | "duplicate"
}
```

---

### 3. `mergeIdentity` - NetSuite Webhook

Called when sales person manually de-duplicates in NetSuite.

**Trigger:** HTTPS webhook from NS Adapter

**Input:**
```javascript
{
  action: "merge",
  source_uid: "uid-2",           // UID being merged
  target_uid: "uid-1",           // Master UID
  ns_lead_id: "NS-12345",
  merged_by: "sales@company.com",
  timestamp: "2024-01-29T..."
}
```

**Logic:**
1. Update source visitor: `status: "merged"`, `merged_into: target_uid`
2. Update target visitor: add source_uid to `merged_uids`
3. Update all identity graph entries to point to target_uid
4. Update device indexes
5. Send activitySet to Amplitude for profile merge

**Output:**
```javascript
{
  success: true,
  merged_uid: "uid-2",
  master_uid: "uid-1",
  amplitude_synced: true
}
```

---

## SDK Updates

### New Methods to Add to `clg-visitor.js`

```javascript
CLGVisitor = {
  // ... existing code ...

  /**
   * Check identity on page load
   * Called during init()
   */
  async checkIdentity() {
    const response = await fetch(FIRESTORE_ENDPOINT + '/checkIdentity', {
      method: 'POST',
      body: JSON.stringify({
        uid: this.visitorId,
        device_id: this.deviceId,
        brand: this.getBrand()
      })
    });

    const result = await response.json();

    if (result.is_known && result.master_uid !== this.visitorId) {
      // Visitor was previously identified with different UID
      this.handleIdentityMatch(result);
    }

    return result;
  },

  /**
   * Link identity on form submission
   * Called when form with email/phone is submitted
   */
  async linkIdentity(email, phone) {
    const emailHash = await this.hashPII(email);
    const phoneHash = await this.hashPII(phone);

    const response = await fetch(FIRESTORE_ENDPOINT + '/linkIdentity', {
      method: 'POST',
      body: JSON.stringify({
        uid: this.visitorId,
        device_id: this.deviceId,
        brand: this.getBrand(),
        email_hash: emailHash,
        phone_hash: phoneHash
      })
    });

    const result = await response.json();

    // Push to dataLayer
    window.dataLayer.push({
      event: 'clg_identity_linked',
      clg_uid: this.visitorId,
      clg_is_duplicate: result.is_duplicate,
      clg_match_sources: result.match_sources,
      clg_master_uid: result.master_uid
    });

    return result;
  },

  /**
   * Handle identity match (visitor recognized)
   */
  handleIdentityMatch(result) {
    window.dataLayer.push({
      event: 'clg_identity_matched',
      clg_uid: this.visitorId,
      clg_master_uid: result.master_uid,
      clg_match_type: result.match_type
    });
  }
}
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Visitors collection - read/write via Cloud Functions only
    match /visitors/{uid} {
      allow read: if false;  // Only via Cloud Functions
      allow write: if false;
    }

    // Identity graph - read/write via Cloud Functions only
    match /identity_graph/{docId} {
      allow read: if false;
      allow write: if false;
    }

    // Allow Cloud Functions (service account) full access
    // This is handled by Firebase Admin SDK, not rules
  }
}
```

---

## NS Adapter Updates

Add webhook handler for merge operations:

```javascript
// In NS Adapter
async function handleMerge(sourceNsId, targetNsId) {
  // Get UIDs from NS records
  const sourceUid = await getUidFromNsId(sourceNsId);
  const targetUid = await getUidFromNsId(targetNsId);

  // Call Firestore merge function
  await fetch(FIRESTORE_ENDPOINT + '/mergeIdentity', {
    method: 'POST',
    body: JSON.stringify({
      action: 'merge',
      source_uid: sourceUid,
      target_uid: targetUid,
      ns_lead_id: targetNsId,
      merged_by: getCurrentUser(),
      timestamp: new Date().toISOString()
    })
  });

  // Also send to Amplitude
  await sendAmplitudeActivitySet(sourceUid, targetUid);
}
```

---

## DataLayer Events

### `clg_uid_ready` (existing, enhanced)
```javascript
{
  event: 'clg_uid_ready',
  clg_uid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  clg_device_id: 'DV-ABC123',
  clg_is_new_visitor: true | false,
  clg_is_new_device: true | false,
  clg_is_known: true | false,        // NEW: recognized from identity graph
  clg_master_uid: 'uid-1' | null     // NEW: if different from clg_uid
}
```

### `clg_identity_linked` (new)
```javascript
{
  event: 'clg_identity_linked',
  clg_uid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  clg_is_duplicate: true | false,
  clg_match_sources: ['email', 'phone', 'device'],
  clg_master_uid: 'uid-1'
}
```

### `clg_identity_matched` (new)
```javascript
{
  event: 'clg_identity_matched',
  clg_uid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  clg_master_uid: 'uid-1',
  clg_match_type: 'device' | 'email' | 'phone'
}
```

---

## Implementation Order

### Phase 1: Firestore Setup
1. Create Firestore collections with indexes
2. Deploy security rules
3. Test data structure manually

### Phase 2: Cloud Functions
1. Deploy `checkIdentity` function
2. Deploy `linkIdentity` function
3. Deploy `mergeIdentity` function
4. Test each function independently

### Phase 3: SDK Updates
1. Add `checkIdentity()` to init flow
2. Add `linkIdentity()` for form submissions
3. Update dataLayer events
4. Test on dev site

### Phase 4: NS Adapter Integration
1. Add merge webhook handler
2. Connect to `mergeIdentity` function
3. Test end-to-end merge flow

### Phase 5: Testing & Rollout
1. Test all scenarios (new, return, cross-device, cross-brand, merge)
2. Deploy to staging
3. Deploy to production sites one by one

---

## Match Priority

When multiple matches are found:

1. **Email hash** (highest priority) - Most reliable identifier
2. **Phone hash** - Secondary identifier
3. **Device fingerprint** (lowest priority) - Same device only

If email and phone point to different master UIDs, email wins.

---

## Privacy Considerations

- All PII is hashed (SHA-256) before storage
- No raw email/phone stored in Firestore
- Hashes are one-way (cannot reverse to get original)
- Device fingerprint is a hash of browser characteristics
- Compliant with first-party data requirements
- No third-party cookies used

---

## Existing Assets

| Component | Location | Status |
|-----------|----------|--------|
| Visitor SDK | `/public/clg-visitor.js` | Ready to extend |
| Firebase Project | `composable-lg` | Active |
| Cloud Functions | `australia-southeast1` | Deployed |
| Firestore | `composable-lg` | Needs collections |
| POC Demo | `/public/poc/identity-resolution.html` | Complete |
| Standalone Snippet | `/public/snippets/firebase-uid-snippet.html` | Ready |

---

## Ready to Build

All planning complete. Execute with: "Build the identity graph system"
