/**
 * E2E Tests for CLG Identity System
 *
 * Full browser automation tests using Playwright
 * Run with: npx playwright test tests/e2e/
 *
 * Prerequisites:
 * - npm install -D @playwright/test
 * - npx playwright install
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const SMOKE_TEST_URL = `${BASE_URL}/test/smoke`;

test.describe('Identity System E2E', () => {
  test.describe('SDK Initialization', () => {
    test('should load SDK and get visitor ID', async ({ page }) => {
      await page.goto(BASE_URL);

      // Wait for SDK to initialize
      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      }, { timeout: 10000 });

      // Verify visitor ID is a valid UUID
      const visitorId = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      expect(visitorId).toBeTruthy();
      expect(visitorId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('should persist visitor ID across page loads', async ({ page }) => {
      await page.goto(BASE_URL);

      // Get initial visitor ID
      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });
      const visitorId1 = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      // Reload page
      await page.reload();

      // Get visitor ID again
      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });
      const visitorId2 = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      expect(visitorId1).toBe(visitorId2);
    });

    test('should set visitor cookie', async ({ page }) => {
      await page.goto(BASE_URL);

      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      const cookies = await page.context().cookies();
      const visitorCookie = cookies.find(c => c.name === 'clg_vid');

      expect(visitorCookie).toBeTruthy();
      expect(visitorCookie?.value).toMatch(/^[0-9a-f]{8}-/i);
    });

    test('should push to dataLayer', async ({ page }) => {
      await page.goto(BASE_URL);

      await page.waitForFunction(() => {
        const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
        return dataLayer?.some((item: unknown) =>
          (item as { event?: string }).event === 'clg_visitor_ready'
        );
      }, { timeout: 10000 });

      const dataLayerEvents = await page.evaluate(() => {
        return (window as unknown as { dataLayer?: unknown[] }).dataLayer?.filter((item: unknown) =>
          (item as { event?: string }).event?.startsWith('clg_')
        );
      });

      expect(dataLayerEvents?.length).toBeGreaterThan(0);
    });
  });

  test.describe('Device Fingerprinting', () => {
    test('should generate consistent device ID', async ({ page }) => {
      await page.goto(BASE_URL);

      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { getDeviceId?: () => string } }).CLGVisitor?.getDeviceId;
      });

      const deviceId1 = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { getDeviceId?: () => string } }).CLGVisitor?.getDeviceId?.();
      });

      await page.reload();

      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { getDeviceId?: () => string } }).CLGVisitor?.getDeviceId;
      });

      const deviceId2 = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { getDeviceId?: () => string } }).CLGVisitor?.getDeviceId?.();
      });

      expect(deviceId1).toBe(deviceId2);
      expect(deviceId1).toMatch(/^DV/);
    });
  });

  test.describe('Session Tracking', () => {
    test('should create new session ID', async ({ page }) => {
      await page.goto(BASE_URL);

      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { sessionId?: string } }).CLGVisitor?.sessionId;
      });

      const sessionId = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { sessionId?: string } }).CLGVisitor?.sessionId;
      });

      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^ses_/);
    });

    test('should track page views in session', async ({ page }) => {
      await page.goto(BASE_URL);

      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { session?: { page_views?: number } } }).CLGVisitor?.session;
      });

      const pageViews1 = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { session?: { page_views?: number } } }).CLGVisitor?.session?.page_views;
      });

      // Navigate to another page (if exists) or reload
      await page.reload();

      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { session?: { page_views?: number } } }).CLGVisitor?.session;
      });

      const pageViews2 = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { session?: { page_views?: number } } }).CLGVisitor?.session?.page_views;
      });

      expect(pageViews2).toBeGreaterThanOrEqual(pageViews1 || 0);
    });
  });

  test.describe('Identity Check', () => {
    test('should call checkIdentity on page load', async ({ page }) => {
      // Intercept the checkIdentity request
      const checkIdentityPromise = page.waitForRequest(
        request => request.url().includes('checkIdentity')
      );

      await page.goto(BASE_URL);

      const request = await checkIdentityPromise;
      expect(request.method()).toBe('POST');

      const postData = JSON.parse(request.postData() || '{}');
      expect(postData.uid).toBeTruthy();
      expect(postData.device_id).toBeTruthy();
    });
  });

  test.describe('Smoke Test Page', () => {
    test('should load smoke test page', async ({ page }) => {
      await page.goto(SMOKE_TEST_URL);

      await expect(page.locator('h1')).toContainText('Identity System');
    });

    test('should have URL input and launch button', async ({ page }) => {
      await page.goto(SMOKE_TEST_URL);

      await expect(page.locator('input[type="url"]')).toBeVisible();
      await expect(page.locator('button:has-text("Launch")')).toBeVisible();
    });

    test('should show test cases', async ({ page }) => {
      await page.goto(SMOKE_TEST_URL);

      // Check for test group headers
      await expect(page.locator('text=Core Functionality')).toBeVisible();
      await expect(page.locator('text=Identity Linking')).toBeVisible();
      await expect(page.locator('text=Form Tracking')).toBeVisible();
      await expect(page.locator('text=Performance')).toBeVisible();
    });

    test('should launch debug session', async ({ page, context }) => {
      await page.goto(SMOKE_TEST_URL);

      // Enter a test URL
      await page.fill('input[type="url"]', BASE_URL);

      // Listen for new page (popup)
      const popupPromise = context.waitForEvent('page');

      // Click launch
      await page.click('button:has-text("Launch")');

      // Verify popup opened
      const popup = await popupPromise;
      expect(popup.url()).toContain('clg_debug=');
    });
  });

  test.describe('Form Submission Flow', () => {
    test.skip('should track form submission with identity linking', async ({ page }) => {
      // This test requires a page with a contact form
      // Adjust the URL and selectors based on your actual form page

      await page.goto(`${BASE_URL}/contact`);

      // Wait for SDK
      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      // Fill form (adjust selectors)
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', '0415897470');
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('textarea[name="message"]', 'E2E test message');

      // Intercept linkIdentity request
      const linkIdentityPromise = page.waitForRequest(
        request => request.url().includes('linkIdentity')
      );

      // Submit form
      await page.click('button[type="submit"]');

      // Verify linkIdentity was called
      const request = await linkIdentityPromise;
      const postData = JSON.parse(request.postData() || '{}');

      expect(postData.email_hash).toBeTruthy();
      expect(postData.email_hash).not.toContain('@'); // Should be hashed
      expect(postData.phone_hash).toBeTruthy();
    });
  });

  test.describe('Cross-Browser Consistency', () => {
    test('should work in different viewport sizes', async ({ page }) => {
      // Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      const mobileVisitorId = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      // Desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();

      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      const desktopVisitorId = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      // Same visitor across viewports
      expect(mobileVisitorId).toBe(desktopVisitorId);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Block the Firebase endpoint
      await page.route('**/visitorId*', route => route.abort());

      await page.goto(BASE_URL);

      // SDK should still initialize with fallback ID
      await page.waitForFunction(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      }, { timeout: 15000 });

      const visitorId = await page.evaluate(() => {
        return (window as unknown as { CLGVisitor?: { visitorId?: string } }).CLGVisitor?.visitorId;
      });

      // Should have fallback ID
      expect(visitorId).toBeTruthy();
      expect(visitorId).toMatch(/^clg_/); // Fallback prefix
    });
  });

  test.describe('Privacy & Security', () => {
    test('should not expose raw PII in dataLayer', async ({ page }) => {
      await page.goto(BASE_URL);

      await page.waitForFunction(() => {
        return (window as unknown as { dataLayer?: unknown[] }).dataLayer?.length > 0;
      });

      const dataLayer = await page.evaluate(() => {
        return JSON.stringify((window as unknown as { dataLayer?: unknown[] }).dataLayer);
      });

      // Should not contain email patterns
      expect(dataLayer).not.toMatch(/@[a-z]+\./i);
      // Should not contain phone patterns
      expect(dataLayer).not.toMatch(/\d{10}/);
    });

    test('should not expose raw PII in network requests', async ({ page }) => {
      const requests: string[] = [];

      page.on('request', request => {
        if (request.url().includes('cloudfunctions.net')) {
          requests.push(request.postData() || '');
        }
      });

      await page.goto(BASE_URL);

      // Wait for requests to complete
      await page.waitForTimeout(3000);

      // Check all request bodies
      for (const body of requests) {
        expect(body).not.toMatch(/@[a-z]+\.[a-z]/i); // No emails
        expect(body).not.toMatch(/04\d{8}/); // No AU phone numbers
      }
    });
  });
});
