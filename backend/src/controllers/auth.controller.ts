import { Request, Response, NextFunction } from 'express';
import { changeAdminPassword, loginAdmin, loginDevUser, loginWithZalo } from '../services/auth.service';
import { prisma } from '../server';
import { clearAdminSessionCookie, setAdminSessionCookie } from '../utils/adminAuth';
import { writeAuditLog } from '../services/adminAudit.service';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.body;
    const { user, token } = await loginWithZalo(accessToken);

    return sendSuccess(res, { token, user });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('UNAUTHORIZED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, zaloId: true, displayName: true, avatarUrl: true, email: true, role: true, createdAt: true },
    });

    if (!user) throw new AppError('NOT_FOUND', 'Không tìm thấy người dùng', 404);

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const data = await loginAdmin(email, password);
    setAdminSessionCookie(res, data.token);

    return sendSuccess(res, { user: data.user });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req: Request, res: Response) => {
  clearAdminSessionCookie(res);
  return sendSuccess(res, { message: 'Đã đăng xuất' });
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
        lastLoginAt: true,
      },
    });
    if (!user) throw new AppError('NOT_FOUND', 'Không tìm thấy tài khoản quản trị', 404);
    return sendSuccess(res, user);
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
    return sendSuccess(res, { message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

export const devLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await loginDevUser();

    return sendSuccess(res, { token, user });
  } catch (error) {
    next(error);
  }
};
