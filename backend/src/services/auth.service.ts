import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../server';
import logger from '../utils/logger';
import { ADMIN_ROLES, signAdminToken } from '../utils/adminAuth';
import { isStrongPassword } from '../utils/password';
import { AppError } from '../utils/appError';

const signToken = (payload: { userId: string; zaloId?: string | null; role: UserRole; sessionVersion: number }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('INTERNAL_SERVER_ERROR', 'JWT_SECRET is not configured', 500);

  return jwt.sign(
    {
      userId: payload.userId,
      zaloId: payload.zaloId || undefined,
      role: payload.role,
      sessionVersion: payload.sessionVersion
    },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '2h') as any }
  );
};

export const loginWithZalo = async (accessToken: string) => {
  try {
    const response = await axios.get('https://graph.zalo.me/v2.0/me', {
      params: { fields: 'id,name,picture' },
      headers: { access_token: accessToken }
    });

    const zaloData = response.data;
    if (zaloData.error) {
      logger.error('Zalo API Error');
      throw new AppError('INVALID_ZALO_TOKEN', 'Xác thực Zalo thất bại', 401);
    }

    const user = await prisma.user.upsert({
      where: { zaloId: zaloData.id },
      update: {
        displayName: zaloData.name,
        avatarUrl: zaloData.picture?.data?.url || undefined,
        status: UserStatus.ACTIVE
      },
      create: {
        zaloId: zaloData.id,
        displayName: zaloData.name,
        avatarUrl: zaloData.picture?.data?.url,
        role: 'USER',
        status: UserStatus.ACTIVE
      }
    });

    const token = signToken({
      userId: user.id,
      zaloId: user.zaloId,
      role: user.role,
      sessionVersion: user.sessionVersion
    });
    return { user, token };
  } catch (error: any) {
    if (error.response || error.code === 'INVALID_ZALO_TOKEN' || error.message === 'INVALID_ZALO_TOKEN') {
      throw new AppError('INVALID_ZALO_TOKEN', 'Xác thực Zalo thất bại', 401);
    }
    throw error;
  }
};

export const loginAdmin = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !ADMIN_ROLES.includes(user.role) || user.status !== 'ACTIVE' || !user.passwordHash) {
    throw new AppError('INVALID_ADMIN_CREDENTIALS', 'Email hoặc mật khẩu không đúng', 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError('INVALID_ADMIN_CREDENTIALS', 'Email hoặc mật khẩu không đúng', 401);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });
  const token = signAdminToken({ userId: user.id, role: user.role, sessionVersion: user.sessionVersion });

  return {
    token,
    user: {
      id: updated.id,
      displayName: updated.displayName,
      email: updated.email,
      role: updated.role,
      mustChangePassword: updated.mustChangePassword
    }
  };
};

export const changeAdminPassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError('INVALID_CURRENT_PASSWORD', 'Mật khẩu hiện tại không đúng', 400);
  }
  if (!isStrongPassword(newPassword)) {
    throw new AppError('WEAK_PASSWORD', 'Mật khẩu mới chưa đáp ứng chính sách bảo mật', 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 12),
      mustChangePassword: false,
      sessionVersion: { increment: 1 }
    }
  });

  return {
    token: signAdminToken({ userId: updated.id, role: updated.role, sessionVersion: updated.sessionVersion }),
    user: updated
  };
};

export const loginDevUser = async () => {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEV_AUTH !== 'true') {
    throw new AppError('DEV_AUTH_DISABLED', 'Dev auth đã bị tắt', 403);
  }

  const zaloId = process.env.DEV_AUTH_ZALO_ID || 'dev-zalo-user';
  const displayName = process.env.DEV_AUTH_DISPLAY_NAME || 'Nguoi dung thu nghiem';

  const user = await prisma.user.upsert({
    where: { zaloId },
    update: {
      displayName,
      role: 'USER',
      status: UserStatus.ACTIVE
    },
    create: {
      zaloId,
      displayName,
      role: 'USER',
      status: UserStatus.ACTIVE
    }
  });

  const token = signToken({
    userId: user.id,
    zaloId: user.zaloId,
    role: user.role,
    sessionVersion: user.sessionVersion
  });
  return { user, token };
};
