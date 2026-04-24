// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { loginWithZalo } from '../services/auth.service';
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
      select: { id: true, zaloId: true, displayName: true, createdAt: true }
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
