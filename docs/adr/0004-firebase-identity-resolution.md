# ADR-0004: Firebase Firestore for Identity Resolution

## Status
Accepted

## Date
2025-01-31

## Context

CLG needs to track visitor identity across:
- Anonymous browsing sessions (device ID)
- Form submissions (email/phone)
- NetSuite CRM records (entity ID)
- Amplitude analytics (user ID)

Requirements:
- Link anonymous visitors to known contacts
- Handle identity merges (same person, different devices)
- Survive cookie clears and device changes
- Sub-100ms lookup latency
- Cost-effective at scale

Database options considered:
1. **Firebase Firestore** - Document database, serverless
2. **PostgreSQL** - Relational, graph-like queries
3. **Neo4j** - Native graph database
4. **DynamoDB** - Key-value with GSI
5. **Redis** - In-memory, ephemeral

## Decision

We will use **Firebase Firestore** as the identity resolution store with a document-based identity graph structure.

Key design:
- Each visitor gets a `visitor_uid` document
- Email/phone become "identity links" to master UID
- Device IDs linked via `device_mappings` subcollection
- Merge operations consolidate duplicate identities

## Rationale

### Why Firestore?

1. **Serverless**: No connection pooling, instant scaling
2. **Regional**: Sydney region (australia-southeast1) for low latency
3. **Real-time**: Subscription support for future features
4. **Composite indexes**: Efficient lookups by email/phone/device
5. **Pricing**: Pay-per-operation, generous free tier

### Why NOT alternatives?

**PostgreSQL**: Requires connection management in serverless. VPC peering complexity with Vercel.

**Neo4j**: Over-engineered for our graph complexity. Expensive for cloud-hosted.

**DynamoDB**: Better for AWS-native stack. Additional vendor lock-in.

**Redis**: Data must persist beyond cache lifetimes. Not primary storage.

### Identity Graph Structure

```
/visitors
  /{visitor_uid}
    - created_at
    - updated_at
    - master_uid (self-ref or merged-to)
    - emails: ["a@example.com"]
    - phones: ["+61400000000"]
    - netsuite_entity_id: "12345"
    - amplitude_user_id: "..."

    /device_mappings
      /{device_id}
        - first_seen
        - last_seen
        - user_agent
```

### Lookup Strategy

1. **Check device**: Query device_mappings → get visitor_uid
2. **Check email**: Query by email → get visitor_uid
3. **Check phone**: Query by phone → get visitor_uid
4. **Create new**: Generate UUID, create visitor document

### Merge Strategy

When linking reveals duplicate identities:
1. Keep oldest visitor as "master"
2. Update merged visitor's `master_uid` to point to master
3. Consolidate emails/phones into master
4. Update NetSuite with merge notification

## Consequences

### Positive
- Sub-20ms identity lookups
- Automatic scaling with traffic
- Built-in security rules
- Works in Firebase ecosystem
- Easy backup/restore with Firestore exports

### Negative
- Query limitations (no joins, limited OR)
- Index management required
- Firestore-specific query patterns
- ~$0.18 per 100K reads

### Risks
- Large documents (many devices/emails) could hit 1MB limit
- Merge race conditions need transaction handling
- Cross-region reads add latency

## Implementation

Cloud Functions:
```javascript
// checkIdentity - lookup by device
exports.checkIdentity = onRequest(async (req, res) => {
  const { deviceId } = req.body;
  const snapshot = await db
    .collectionGroup("device_mappings")
    .where("device_id", "==", deviceId)
    .limit(1)
    .get();
  // ...
});

// linkIdentity - associate email/phone with visitor
exports.linkIdentity = onRequest(async (req, res) => {
  const { visitorId, email, phone } = req.body;
  // Check for existing identity with same email
  // Merge if found, otherwise update
});
```

Required indexes:
- `visitors` by email (array-contains)
- `visitors` by phone (array-contains)
- `device_mappings` by device_id (collection group)

Environment:
- Firebase project: `composable-lg`
- Region: `australia-southeast1`

## Related Decisions
- ADR-0001: Rate Limiting with Upstash
- ADR-0005: NS Adapter Integration
