/**
 * Rate Limiting with Upstash Redis
 *
 * Uses sliding window algorithm for fair request distribution.
 * Configured for 5 requests per minute per IP.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Lazy-initialized rate limiter singleton
let _ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (_ratelimit) return _ratelimit;
  
  // Check if Upstash env vars are configured
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('[Rate Limit] Upstash Redis not configured - rate limiting disabled');
    return null;
  }
  
  _ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
    analytics: true,
    prefix: "clg:ratelimit",
    timeout: 5000, // 5 second timeout for Redis operations
  });
  
  return _ratelimit;
}

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
 * 
 * If Redis is not configured, allows all requests (disabled mode)
 */
export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  limit: number;
  resetTime: number;
  headers: RateLimitHeaders;
}> {
  const ratelimit = getRatelimit();
  
  // If rate limiting is disabled, allow all requests
  if (!ratelimit) {
    const now = Date.now();
    return {
      success: true,
      remaining: 999,
      limit: 999,
      resetTime: now + 60000,
      headers: {
        "Retry-After": "0",
        "X-RateLimit-Limit": "999",
        "X-RateLimit-Remaining": "999",
        "X-RateLimit-Reset": new Date(now + 60000).toISOString(),
      },
    };
  }
  
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
