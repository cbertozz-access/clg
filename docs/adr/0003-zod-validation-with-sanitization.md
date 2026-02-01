# ADR-0003: Input Validation with Zod and DOMPurify Sanitization

## Status
Accepted

## Date
2025-01-31

## Context

The CLG contact form collects user data that flows to multiple systems:
- NetSuite CRM (via NS Adapter)
- Firebase Firestore (identity graph)
- Amplitude analytics
- Iterable email marketing

All inputs must be validated and sanitized to prevent:
- XSS (Cross-Site Scripting) attacks
- SQL/NoSQL injection attempts
- Invalid data corrupting downstream systems
- Schema mismatches causing integration failures

Validation library options:
1. **Zod** - TypeScript-first, runtime validation
2. **Yup** - Similar to Zod, slightly older
3. **io-ts** - Functional programming style
4. **Joi** - Mature, used in Hapi ecosystem
5. **Custom validation** - Hand-rolled checks

## Decision

We will use **Zod for schema validation** with **DOMPurify for HTML sanitization**.

Key features:
- Type inference from schemas (no duplicate types)
- Transform functions for sanitization in-schema
- Detailed error messages per field
- Edge-compatible (works in Vercel Edge Runtime)

## Rationale

### Why Zod?

1. **TypeScript inference**: Schema defines runtime validation AND compile-time types
2. **Transform chains**: Sanitization happens as part of parsing
3. **Edge compatible**: No Node.js-specific APIs
4. **Ecosystem**: Works with React Hook Form, tRPC, etc.
5. **Error formatting**: Built-in `.flatten()` for API responses

### Why DOMPurify (isomorphic-dompurify)?

1. **Battle-tested**: Used by major organizations
2. **Isomorphic**: Works in Node.js and browser
3. **Configurable**: Can strip all tags or allow specific ones
4. **Active maintenance**: Regular security updates

### Validation Strategy

```
Input → Zod Parse → Transform (sanitize) → Validated Output
         ↓
     Error Response (if invalid)
```

Each field uses appropriate validation:
- **Names**: Min/max length + HTML strip
- **Email**: Email format + lowercase + trim
- **Phone**: Format regex + digit extraction
- **Messages**: Length limits + HTML strip

### Schema Design Principles

1. **Required vs Optional**: Clear distinction in schema
2. **Defaults**: Set sensible defaults for optional fields
3. **Coercion**: Handle string numbers, etc.
4. **Error messages**: User-friendly, specific per field

## Consequences

### Positive
- Single source of truth for validation rules
- TypeScript types auto-generated from schema
- Consistent error format across API
- XSS prevention via sanitization transforms
- Easy to extend for new fields

### Negative
- Runtime dependency (~12KB gzipped)
- Sanitization adds ~2ms per request
- Must keep schema in sync with form UI

### Risks
- Over-sanitization could strip legitimate content
- Schema changes require API version consideration

## Implementation

Schema definition:
```typescript
export const ContactFormSchema = z.object({
  contactFirstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .transform(sanitizeHtml),

  contactEmail: z
    .string()
    .email("Please provide a valid email address")
    .max(255)
    .transform((val) => val.toLowerCase().trim()),

  // ... additional fields
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
```

Sanitization helper:
```typescript
function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}
```

Validation function:
```typescript
export function validateContactForm(data: unknown) {
  const result = ContactFormSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  return { success: true, data: result.data };
}
```

Dependencies:
- `zod` - Schema validation
- `isomorphic-dompurify` - HTML sanitization

## Field Specifications

| Field | Type | Validation | Sanitization |
|-------|------|------------|--------------|
| contactFirstName | string | 2-50 chars | Strip HTML |
| contactLastName | string | 2-50 chars | Strip HTML |
| contactEmail | string | email format | lowercase, trim |
| contactPhone | string | 10-20 digits | Remove formatting |
| contactMessage | string | 10-5000 chars | Strip HTML |
| contactCompanyName | string | 1-100 chars | Strip HTML |
| transactionType | enum | hire/sale/service/other | N/A |
| utmSource | string | max 100 chars | N/A |
| visitorId | string | max 100 chars | N/A |

## Related Decisions
- ADR-0001: Rate Limiting with Upstash
- ADR-0002: CSRF Protection Pattern
- ADR-0004: Firebase as Identity Store
