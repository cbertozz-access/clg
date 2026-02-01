# ADR-0005: NetSuite Integration via NS Adapter Proxy

## Status
Accepted

## Date
2025-01-31

## Context

CLG contact form submissions must create leads/contacts in NetSuite CRM. NetSuite integration requires:
- OAuth 2.0 authentication with token-based access
- RESTlet or SuiteScript endpoints
- Field mapping to NetSuite schema
- Error handling and retry logic

Integration approaches considered:
1. **Direct NetSuite API** - Call RESTlets directly from Next.js
2. **NS Adapter Proxy** - Route through existing middleware service
3. **Celigo / Boomi** - iPaaS integration platform
4. **Custom middleware** - Build new integration service

Key constraints:
- Existing NS Adapter service at `dev-agws.aghost.au` already exists
- Team has experience with NS Adapter patterns
- Need to minimize new infrastructure

## Decision

We will route contact form submissions through the **existing NS Adapter proxy service** at `https://dev-agws.aghost.au/api/contact-request`.

This service:
- Handles NetSuite OAuth authentication
- Maps form fields to NetSuite schema
- Implements retry logic and error handling
- Returns NetSuite entity IDs on success

## Rationale

### Why NS Adapter?

1. **Already exists**: No new infrastructure to build
2. **OAuth handled**: Token refresh, rotation managed centrally
3. **Field mapping**: NetSuite schema knowledge encapsulated
4. **Error handling**: Retry logic, timeout handling built in
5. **Multi-site**: Can be used by other CLG properties

### Why NOT alternatives?

**Direct NetSuite API**: Would require implementing OAuth flow, managing tokens in Vercel, duplicating field mapping logic.

**iPaaS (Celigo/Boomi)**: Additional cost, vendor dependency, overkill for single integration point.

**Custom middleware**: Would replicate NS Adapter functionality. Unnecessary duplication.

### Architecture Flow

```
Browser → Next.js API → NS Adapter → NetSuite
           /api/contact    ↓
                      Response + Entity ID
                           ↓
                      Firebase linkIdentity
                           ↓
                      Amplitude track
```

### NS Adapter Contract

Request:
```typescript
POST https://dev-agws.aghost.au/api/contact-request
Content-Type: application/json

{
  "contactFirstName": "John",
  "contactLastName": "Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "+61400000000",
  "contactCompanyName": "Acme Corp",
  "contactMessage": "Interested in hire...",
  "contactType": "General Inquiry",
  "sourceDepot": "Website",
  "transactionType": "hire"
}
```

Response (success):
```typescript
{
  "success": true,
  "entityId": "12345",
  "message": "Contact created successfully"
}
```

Response (error):
```typescript
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Email already exists",
  "code": 400
}
```

### Security Considerations

1. **API Key**: NS Adapter may require API key header
2. **IP Whitelist**: Vercel IPs may need whitelisting
3. **Rate Limiting**: NS Adapter has its own limits
4. **Timeout**: Set 30s timeout for NetSuite operations

## Consequences

### Positive
- No NetSuite credentials in Vercel environment
- Centralized field mapping maintenance
- Existing monitoring and alerting
- Quick implementation (API already defined)

### Negative
- Additional network hop adds latency (~200-500ms)
- Dependency on NS Adapter availability
- Limited visibility into NetSuite operations
- Changes require NS Adapter team coordination

### Risks
- NS Adapter outage blocks form submissions
- Field mapping changes require two deployments
- No direct access to NetSuite response details

## Implementation

Next.js API route:
```typescript
// src/app/api/contact/route.ts
export async function POST(request: Request) {
  // 1. Rate limit check
  // 2. CSRF validation
  // 3. Input validation (Zod)

  const response = await fetch(
    "https://dev-agws.aghost.au/api/contact-request",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.NS_ADAPTER_API_KEY,
      },
      body: JSON.stringify(validatedData),
    }
  );

  const result = await response.json();

  if (result.success) {
    // 4. Link identity in Firebase
    // 5. Track in Amplitude
  }

  return Response.json(result);
}
```

Environment variables:
- `NS_ADAPTER_URL` - Base URL (default: https://dev-agws.aghost.au)
- `NS_ADAPTER_API_KEY` - Authentication key (if required)

## Related Decisions
- ADR-0003: Input Validation with Zod
- ADR-0004: Firebase Identity Resolution
