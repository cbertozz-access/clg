/**
 * CSRF Token Component
 *
 * Server Component that provides CSRF token to forms.
 * Include this in any form that submits to protected API routes.
 *
 * Usage:
 * ```tsx
 * <form action="/api/contact" method="POST">
 *   <CSRFToken />
 *   <input name="email" type="email" />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 *
 * For client-side submissions, use the useCSRFToken hook instead.
 *
 * @see ADR-0002 for CSRF protection architecture
 */

import { getCSRFToken } from "@/lib/security";

export async function CSRFToken() {
  const token = await getCSRFToken();

  return <input type="hidden" name="csrfToken" value={token} />;
}
