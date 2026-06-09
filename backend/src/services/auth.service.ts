import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../server';
import logger from '../utils/logger';
import { ADMIN_ROLES, signAdminToken } from '../utils/adminAuth';
import { isStrongPassword } from '../utils/password';

const signToken = (payload: { userId: string; zaloId?: string | null; role: UserRole }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('System configuration error: JWT_SECRET missing');

  return jwt.sign(
    { userId: payload.userId, zaloId: payload.zaloId || undefined, role: payload.role },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
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
      logger.error('Zalo API Error:', zaloData);
      throw new Error('INVALID_ZALO_TOKEN');
    }

    const user = await prisma.user.upsert({
      where: { zaloId: zaloData.id },
      update: {
        displayName: zaloData.name,
        avatarUrl: zaloData.picture?.data?.url || undefined
      },
      create: {
        zaloId: zaloData.id,
        displayName: zaloData.name,
        avatarUrl: zaloData.picture?.data?.url,
        role: 'USER'
      }
    });

    const token = signToken({ userId: user.id, zaloId: user.zaloId, role: user.role });
    return { user, token };
  } catch (error: any) {
    if (error.response || error.message === 'INVALID_ZALO_TOKEN') {
      throw new Error('INVALID_ZALO_TOKEN');
    }
    throw error;
  }
};

export const loginAdmin = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  if (!user || !ADMIN_ROLES.includes(user.role) || user.status !== 'ACTIVE' || !user.passwordHash) {
    throw new Error('INVALID_ADMIN_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('INVALID_ADMIN_CREDENTIALS');
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
    throw new Error('INVALID_CURRENT_PASSWORD');
  }
  if (!isStrongPassword(newPassword)) throw new Error('WEAK_PASSWORD');

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
    throw new Error('DEV_AUTH_DISABLED');
  }

  const zaloId = process.env.DEV_AUTH_ZALO_ID || 'dev-zalo-user';
  const displayName = process.env.DEV_AUTH_DISPLAY_NAME || 'Người dùng thử nghiệm';

  const user = await prisma.user.upsert({
    where: { zaloId },
    update: {
      displayName,
      role: 'USER'
    },
    create: {
      zaloId,
      displayName,
      role: 'USER'
    }
  });

  const token = signToken({ userId: user.id, zaloId: user.zaloId, role: user.role });
  return { user, token };
};
