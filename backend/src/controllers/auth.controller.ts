// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { changeAdminPassword, loginAdmin, loginDevUser, loginWithZalo } from '../services/auth.service';
import { prisma } from '../server';
import { clearAdminSessionCookie, setAdminSessionCookie } from '../utils/adminAuth';
import { PASSWORD_POLICY_MESSAGE } from '../utils/password';
import { writeAuditLog } from '../services/adminAudit.service';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.body;
    const { user, token } = await loginWithZalo(accessToken);
    
    res.status(200).json({
      success: true,
      data: { token, user }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('UNAUTHORIZED');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, zaloId: true, displayName: true, avatarUrl: true, email: true, role: true, createdAt: true }
    });

    if (!user) throw new Error('NOT_FOUND');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const data = await loginAdmin(email, password);
    setAdminSessionCookie(res, data.token);

    res.status(200).json({
      success: true,
      data: { user: data.user }
    });
  } catch (error: any) {
    if (error.message === 'INVALID_ADMIN_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng' }
      });
    }
    next(error);
  }
};

export const adminLogout = async (req: Request, res: Response) => {
  clearAdminSessionCookie(res);
  res.status(200).json({ success: true, data: { message: 'Đã đăng xuất' } });
};

export const getAdminMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        mustChangePassword: true,
        lastLoginAt: true
      }
    });
    if (!user) throw new Error('NOT_FOUND');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const adminChangePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await changeAdminPassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    setAdminSessionCookie(res, result.token);
    await writeAuditLog(
      { actorId: req.user!.userId, ipAddress: req.ip, userAgent: req.get('user-agent') },
      'ADMIN_ACCOUNT_CHANGE_PASSWORD',
      'ADMIN_ACCOUNT',
      req.user!.userId,
      {}
    );
    res.status(200).json({ success: true, data: { message: 'Đổi mật khẩu thành công' } });
  } catch (error: any) {
    if (error.message === 'INVALID_CURRENT_PASSWORD') {
      return res.status(400).json({ success: false, error: { code: error.message, message: 'Mật khẩu hiện tại không đúng' } });
    }
    if (error.message === 'WEAK_PASSWORD') {
      return res.status(400).json({ success: false, error: { code: error.message, message: PASSWORD_POLICY_MESSAGE } });
    }
    next(error);
  }
};

export const devLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await loginDevUser();

    res.status(200).json({
      success: true,
      data: { token, user }
    });
  } catch (error: any) {
    if (error.message === 'DEV_AUTH_DISABLED') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Dev auth đã bị tắt' }
      });
    }
    next(error);
  }
};
