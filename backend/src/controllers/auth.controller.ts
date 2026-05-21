// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { loginAdmin, loginDevUser, loginWithZalo } from '../services/auth.service';
import { prisma } from '../server';

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

    res.status(200).json({
      success: true,
      data
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
