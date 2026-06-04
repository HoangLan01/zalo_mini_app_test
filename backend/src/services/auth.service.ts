import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../server';
import logger from '../utils/logger';

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
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role !== 'ADMIN' || !user.passwordHash) {
    throw new Error('INVALID_ADMIN_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('INVALID_ADMIN_CREDENTIALS');
  }

  const token = signToken({ userId: user.id, zaloId: user.zaloId, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role
    }
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
