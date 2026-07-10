/**
 * Global test setup for backend tests.
 *
 * - Loads .env.test environment variables
 * - Mocks the prisma export from server.ts so unit tests never hit a DB
 * - Provides factory helpers to create test data
 */
import dotenv from 'dotenv';
import path from 'path';

// Load test environment before anything else
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Ensure test-safe defaults
process.env.NODE_ENV = 'test';

import jwt from 'jsonwebtoken';
import prismaMock from '../__mocks__/prismaClient';

// ──────────────────────────────────────────────
// Mock the prisma instance exported from server.ts
// ──────────────────────────────────────────────
jest.mock('../server', () => ({
  prisma: prismaMock,
}));

// ──────────────────────────────────────────────
// Silence logger output during tests
// ──────────────────────────────────────────────
jest.mock('../utils/logger', () => {
  const noop = jest.fn();
  return {
    __esModule: true,
    default: {
      info: noop,
      warn: noop,
      error: noop,
      debug: noop,
    },
    sanitizeUrlForLogging: jest.fn((url: string) => url),
  };
});

// ──────────────────────────────────────────────
// Mock external notification services (ZNS, Zalo OA)
// ──────────────────────────────────────────────
jest.mock('../services/zns.service', () => ({
  sendBookingReceived: jest.fn().mockResolvedValue(undefined),
  sendBookingConfirmed: jest.fn().mockResolvedValue(undefined),
  sendBookingRejected: jest.fn().mockResolvedValue(undefined),
  sendFeedbackReceived: jest.fn().mockResolvedValue(undefined),
  sendFeedbackUpdated: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/zaloOA.service', () => ({
  sendBookingAdminAlert: jest.fn().mockResolvedValue(null),
  sendFeedbackAdminAlert: jest.fn().mockResolvedValue(null),
}));

// ──────────────────────────────────────────────
// Factory helpers
// ──────────────────────────────────────────────
export const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-do-not-use-in-production';

export function createMockUser(overrides: Partial<any> = {}) {
  return {
    id: 'test-user-id',
    zaloId: 'test-zalo-id',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    email: null,
    passwordHash: null,
    phoneToken: null,
    role: 'USER' as const,
    status: 'ACTIVE' as const,
    sessionVersion: 0,
    mustChangePassword: false,
    lastLoginAt: null,
    createdById: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function createMockAdminUser(overrides: Partial<any> = {}) {
  return createMockUser({
    id: 'test-admin-id',
    zaloId: null,
    email: 'admin@test.com',
    passwordHash: '$2a$12$mockHashedPassword',
    role: 'ADMIN' as const,
    ...overrides,
  });
}

export function createMockBooking(overrides: Partial<any> = {}) {
  return {
    id: 'test-booking-id',
    code: 'LH-2026-0001',
    userId: 'test-user-id',
    field: 'HO_TICH' as const,
    preferredDate: new Date('2026-08-01'),
    preferredTime: '09:00',
    confirmedDate: null,
    confirmedTime: null,
    description: 'Test booking description',
    contactName: 'Test Contact',
    contactPhone: '0901234567',
    status: 'PENDING' as const,
    rejectionReason: null,
    rescheduledNote: null,
    reminder24hSent: false,
    reminder1hSent: false,
    oaMessageId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function createMockFeedback(overrides: Partial<any> = {}) {
  return {
    id: 'test-feedback-id',
    code: 'PA-2026-0001',
    userId: 'test-user-id',
    type: 'FIELD' as const,
    title: 'Test feedback',
    category: 'HA_TANG' as const,
    serviceUnit: null,
    satisfactionScore: null,
    contactPhone: '0901234567',
    description: 'Test feedback description',
    imageUrls: [],
    latitude: null,
    longitude: null,
    address: null,
    status: 'PENDING' as const,
    response: null,
    respondedAt: null,
    oaMessageId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function generateTestToken(payload: {
  userId?: string;
  zaloId?: string;
  role?: string;
  sessionVersion?: number;
} = {}) {
  return jwt.sign(
    {
      userId: payload.userId || 'test-user-id',
      zaloId: payload.zaloId || 'test-zalo-id',
      role: payload.role || 'USER',
      sessionVersion: payload.sessionVersion ?? 0,
    },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function generateAdminToken(payload: {
  userId?: string;
  role?: string;
  sessionVersion?: number;
} = {}) {
  return jwt.sign(
    {
      userId: payload.userId || 'test-admin-id',
      role: payload.role || 'ADMIN',
      sessionVersion: payload.sessionVersion ?? 0,
    },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Re-export prismaMock for direct use in test files
export { prismaMock };
