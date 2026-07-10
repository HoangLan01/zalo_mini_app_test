/**
 * Unit tests for rateLimit middleware
 */
import { Request, Response, NextFunction } from 'express';
import { globalRateLimiter, globalIpRateLimiter } from '../../middleware/rateLimit.middleware';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('rateLimit.middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue(undefined),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
    
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next for a valid request under the limit', async () => {
    await globalRateLimiter(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should use JWT token for key generation if provided', async () => {
    (mockReq.get as jest.Mock).mockReturnValue('Bearer valid-token');
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-123', role: 'ADMIN' });

    await globalRateLimiter(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
  });

  it('should fallback to IP if JWT is invalid', async () => {
    (mockReq.get as jest.Mock).mockReturnValue('Bearer invalid-token');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await globalRateLimiter(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('globalIpRateLimiter should strictly use IP and not verify JWT', async () => {
    (mockReq.get as jest.Mock).mockReturnValue('Bearer valid-token');
    
    await globalIpRateLimiter(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    // IpLimiter uses getIpOnlyKey, so it should not verify tokens
    expect(jwt.verify).not.toHaveBeenCalled();
  });
});
