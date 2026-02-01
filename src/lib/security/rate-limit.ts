/**
 * Rate Limiting with Upstash Redis
 *
 * Uses sliding window algorithm for fair request distribution.
 * Configured for 5 requests per minute per IP.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Initialize rate limiter (singleton, outside handlers for caching)
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
  analytics: true,
  prefix: "clg:ratelimit",
  timeout: 5000, // 5 second timeout for Redis operations
});

/**
 * Get client IP address with multiple fallbacks
 * Works on Vercel and development environments
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Try multiple headers in order of reliability
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const cfConnectingIp = headersList.get("cf-connecting-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  if (realIp) {
    return realIp.trim();
  }
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return "127.0.0.1"; // Fallback for development
}

/**
 * Rate limit response headers
 */
export interface RateLimitHeaders {
  "Retry-After": string;
  "X-RateLimit-Limit": string;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
}

/**
 * Check rate limit for a given identifier (usually IP)
 * Returns success status and headers for response
 */
export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  limit: number;
  resetTime: number;
  headers: RateLimitHeaders;
}> {
  const { success, remaining, limit, reset, pending } = await ratelimit.limit(identifier);

  // Wait for analytics to complete
  if (pending) {
    await pending;
  }

  const resetInSeconds = Math.ceil((reset - Date.now()) / 1000);

  return {
    success,
    remaining,
    limit,
    resetTime: reset,
    headers: {
      "Retry-After": resetInSeconds.toString(),
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(reset).toISOString(),
    },
  };
}

/**
 * Rate limit error response body
 */
export function rateLimitErrorBody(resetInSeconds: number) {
  return {
    success: false,
    error: "Too many requests",
    message: `You've reached the maximum number of submissions. Please try again in ${resetInSeconds} seconds.`,
    retryAfter: resetInSeconds,
  };
}
