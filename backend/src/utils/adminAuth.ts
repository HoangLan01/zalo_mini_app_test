import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UserRole } from '@prisma/client';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_ROLES: UserRole[] = ['ADMIN', 'SUPER_ADMIN'];

export type AdminTokenPayload = {
  userId: string;
  role: UserRole;
  sessionVersion: number;
};

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('System configuration error: JWT_SECRET missing');
  return secret;
};

const getCookieMaxAge = () => {
  const value = process.env.ADMIN_JWT_EXPIRES_IN || '8h';
  const match = /^(\d+)(m|h|d)$/.exec(value);
  if (!match) return 8 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  return amount * ({ m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]] || 3_600_000);
};

const getCookieDomain = () => {
  const value = process.env.COOKIE_DOMAIN?.trim();
  return value || undefined;
};

const getAdminCookieSameSite = (): 'lax' | 'strict' | 'none' => {
  const value = (process.env.ADMIN_COOKIE_SAME_SITE || 'strict').trim().toLowerCase();
  if (value === 'lax' || value === 'strict' || value === 'none') return value;
  return 'strict';
};

export const signAdminToken = (payload: AdminTokenPayload) => jwt.sign(payload, getSecret(), {
  expiresIn: (process.env.ADMIN_JWT_EXPIRES_IN || '8h') as any
});

export const verifyAdminToken = (token: string) => jwt.verify(token, getSecret()) as AdminTokenPayload;

export const getCookieValue = (cookieHeader: string | undefined, name: string) => {
  const prefix = `${name}=`;
  const part = cookieHeader?.split(';').map(item => item.trim()).find(item => item.startsWith(prefix));
  return part ? decodeURIComponent(part.slice(prefix.length)) : undefined;
};

export const setAdminSessionCookie = (res: Response, token: string) => {
  res.cookie(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: getAdminCookieSameSite(),
    path: '/',
    domain: getCookieDomain(),
    maxAge: getCookieMaxAge()
  });
};

export const clearAdminSessionCookie = (res: Response) => {
  res.clearCookie(ADMIN_SESSION_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: getAdminCookieSameSite(),
    path: '/',
    domain: getCookieDomain()
  });
};
