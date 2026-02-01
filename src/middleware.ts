/**
 * Next.js Middleware
 *
 * Sets security headers for all responses.
 * Runs on the edge, before routing.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers configuration
 */
const securityHeaders = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Prevent XSS attacks (legacy, but still useful)
  "X-XSS-Protection": "1; mode=block",

  // HSTS - enforce HTTPS (only in production)
  // max-age=31536000 (1 year), includeSubDomains
  ...(process.env.NODE_ENV === "production"
    ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" }
    : {}),

  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    // Scripts: self, inline (for Next.js), and trusted CDNs
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.builder.io https://www.googletagmanager.com https://*.datadoghq.com",
    // Styles: self and inline (for CSS-in-JS)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Images: self, data URIs, and CDNs
    "img-src 'self' data: blob: https: https://cdn.builder.io https://*.googleusercontent.com",
    // Fonts: self and Google Fonts
    "font-src 'self' https://fonts.gstatic.com",
    // Connect: API endpoints and analytics
    "connect-src 'self' https://cdn.builder.io https://*.builder.io https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.datadoghq.com https://*.amplitude.com https://dev-agws.aghost.au https://*.cloudfunctions.net",
    // Frames: self and Builder.io preview
    "frame-src 'self' https://builder.io https://*.builder.io",
    // Base URI restriction
    "base-uri 'self'",
    // Form action restriction
    "form-action 'self'",
    // Frame ancestors (prevent embedding)
    "frame-ancestors 'none'",
    // Object sources
    "object-src 'none'",
    // Upgrade insecure requests in production
    ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
  ].join("; "),

  // Permissions Policy (formerly Feature-Policy)
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()", // Disable FLoC
  ].join(", "),
};

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set("X-Request-Id", requestId);

  return response;
}

/**
 * Matcher configuration
 *
 * Apply middleware to all routes except:
 * - _next/static (static files)
 * - _next/image (image optimization)
 * - favicon.ico (favicon)
 * - public files (images, fonts, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
