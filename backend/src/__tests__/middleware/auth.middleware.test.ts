/**
 * Unit tests for auth.middleware.ts
 */
import '../setup';
import { prismaMock, createMockUser, createMockAdminUser, generateTestToken, generateAdminToken, TEST_JWT_SECRET } from '../setup';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../../middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';

// Helper to create mock req/res/next
function createMockReqResNext(overrides: Partial<Request> = {}) {
  const req = {
    headers: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next };
}

describe('authenticateToken', () => {
  it('should set req.user for valid Bearer token', async () => {
    const token = generateTestToken({ userId: 'user-1', role: 'USER', sessionVersion: 0 });
    const mockUser = createMockUser({ id: 'user-1' });
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const { req, res, next } = createMockReqResNext({
      headers: { authorization: `Bearer ${token}` } as any,
    });

    authenticateToken(req, res, next);

    // Wait for async processing
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user?.userId).toBe('user-1');
  });

  it('should return 401 when no Authorization header', () => {
    const { req, res, next } = createMockReqResNext();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token format', () => {
    const { req, res, next } = createMockReqResNext({
      headers: { authorization: 'InvalidFormat token123' } as any,
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 for expired token', async () => {
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: 'user-1', role: 'USER', sessionVersion: 0 },
      TEST_JWT_SECRET,
      { expiresIn: '0s' }
    );

    const { req, res, next } = createMockReqResNext({
      headers: { authorization: `Bearer ${expiredToken}` } as any,
    });

    authenticateToken(req, res, next);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should reject ADMIN role via Bearer token (must use cookie)', async () => {
    const token = generateTestToken({ userId: 'admin-1', role: 'ADMIN', sessionVersion: 0 });

    const { req, res, next } = createMockReqResNext({
      headers: { authorization: `Bearer ${token}` } as any,
    });

    authenticateToken(req, res, next);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 when user is DISABLED', async () => {
    const token = generateTestToken({ userId: 'user-disabled', role: 'USER', sessionVersion: 0 });
    const disabledUser = createMockUser({ id: 'user-disabled', status: 'DISABLED' });
    prismaMock.user.findUnique.mockResolvedValue(disabledUser);

    const { req, res, next } = createMockReqResNext({
      headers: { authorization: `Bearer ${token}` } as any,
    });

    authenticateToken(req, res, next);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 when sessionVersion mismatch', async () => {
    const token = generateTestToken({ userId: 'user-1', role: 'USER', sessionVersion: 0 });
    const updatedUser = createMockUser({ id: 'user-1', sessionVersion: 1 });
    prismaMock.user.findUnique.mockResolvedValue(updatedUser);

    const { req, res, next } = createMockReqResNext({
      headers: { authorization: `Bearer ${token}` } as any,
    });

    authenticateToken(req, res, next);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('requireAdmin', () => {
  it('should call next() for ADMIN role', () => {
    const { req, res, next } = createMockReqResNext();
    req.user = { userId: 'admin-1', role: 'ADMIN', sessionVersion: 0 };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next() for SUPER_ADMIN role', () => {
    const { req, res, next } = createMockReqResNext();
    req.user = { userId: 'super-1', role: 'SUPER_ADMIN', sessionVersion: 0 };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 for USER role', () => {
    const { req, res, next } = createMockReqResNext();
    req.user = { userId: 'user-1', role: 'USER', sessionVersion: 0 };

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when no user on request', () => {
    const { req, res, next } = createMockReqResNext();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requireSuperAdmin', () => {
  it('should call next() for SUPER_ADMIN', () => {
    const { req, res, next } = createMockReqResNext();
    req.user = { userId: 'super-1', role: 'SUPER_ADMIN', sessionVersion: 0 };

    requireSuperAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 for ADMIN role', () => {
    const { req, res, next } = createMockReqResNext();
    req.user = { userId: 'admin-1', role: 'ADMIN', sessionVersion: 0 };

    requireSuperAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should return 403 for USER role', () => {
    const { req, res, next } = createMockReqResNext();
    req.user = { userId: 'user-1', role: 'USER', sessionVersion: 0 };

    requireSuperAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
