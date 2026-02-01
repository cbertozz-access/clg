/**
 * CSRF Protection Unit Tests
 */

import { createCSRFToken, csrfErrorResponse } from '../csrf';

describe('CSRF Protection', () => {
  const testSecret = 'test-secret-key';

  describe('createCSRFToken', () => {
    it('should generate a new token when no cookie exists', () => {
      const result = createCSRFToken({
        secret: testSecret,
        cookieValue: undefined,
        isPost: false,
      });

      expect(result.cookie).toBeDefined();
      expect(result.csrfToken).toBeDefined();
      expect(result.cookie).toContain('|'); // Format: token|hash
      expect(result.csrfToken?.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should verify a valid cookie token', () => {
      // First, create a token
      const { cookie, csrfToken } = createCSRFToken({
        secret: testSecret,
        cookieValue: undefined,
        isPost: false,
      });

      // Then verify it
      const result = createCSRFToken({
        secret: testSecret,
        cookieValue: cookie,
        isPost: false,
      });

      expect(result.csrfToken).toBe(csrfToken);
      expect(result.cookie).toBeUndefined(); // No new cookie needed
    });

    it('should validate POST request with matching body token', () => {
      // Create initial token
      const { cookie, csrfToken } = createCSRFToken({
        secret: testSecret,
        cookieValue: undefined,
        isPost: false,
      });

      // Verify POST with correct body token
      const result = createCSRFToken({
        secret: testSecret,
        cookieValue: cookie,
        isPost: true,
        bodyValue: csrfToken,
      });

      expect(result.csrfTokenVerified).toBe(true);
    });

    it('should reject POST request with wrong body token', () => {
      // Create initial token
      const { cookie } = createCSRFToken({
        secret: testSecret,
        cookieValue: undefined,
        isPost: false,
      });

      // Verify POST with wrong body token
      const result = createCSRFToken({
        secret: testSecret,
        cookieValue: cookie,
        isPost: true,
        bodyValue: 'wrong-token',
      });

      expect(result.csrfTokenVerified).toBe(false);
    });

    it('should reject tampered cookie hash', () => {
      // Create initial token
      const { csrfToken } = createCSRFToken({
        secret: testSecret,
        cookieValue: undefined,
        isPost: false,
      });

      // Try to use a tampered cookie
      const tamperedCookie = `${csrfToken}|invalid-hash`;
      const result = createCSRFToken({
        secret: testSecret,
        cookieValue: tamperedCookie,
        isPost: false,
      });

      // Should generate new token since cookie is invalid
      expect(result.cookie).toBeDefined();
      expect(result.csrfToken).not.toBe(csrfToken);
    });

    it('should use different secrets to produce different hashes', () => {
      const result1 = createCSRFToken({
        secret: 'secret-1',
        cookieValue: undefined,
        isPost: false,
      });

      const result2 = createCSRFToken({
        secret: 'secret-2',
        cookieValue: undefined,
        isPost: false,
      });

      // Both should have cookies, but with different hashes
      expect(result1.cookie).toBeDefined();
      expect(result2.cookie).toBeDefined();

      const hash1 = result1.cookie?.split('|')[1];
      const hash2 = result2.cookie?.split('|')[1];
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('csrfErrorResponse', () => {
    it('should return properly formatted error response', () => {
      const response = csrfErrorResponse();

      expect(response).toEqual({
        success: false,
        error: 'CSRF validation failed',
        message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      });
    });
  });
});
