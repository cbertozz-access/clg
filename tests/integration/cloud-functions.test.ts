/**
 * Integration Tests for CLG Cloud Functions
 *
 * Tests the identity graph Cloud Functions against the live API
 * Run with: npm test -- tests/integration/cloud-functions.test.ts
 *
 * Note: These tests hit the actual Cloud Functions.
 * For local testing, use Firebase Emulator.
 */

const BASE_URL = 'https://australia-southeast1-composable-lg.cloudfunctions.net';

describe('Cloud Functions Integration', () => {
  const testUid = `test-${Date.now()}`;
  const testDeviceId = `DV-TEST-${Date.now()}`;
  const testEmailHash = `email_hash_${Date.now()}`;
  const testPhoneHash = `phone_hash_${Date.now()}`;

  describe('visitorId', () => {
    it('should return a new visitor ID', async () => {
      const response = await fetch(`${BASE_URL}/visitorId`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.visitor_id).toBeDefined();
      expect(data.visitor_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(data.is_new_visitor).toBe(true);
    });

    it('should return existing visitor when vid provided', async () => {
      // First, get a new visitor
      const response1 = await fetch(`${BASE_URL}/visitorId`);
      const data1 = await response1.json();
      const visitorId = data1.visitor_id;

      // Then fetch with that ID
      const response2 = await fetch(`${BASE_URL}/visitorId?vid=${visitorId}`);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.visitor_id).toBe(visitorId);
    });

    it('should include dataLayer format', async () => {
      const response = await fetch(`${BASE_URL}/visitorId`);
      const data = await response.json();

      expect(data.dataLayer).toBeDefined();
      expect(data.dataLayer.event).toBe('visitor_identified');
      expect(data.dataLayer.visitor_id).toBe(data.visitor_id);
    });
  });

  describe('checkIdentity', () => {
    it('should return is_known: false for new device', async () => {
      const response = await fetch(`${BASE_URL}/checkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: testUid,
          device_id: testDeviceId,
          brand: 'test'
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.is_known).toBe(false);
      expect(data.master_uid).toBeNull();
      expect(data.match_type).toBeNull();
    });

    it('should require uid and device_id', async () => {
      const response = await fetch(`${BASE_URL}/checkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
    });

    it('should handle CORS preflight', async () => {
      const response = await fetch(`${BASE_URL}/checkIdentity`, {
        method: 'OPTIONS'
      });

      expect(response.status).toBe(204);
    });
  });

  describe('linkIdentity', () => {
    it('should create new identity', async () => {
      const response = await fetch(`${BASE_URL}/linkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: testUid,
          device_id: testDeviceId,
          brand: 'test',
          email_hash: testEmailHash,
          phone_hash: testPhoneHash
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.is_duplicate).toBe(false);
      expect(data.master_uid).toBe(testUid);
      expect(data.action).toBe('created');
    });

    it('should detect duplicate by email', async () => {
      const newUid = `test-dup-${Date.now()}`;

      const response = await fetch(`${BASE_URL}/linkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: newUid,
          device_id: 'DV-DIFFERENT',
          brand: 'test',
          email_hash: testEmailHash, // Same email hash
          phone_hash: 'different_phone'
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.is_duplicate).toBe(true);
      expect(data.match_sources).toContain('email');
      expect(data.master_uid).toBe(testUid);
      expect(data.action).toBe('linked');
    });

    it('should detect duplicate by phone', async () => {
      const newUid = `test-dup-phone-${Date.now()}`;

      const response = await fetch(`${BASE_URL}/linkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: newUid,
          device_id: 'DV-DIFFERENT-2',
          brand: 'test',
          email_hash: 'different_email',
          phone_hash: testPhoneHash // Same phone hash
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      // May be duplicate by email (priority) or phone
      expect(data.is_duplicate).toBe(true);
    });

    it('should require uid', async () => {
      const response = await fetch(`${BASE_URL}/linkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: 'DV-TEST',
          brand: 'test'
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('mergeIdentity', () => {
    let sourceUid: string;
    let targetUid: string;

    beforeAll(async () => {
      // Create two separate identities to merge
      sourceUid = `merge-source-${Date.now()}`;
      targetUid = `merge-target-${Date.now()}`;

      await fetch(`${BASE_URL}/linkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: sourceUid,
          device_id: 'DV-MERGE-SRC',
          brand: 'test',
          email_hash: `merge_email_src_${Date.now()}`,
          phone_hash: `merge_phone_src_${Date.now()}`
        })
      });

      await fetch(`${BASE_URL}/linkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: targetUid,
          device_id: 'DV-MERGE-TGT',
          brand: 'test',
          email_hash: `merge_email_tgt_${Date.now()}`,
          phone_hash: `merge_phone_tgt_${Date.now()}`
        })
      });
    });

    it('should merge source into target', async () => {
      const response = await fetch(`${BASE_URL}/mergeIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'merge',
          source_uid: sourceUid,
          target_uid: targetUid,
          merged_by: 'integration-test'
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.merged_uid).toBe(sourceUid);
      expect(data.master_uid).toBe(targetUid);
    });

    it('should require action=merge', async () => {
      const response = await fetch(`${BASE_URL}/mergeIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invalid',
          source_uid: 'a',
          target_uid: 'b'
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('debugEvents', () => {
    const debugSessionId = `dbg_test_${Date.now()}`;

    it('should store debug event', async () => {
      const response = await fetch(`${BASE_URL}/debugEvents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: debugSessionId,
          type: 'test_event',
          data: { foo: 'bar' }
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.event_id).toBeDefined();
    });

    it('should retrieve debug events', async () => {
      // Wait a moment for the event to be stored
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(`${BASE_URL}/debugEvents?session=${debugSessionId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toBeDefined();
      expect(Array.isArray(data.events)).toBe(true);
    });

    it('should require session_id for GET', async () => {
      const response = await fetch(`${BASE_URL}/debugEvents`);

      expect(response.status).toBe(400);
    });
  });

  describe('CORS Headers', () => {
    it('should include proper CORS headers', async () => {
      const response = await fetch(`${BASE_URL}/visitorId`, {
        headers: {
          'Origin': 'https://example.com'
        }
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });

  describe('Response Times', () => {
    it('should respond within 2 seconds for visitorId', async () => {
      const start = Date.now();
      await fetch(`${BASE_URL}/visitorId`);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });

    it('should respond within 2 seconds for checkIdentity', async () => {
      const start = Date.now();
      await fetch(`${BASE_URL}/checkIdentity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: 'perf-test',
          device_id: 'DV-PERF',
          brand: 'test'
        })
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });
});
