// src/services/auth.service.ts
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import logger from '../utils/logger';

export const loginWithZalo = async (accessToken: string) => {
  try {
    // 1. Lấy thông tin user từ Zalo
    const response = await axios.get('https://graph.zalo.me/v2.0/me', {
      params: { fields: 'id,name,picture' },
      headers: { access_token: accessToken }
    });

    const zaloData = response.data;
    
    if (zaloData.error) {
      logger.error('Zalo API Error:', zaloData);
      throw new Error('INVALID_ZALO_TOKEN');
    }

    // 2. Upsert user trong DB
    const user = await prisma.user.upsert({
      where: { zaloId: zaloData.id },
      update: { displayName: zaloData.name },
      create: { 
        zaloId: zaloData.id, 
        displayName: zaloData.name 
      }
    });

    // 3. Ký JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('System configuration error: JWT_SECRET missing');

    const token = jwt.sign(
      { userId: user.id, zaloId: user.zaloId },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    return { user, token };
  } catch (error: any) {
    if (error.response || error.message === 'INVALID_ZALO_TOKEN') {
      throw new Error('INVALID_ZALO_TOKEN');
    }
    throw error;
  }
};
