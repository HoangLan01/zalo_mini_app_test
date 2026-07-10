/**
 * Mock PrismaClient for unit tests.
 *
 * Unit tests import this mock instead of the real PrismaClient so they
 * never touch a real database.  Every model method is a `jest.fn()`,
 * so individual tests can set up return values with `.mockResolvedValue()`.
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

const prismaMock = mockDeep<PrismaClient>();

// Provide a convenience reset helper
export const resetPrismaMock = () => {
  // jest-mock-extended deep mocks auto-reset with jest.clearAllMocks()
};

export default prismaMock;
