/**
 * CSRF Protection using Double-Submit Cookie Pattern
 *
 * Implementation based on NextAuth.js patterns.
 * Token format: `token|hash` where hash = SHA256(token + secret)
 */

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

const CSRF_SECRET = process.env.CSRF_SECRET || "development-secret-change-in-production";
const CSRF_COOKIE_NAME = "__Host-csrf-token";
const CSRF_TOKEN_MAX_AGE = 24 * 60 * 60; // 24 hours

interface CSRFValidationResult {
  csrfToken?: string;
  csrfTokenVerified?: boolean;
  cookie?: string;
}

/**
 * Create or validate CSRF token
 */
export function createCSRFToken({
  secret = CSRF_SECRET,
  cookieValue,
  isPost,
  bodyValue,
}: {
  secret?: string;
  cookieValue?: string;
  isPost: boolean;
  bodyValue?: string;
}): CSRFValidationResult {
  // Verify existing token
  if (cookieValue) {
    const [csrfToken, csrfTokenHash] = cookieValue.split("|");
    const expectedHash = createHash("sha256")
      .update(`${csrfToken}${secret}`)
      .digest("hex");

    if (csrfTokenHash === expectedHash) {
      // Cookie verified - check if token matches body value (POST verification)
      const csrfTokenVerified = isPost && csrfToken === bodyValue;
      return { csrfTokenVerified, csrfToken };
    }
  }

  // Generate new CSRF token
  const csrfToken = randomBytes(32).toString("hex"); // 64 hex chars
  const csrfTokenHash = createHash("sha256")
    .update(`${csrfToken}${secret}`)
    .digest("hex");
  const cookie = `${csrfToken}|${csrfTokenHash}`;

  return { cookie, csrfToken };
}

/**
 * Get or create CSRF token for forms
 * Call this in Server Components to provide token to client
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  const { csrfToken, cookie } = createCSRFToken({
    cookieValue: existingCookie,
    isPost: false,
  });

  // Set cookie if new
  if (cookie && csrfToken) {
    cookieStore.set(CSRF_COOKIE_NAME, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: CSRF_TOKEN_MAX_AGE,
    });
    return csrfToken;
  }

  return csrfToken || "";
}

/**
 * Validate CSRF token from request
 * Call this in API routes to verify token
 */
export async function validateCSRFToken(tokenFromBody: string): Promise<boolean> {
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!csrfCookie || !tokenFromBody) {
    return false;
  }

  const { csrfTokenVerified } = createCSRFToken({
    cookieValue: csrfCookie,
    isPost: true,
    bodyValue: tokenFromBody,
  });

  return csrfTokenVerified || false;
}

/**
 * CSRF validation error response
 */
export function csrfErrorResponse() {
  return {
    success: false,
    error: "CSRF validation failed",
    message: "Invalid or missing CSRF token. Please refresh the page and try again.",
  };
}
