// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' }
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');
    
    const decoded = jwt.verify(token, secret) as { userId: string; zaloId: string };
    req.user = { userId: decoded.userId, zaloId: decoded.zaloId };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' }
    });
  }
};
