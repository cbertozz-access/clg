// Jest setup file

// Mock Next.js headers/cookies for testing
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn((name) => {
      const mockHeaders = {
        'x-forwarded-for': '192.168.1.100',
        'x-real-ip': null,
        'cf-connecting-ip': null,
      };
      return mockHeaders[name] || null;
    }),
  })),
  cookies: jest.fn(() => ({
    get: jest.fn(() => undefined),
    set: jest.fn(),
  })),
}));

// Mock environment variables
process.env.CSRF_SECRET = 'test-csrf-secret-for-unit-tests';
process.env.NODE_ENV = 'test';
