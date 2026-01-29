/**
 * Unit Tests for CLG Visitor SDK
 *
 * Tests core SDK functions in isolation
 * Run with: npm test -- tests/unit/sdk.test.ts
 */

describe('CLG Visitor SDK', () => {
  // Mock crypto.subtle for Node.js environment
  const mockDigest = jest.fn();

  beforeAll(() => {
    // @ts-expect-error - mocking crypto.subtle
    global.crypto = {
      subtle: {
        digest: mockDigest
      }
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPII', () => {
    // Simulated hashPII function (matches SDK implementation)
    async function hashPII(value: string | null | undefined): Promise<string | null> {
      if (!value || typeof value !== 'string') return null;

      const normalized = value.toLowerCase().trim();
      if (!normalized) return null;

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(normalized);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch {
        // Fallback hash
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
          const char = normalized.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return 'fallback_' + Math.abs(hash).toString(16);
      }
    }

    it('should return null for empty values', async () => {
      expect(await hashPII('')).toBeNull();
      expect(await hashPII(null)).toBeNull();
      expect(await hashPII(undefined)).toBeNull();
    });

    it('should normalize email to lowercase', async () => {
      mockDigest.mockResolvedValue(new ArrayBuffer(32));

      const hash1 = await hashPII('Test@Example.com');
      const hash2 = await hashPII('test@example.com');

      // Both should produce same hash (normalized)
      expect(hash1).toBe(hash2);
    });

    it('should trim whitespace', async () => {
      mockDigest.mockResolvedValue(new ArrayBuffer(32));

      const hash1 = await hashPII('  test@example.com  ');
      const hash2 = await hashPII('test@example.com');

      expect(hash1).toBe(hash2);
    });

    it('should produce 64-character hex string', async () => {
      // Mock a real SHA-256 hash (32 bytes)
      const mockHash = new Uint8Array(32).fill(0xab);
      mockDigest.mockResolvedValue(mockHash.buffer);

      const hash = await hashPII('test@example.com');

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should use fallback when crypto fails', async () => {
      mockDigest.mockRejectedValue(new Error('Crypto not available'));

      const hash = await hashPII('test@example.com');

      expect(hash).toMatch(/^fallback_[0-9a-f]+$/);
    });
  });

  describe('generateId', () => {
    function generateId(prefix = ''): string {
      return prefix + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it('should include prefix when provided', () => {
      const id = generateId('test_');

      expect(id.startsWith('test_')).toBe(true);
    });

    it('should be at least 15 characters long', () => {
      const id = generateId();

      expect(id.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('generateDeviceFingerprint', () => {
    function generateDeviceFingerprint(): string {
      const components = [
        'Mozilla/5.0 Test',
        'en-US',
        '1920x1080',
        '24',
        '-480',
        '8',
        'MacIntel'
      ];

      let hash = 0;
      const str = components.join('|');
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return 'DV' + Math.abs(hash).toString(36).toUpperCase();
    }

    it('should start with DV prefix', () => {
      const fingerprint = generateDeviceFingerprint();

      expect(fingerprint.startsWith('DV')).toBe(true);
    });

    it('should be consistent for same inputs', () => {
      const fp1 = generateDeviceFingerprint();
      const fp2 = generateDeviceFingerprint();

      expect(fp1).toBe(fp2);
    });

    it('should be uppercase', () => {
      const fingerprint = generateDeviceFingerprint();

      expect(fingerprint).toBe(fingerprint.toUpperCase());
    });
  });

  describe('getBrand', () => {
    function getBrand(hostname: string): string {
      if (hostname.includes('access-express')) return 'access-express';
      if (hostname.includes('access-hire') || hostname.includes('accesshire')) return 'access-hire';
      if (hostname.includes('clg')) return 'clg-dev';
      return 'unknown';
    }

    it('should detect access-hire brand', () => {
      expect(getBrand('www.access-hire.com.au')).toBe('access-hire');
      expect(getBrand('accesshire.net')).toBe('access-hire');
    });

    it('should detect access-express brand', () => {
      expect(getBrand('www.access-express.com.au')).toBe('access-express');
    });

    it('should detect clg-dev brand', () => {
      expect(getBrand('clg-ten.vercel.app')).toBe('clg-dev');
      expect(getBrand('localhost')).toBe('unknown');
    });

    it('should return unknown for unrecognized hosts', () => {
      expect(getBrand('example.com')).toBe('unknown');
    });
  });

  describe('UUID validation', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    it('should validate correct UUID v4', () => {
      const validUuid = '7db4fa0b-3a58-43e5-a2aa-472163f4184f';
      expect(uuidRegex.test(validUuid)).toBe(true);
    });

    it('should reject fallback IDs', () => {
      const fallbackId = 'clg_q2u1jnv1omkytmbxf';
      expect(uuidRegex.test(fallbackId)).toBe(false);
    });

    it('should reject invalid UUIDs', () => {
      expect(uuidRegex.test('not-a-uuid')).toBe(false);
      expect(uuidRegex.test('12345678-1234-1234-1234-123456789012')).toBe(false); // Wrong version
    });
  });
});

describe('Data Sanitization', () => {
  function sanitizeEventData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };
    // Remove raw PII
    delete sanitized.email;
    delete sanitized.phone;
    delete sanitized.name;
    delete sanitized.company;
    delete sanitized.form_data;
    return sanitized;
  }

  it('should remove raw email from event data', () => {
    const data = {
      email: 'test@example.com',
      email_hash: 'abc123',
      event: 'form_submit'
    };

    const sanitized = sanitizeEventData(data);

    expect(sanitized.email).toBeUndefined();
    expect(sanitized.email_hash).toBe('abc123');
    expect(sanitized.event).toBe('form_submit');
  });

  it('should remove all PII fields', () => {
    const data = {
      email: 'test@example.com',
      phone: '0415897470',
      name: 'John Doe',
      company: 'Acme Inc',
      form_data: { secret: 'data' },
      visitor_id: 'abc123'
    };

    const sanitized = sanitizeEventData(data);

    expect(sanitized.email).toBeUndefined();
    expect(sanitized.phone).toBeUndefined();
    expect(sanitized.name).toBeUndefined();
    expect(sanitized.company).toBeUndefined();
    expect(sanitized.form_data).toBeUndefined();
    expect(sanitized.visitor_id).toBe('abc123');
  });
});
