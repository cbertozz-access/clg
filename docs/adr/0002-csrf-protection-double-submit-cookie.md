# ADR-0002: CSRF Protection via Double-Submit Cookie Pattern

## Status
Accepted

## Date
2025-01-31

## Context

The CLG contact form submits to `/api/contact` via POST request. This endpoint needs protection against Cross-Site Request Forgery (CSRF) attacks where a malicious site tricks a user's browser into submitting the form.

CSRF protection options considered:
1. **Synchronizer Token Pattern** (server-side session storage)
2. **Double-Submit Cookie Pattern** (stateless, cookie + body comparison)
3. **SameSite Cookie Only** (rely on browser SameSite=Strict)
4. **Custom Header Pattern** (X-Requested-With or similar)
5. **Origin/Referer Validation** (check request origin)

Key requirements:
- Works with Next.js 14 App Router (Server Components + API Routes)
- Stateless (no server-side session storage)
- Works with Vercel's serverless architecture
- Protects against both GET and POST-based CSRF

## Decision

We will use the **Double-Submit Cookie Pattern** with cryptographic verification.

Implementation:
- Token format: `{random_token}|{sha256_hash(token + secret)}`
- Cookie: HttpOnly, Secure, SameSite=Lax, Path=/
- Token passed in form body for POST verification
- 24-hour token expiry

## Rationale

### Why Double-Submit Cookie?

1. **Stateless**: No server-side session storage needed
2. **Vercel-compatible**: Works across serverless function invocations
3. **Next.js friendly**: Uses `cookies()` API from App Router
4. **Cryptographic verification**: Hash prevents token forgery

### Token Format Explained

```
{64-char-random-hex}|{64-char-sha256-hash}
```

- Random token: 32 bytes (256 bits) of cryptographic randomness
- Hash: SHA256(token + CSRF_SECRET)
- Verification: Attacker cannot forge hash without knowing secret

### Why NOT alternatives?

**Synchronizer Token Pattern**: Requires session storage. In serverless, this means Redis/DB lookups for every request. Over-engineered for our use case.

**SameSite Only**: SameSite=Lax still allows GET requests from other origins. SameSite=Strict breaks legitimate navigation flows.

**Custom Header**: Can be bypassed by Flash/old browsers. Not comprehensive.

**Origin/Referer**: Referer can be stripped by privacy settings. Origin not sent on some browser configurations.

### Cookie Settings

```typescript
{
  httpOnly: true,    // Prevents JS access (XSS protection)
  secure: true,      // HTTPS only in production
  sameSite: "lax",   // Blocks most cross-origin POST
  path: "/",         // Available across site
  maxAge: 86400,     // 24-hour expiry
}
```

Using `__Host-` prefix ensures:
- Cookie must be set with Secure flag
- Cookie must be set from secure origin
- Path must be `/`
- No Domain attribute allowed

## Consequences

### Positive
- Zero session storage requirements
- Fast verification (~0.5ms)
- Defense in depth with SameSite cookie
- Compatible with form pre-rendering in Server Components

### Negative
- Requires JavaScript on client to include token in body
- Token visible in DOM (though not useful without secret)
- Cookie size (~150 bytes) adds to every request

### Risks
- CSRF_SECRET rotation requires coordination
- Tokens not invalidated on logout (mitigated by 24hr expiry)

## Implementation

Server Component (get token for form):
```typescript
const csrfToken = await getCSRFToken();
return <input type="hidden" name="csrf_token" value={csrfToken} />;
```

API Route (validate token):
```typescript
const isValid = await validateCSRFToken(body.csrf_token);
if (!isValid) {
  return Response.json(csrfErrorResponse(), { status: 403 });
}
```

Environment variables required:
- `CSRF_SECRET` (minimum 32 characters, cryptographically random)

## Related Decisions
- ADR-0001: Rate Limiting with Upstash
- ADR-0003: Input Validation with Zod
