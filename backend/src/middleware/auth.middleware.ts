import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { ADMIN_ROLES, ADMIN_SESSION_COOKIE, getCookieValue, verifyAdminToken } from '../utils/adminAuth';

const unauthorized = (res: Response, code = 'UNAUTHORIZED') => res.status(401).json({
  success: false,
  error: { code, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' }
});

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
  ) return null;
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

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');
    const decoded = jwt.verify(token, secret) as { userId: string; zaloId?: string; role?: string };
    if (decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN') return unauthorized(res);
    req.user = { userId: decoded.userId, zaloId: decoded.zaloId, role: decoded.role };
    next();
  } catch {
    return unauthorized(res, 'TOKEN_INVALID');
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền quản trị' } });
  }
  next();
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Chỉ SUPER_ADMIN được phép thực hiện thao tác này' } });
  }
  next();
};
