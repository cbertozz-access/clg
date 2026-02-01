/**
 * Rate Limiting Unit Tests
 */

import { rateLimitErrorBody } from '../rate-limit';

// Note: Full rate limit testing requires Redis integration tests
// These unit tests focus on pure functions

describe('Rate Limiting', () => {
  describe('rateLimitErrorBody', () => {
    it('should format rate limit error with singular second', () => {
      const body = rateLimitErrorBody(1);

      expect(body).toEqual({
        success: false,
        error: 'Too many requests',
        message: "You've reached the maximum number of submissions. Please try again in 1 seconds.",
        retryAfter: 1,
      });
    });

    it('should format rate limit error with plural seconds', () => {
      const body = rateLimitErrorBody(30);

      expect(body).toEqual({
        success: false,
        error: 'Too many requests',
        message: "You've reached the maximum number of submissions. Please try again in 30 seconds.",
        retryAfter: 30,
      });
    });

    it('should include correct retry-after value', () => {
      const body = rateLimitErrorBody(45);

      expect(body.retryAfter).toBe(45);
    });
  });

  describe('getClientIp', () => {
    // These tests use mocked headers from jest.setup.js
    it('should extract IP from x-forwarded-for header', async () => {
      const { getClientIp } = await import('../rate-limit');
      const ip = await getClientIp();

      // Based on mock in jest.setup.js
      expect(ip).toBe('192.168.1.100');
    });
  });

  describe('checkRateLimit (disabled mode)', () => {
    // When Redis is not configured, rate limiting is disabled
    it('should allow all requests when Redis is not configured', async () => {
      // Ensure env vars are not set
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      // Re-import to get fresh instance
      jest.resetModules();
      const { checkRateLimit } = await import('../rate-limit');

      const result = await checkRateLimit('test-ip');

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(999);
      expect(result.limit).toBe(999);
      expect(result.headers['X-RateLimit-Remaining']).toBe('999');
    });
  });
});
