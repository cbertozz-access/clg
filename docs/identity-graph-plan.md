# CLG Identity Graph System

## Overview

A first-party identity resolution system using Firebase/Firestore that enables cross-device, cross-brand visitor identification and bidirectional sync with NetSuite.

**Status: Phase 1-3 Complete** (Jan 2026)

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
│                  │  • checkIdentity (page load)    ✓   │            │
│                  │  • linkIdentity (form submit)   ✓   │            │
│                  │  • mergeIdentity (NS webhook)   ✓   │            │
│                  │  • visitorId (profile mgmt)     ✓   │            │
│                  └─────────────────────────────────────┘            │
│                                    │                                 │
│                                    ▼                                 │
│                  ┌─────────────────────────────────────┐            │
│                  │      Amplitude / Iterable            │            │
│                  │      (future: NS Adapter integration)│            │
│                  └─────────────────────────────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Firestore Database | ✅ Complete | `visitors` database in `composable-lg` project |
| Security Rules | ✅ Complete | All client access denied, Cloud Functions only |
| `checkIdentity` Function | ✅ Deployed | Device fingerprint lookup on page load |
| `linkIdentity` Function | ✅ Deployed | Email/phone hash matching on form submit |
| `mergeIdentity` Function | ✅ Deployed | Manual merge capability for de-duplication |
| `visitorId` Function | ✅ Deployed | Visitor profile management |
| SDK Integration | ✅ Complete | `clg-visitor.js` calls identity functions |
| Form Integration | ✅ Complete | `contact.ts` passes email/phone to SDK |
| CORS Configuration | ✅ Fixed | Origin-specific headers for credentials mode |
| NS Adapter Integration | 🔜 Next Phase | Accept UID from form, not generate |

---

## Cloud Functions

All functions deployed to `australia-southeast1` region.

### Endpoints

| Function | URL | Method |
|----------|-----|--------|
| checkIdentity | `https://australia-southeast1-composable-lg.cloudfunctions.net/checkIdentity` | POST |
| linkIdentity | `https://australia-southeast1-composable-lg.cloudfunctions.net/linkIdentity` | POST |
| mergeIdentity | `https://australia-southeast1-composable-lg.cloudfunctions.net/mergeIdentity` | POST |
| visitorId | `https://australia-southeast1-composable-lg.cloudfunctions.net/visitorId` | GET/POST |

### 1. `checkIdentity` - Page Load

Called when SDK initializes to check if visitor is known.

**Input:**
```javascript
{
  uid: "current-uid",
  device_id: "DV-ABC123",
  brand: "access-hire"
}
```

**Output:**
```javascript
{
  is_known: true | false,
  master_uid: "uid-1" | null,
  match_type: "device" | null,
  profile: { ... } | null
}
```

### 2. `linkIdentity` - Form Submit

Called when user submits a form with PII. Hashes are generated client-side.

**Input:**
```javascript
{
  uid: "current-uid",
  device_id: "DV-ABC123",
  brand: "access-hire",
  email_hash: "a1b2c3d4...",   // SHA-256 hash
  phone_hash: "e5f6g7h8..."    // SHA-256 hash
}
```

**Output:**
```javascript
{
  is_duplicate: true | false,
  match_sources: ["email", "phone", "device"],
  master_uid: "uid-1",
  ns_lead_id: "NS-12345" | null,
  action: "created" | "linked"
}
```

### 3. `mergeIdentity` - Manual Merge

Called to merge two UIDs (e.g., after NetSuite de-duplication).

**Input:**
```javascript
{
  action: "merge",
  source_uid: "uid-2",           // UID being merged
  target_uid: "uid-1",           // Master UID
  ns_lead_id: "NS-12345",
  merged_by: "sales@company.com"
}
```

**Output:**
```javascript
{
  success: true,
  merged_uid: "uid-2",
  master_uid: "uid-1",
  ns_lead_id: "NS-12345" | null
}
```

---

## Firestore Data Structure

### Database: `visitors` (not default)

### Collection: `visitors/{uid}`

```javascript
{
  uid: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  status: "master" | "merged",
  merged_into: null | "{master_uid}",
  merged_uids: [],

  // Hashed PII (SHA-256)
  email_hash: "a1b2c3d4...",
  phone_hash: "e5f6g7h8...",

  // Device tracking
  devices: [
    { id: "DV-ABC123", brand: "access-hire", first_seen: "2026-01-29T..." }
  ],

  // Brand interactions
  brands: ["access-hire", "access-express"],

  // NetSuite link
  ns_lead_id: "NS-12345" | null,

  // Timestamps
  first_seen: timestamp,
  updated_at: timestamp
}
```

### Collection: `identity_graph/{type}_{hash}`

Index documents for fast lookups:

- `email_{sha256_hash}` - Email-based lookup
- `phone_{sha256_hash}` - Phone-based lookup
- `device_{fingerprint}` - Device-based lookup

```javascript
{
  hash: "a1b2c3d4..." | fingerprint: "DV-ABC123",
  master_uid: "uid-1",
  uids: ["uid-1", "uid-2"],    // All UIDs linked to this identifier
  brands: ["access-hire"],      // Device only
  updated_at: timestamp
}
```

---

## SDK Integration

### Key Methods in `clg-visitor.js`

```javascript
// Called on page load - checks if visitor is known
await CLGVisitor.checkIdentity();

// Called on form submit - links email/phone to visitor
await CLGVisitor.linkIdentity(email, phone);

// Called by trackFormSubmit when email/phone provided
CLGVisitor.trackFormSubmit('contact_request', {
  email: 'user@example.com',
  phone: '0415897470',
  contactType: 'General Inquiry',
  sourceDepot: 'Melbourne, VIC'
});
```

### DataLayer Events

```javascript
// Visitor recognized on page load
{
  event: 'clg_identity_matched',
  clg_uid: 'current-uid',
  clg_master_uid: 'master-uid',
  clg_match_type: 'device'
}

// Identity linked on form submit
{
  event: 'clg_identity_linked',
  clg_uid: 'current-uid',
  clg_is_duplicate: true,
  clg_match_sources: ['email', 'phone'],
  clg_master_uid: 'master-uid'
}
```

---

## Match Priority

When multiple matches are found:

1. **Email hash** (highest) - Most reliable identifier
2. **Phone hash** - Secondary identifier
3. **Device fingerprint** (lowest) - Same device only

If email and phone point to different master UIDs, email wins.

---

## Privacy & Security

- All PII is hashed (SHA-256) client-side before transmission
- No raw email/phone stored in Firestore
- Hashes are one-way (cannot reverse)
- Device fingerprint is a hash of browser characteristics
- Firestore rules deny all client access
- All operations via Cloud Functions (Admin SDK)
- First-party data only, no third-party cookies

---

## Lessons Learned

### CORS Configuration

When using `credentials: 'include'` in fetch requests, the `Access-Control-Allow-Origin` header **cannot** be `*`. It must echo the specific origin:

```javascript
// Wrong
res.set('Access-Control-Allow-Origin', '*');

// Correct
const origin = req.get('Origin') || '*';
res.set('Access-Control-Allow-Origin', origin);
```

### Fallback IDs

If the Firebase visitorId call fails, the SDK generates a fallback ID with `clg_` prefix. These need to be merged into the correct Firebase UUID using `mergeIdentity` when discovered.

### Session Storage

The SDK stores session data in `sessionStorage` including all form_submit events. This is useful for debugging but should be cleared between test sessions.

---

## Testing

### Test Identity Functions

```bash
# Create new identity
curl -X POST https://australia-southeast1-composable-lg.cloudfunctions.net/linkIdentity \
  -H "Content-Type: application/json" \
  -d '{"uid":"test-user-1","device_id":"DV-TEST","brand":"test","email_hash":"abc123","phone_hash":"def456"}'

# Check for duplicate
curl -X POST https://australia-southeast1-composable-lg.cloudfunctions.net/linkIdentity \
  -H "Content-Type: application/json" \
  -d '{"uid":"test-user-2","device_id":"DV-OTHER","brand":"test","email_hash":"abc123","phone_hash":"xyz789"}'
# Should return is_duplicate: true, match_sources: ["email"]

# Merge identities
curl -X POST https://australia-southeast1-composable-lg.cloudfunctions.net/mergeIdentity \
  -H "Content-Type: application/json" \
  -d '{"action":"merge","source_uid":"test-user-2","target_uid":"test-user-1","merged_by":"manual"}'
```

---

## Next Phase: NS Adapter Integration

The NS Adapter currently generates UIDs. In the new model:

1. SDK generates UID on page load (from Firebase)
2. Form submission includes UID + identity resolution result
3. NS Adapter accepts UID from form data (doesn't generate)
4. NS Adapter passes `is_duplicate` and `master_uid` to NetSuite
5. NS Adapter sends `master_uid` to Amplitude/Iterable

This ensures:
- Single source of truth for identity (CLG/Firebase)
- Duplicates detected before reaching downstream systems
- Amplitude/Iterable never see split UIDs

---

## Files

| File | Purpose |
|------|---------|
| `/functions/index.js` | Cloud Functions (checkIdentity, linkIdentity, mergeIdentity, visitorId) |
| `/public/clg-visitor.js` | SDK with identity graph integration |
| `/src/lib/api/contact.ts` | Form submission with email/phone passed to SDK |
| `/firestore.rules` | Security rules (deny all client access) |
| `/.firebaserc` | Firebase project configuration |

---

## Deployment

### Cloud Functions

```bash
cd functions
gcloud functions deploy checkIdentity --gen2 --runtime=nodejs20 --region=australia-southeast1 --trigger-http --allow-unauthenticated --project=composable-lg
gcloud functions deploy linkIdentity --gen2 --runtime=nodejs20 --region=australia-southeast1 --trigger-http --allow-unauthenticated --project=composable-lg
gcloud functions deploy mergeIdentity --gen2 --runtime=nodejs20 --region=australia-southeast1 --trigger-http --allow-unauthenticated --project=composable-lg
gcloud functions deploy visitorId --gen2 --runtime=nodejs20 --region=australia-southeast1 --trigger-http --allow-unauthenticated --project=composable-lg
```

### Firestore Rules

```bash
firebase deploy --only firestore:rules --project=composable-lg
```
