import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { ADMIN_ROLES, ADMIN_SESSION_COOKIE, getCookieValue, verifyAdminToken } from '../utils/adminAuth';
import { sendError } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

const unauthorized = (res: Response, code = 'UNAUTHORIZED') =>
  sendError(res, code, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);

const loadAdmin = async (req: Request, allowPasswordChange: boolean) => {
  const token = getCookieValue(req.headers.cookie, ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const decoded = verifyAdminToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (
    !user ||
    !ADMIN_ROLES.includes(user.role) ||
    user.status !== 'ACTIVE' ||
    user.role !== decoded.role ||
    user.sessionVersion !== decoded.sessionVersion ||
    (!allowPasswordChange && user.mustChangePassword)
  ) {
    return null;
  }

  return user;
};

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  loadAdmin(req, false)
    .then(user => {
      if (!user) return unauthorized(res);
      req.user = {
        userId: user.id,
        role: user.role,
        sessionVersion: user.sessionVersion,
        mustChangePassword: user.mustChangePassword
      };
      next();
    })
    .catch(() => unauthorized(res, 'TOKEN_INVALID'));
};

export const authenticateAdminSession = (req: Request, res: Response, next: NextFunction) => {
  loadAdmin(req, true)
    .then(user => {
      if (!user) return unauthorized(res);
      req.user = {
        userId: user.id,
        role: user.role,
        sessionVersion: user.sessionVersion,
        mustChangePassword: user.mustChangePassword
      };
      next();
    })
    .catch(() => unauthorized(res, 'TOKEN_INVALID'));
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  if (getCookieValue(req.headers.cookie, ADMIN_SESSION_COOKIE)) return authenticateAdmin(req, res, next);

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) return unauthorized(res);

  Promise.resolve()
    .then(async () => {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new AppError('INTERNAL_SERVER_ERROR', 'JWT_SECRET is not configured', 500);

      const decoded = jwt.verify(token, secret) as {
        userId: string;
        zaloId?: string;
        role?: string;
        sessionVersion?: number;
      };

      if (decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN') return unauthorized(res);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, zaloId: true, role: true, status: true, sessionVersion: true }
      });

      const tokenRole = decoded.role || 'USER';
      const tokenSessionVersion = decoded.sessionVersion ?? 0;
      if (!user || user.status !== 'ACTIVE' || user.role !== tokenRole || user.sessionVersion !== tokenSessionVersion) {
        return unauthorized(res, 'TOKEN_INVALID');
      }

      req.user = {
        userId: user.id,
        zaloId: user.zaloId || decoded.zaloId,
        role: user.role,
        sessionVersion: user.sessionVersion
      };
      next();
    })
    .catch((error) => {
      if (error instanceof AppError && error.statusCode >= 500) {
        return next(error);
      }
      return unauthorized(res, 'TOKEN_INVALID');
    });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return sendError(res, 'FORBIDDEN', 'Bạn không có quyền quản trị', 403);
  }
  next();
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return sendError(res, 'FORBIDDEN', 'Chỉ SUPER_ADMIN được phép thực hiện thao tác này', 403);
  }
  next();
};
