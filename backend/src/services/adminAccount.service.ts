import bcrypt from 'bcryptjs';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../server';
import { AuditContext, writeAuditLog } from './adminAudit.service';
import { generateTemporaryPassword } from '../utils/password';

const adminSelect = {
  id: true,
  displayName: true,
  email: true,
  role: true,
  status: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, displayName: true, email: true } }
} as const;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const ensureCanChangeRoleOrStatus = async (actorId: string, targetId: string, nextRole?: UserRole, nextStatus?: UserStatus) => {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target || !['ADMIN', 'SUPER_ADMIN'].includes(target.role)) throw new Error('NOT_FOUND');
  if (actorId === targetId && (nextRole === 'ADMIN' || nextStatus === 'DISABLED')) throw new Error('CANNOT_CHANGE_SELF_ACCESS');

  const removesActiveSuperAdmin =
    target.role === 'SUPER_ADMIN' &&
    target.status === 'ACTIVE' &&
    (nextRole === 'ADMIN' || nextStatus === 'DISABLED');
  if (removesActiveSuperAdmin) {
    const count = await prisma.user.count({ where: { role: 'SUPER_ADMIN', status: 'ACTIVE' } });
    if (count <= 1) throw new Error('LAST_ACTIVE_SUPER_ADMIN');
  }
  return target;
};

export const listAdminAccounts = async (query: { search?: string; role?: string; status?: string; page?: string; limit?: string }) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const where: Prisma.UserWhereInput = {
    role: query.role === 'ADMIN' || query.role === 'SUPER_ADMIN' ? query.role : { in: ['ADMIN', 'SUPER_ADMIN'] },
    ...(query.status === 'ACTIVE' || query.status === 'DISABLED' ? { status: query.status } : {}),
    ...(query.search ? {
      OR: [
        { displayName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } }
      ]
    } : {})
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, select: adminSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count({ where })
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const createAdminAccount = async (
  actorId: string,
  input: { email: string; displayName: string; role: 'ADMIN' | 'SUPER_ADMIN' },
  context: AuditContext
) => {
  const temporaryPassword = generateTemporaryPassword();
  const user = await prisma.user.create({
    data: {
      email: normalizeEmail(input.email),
      displayName: input.displayName.trim(),
      role: input.role,
      status: 'ACTIVE',
      passwordHash: await bcrypt.hash(temporaryPassword, 12),
      mustChangePassword: true,
      createdById: actorId
    },
    select: adminSelect
  });
  await writeAuditLog(context, 'ADMIN_ACCOUNT_CREATE', 'ADMIN_ACCOUNT', user.id, { email: user.email, role: user.role });
  return { user, temporaryPassword };
};

export const updateAdminAccount = async (
  actorId: string,
  targetId: string,
  input: { email?: string; displayName?: string; role?: 'ADMIN' | 'SUPER_ADMIN' },
  context: AuditContext
) => {
  const target = await ensureCanChangeRoleOrStatus(actorId, targetId, input.role);
  const roleChanged = input.role && input.role !== target.role;
  const user = await prisma.user.update({
    where: { id: targetId },
    data: {
      email: input.email ? normalizeEmail(input.email) : undefined,
      displayName: input.displayName?.trim(),
      role: input.role,
      sessionVersion: roleChanged ? { increment: 1 } : undefined
    },
    select: adminSelect
  });
  await writeAuditLog(context, 'ADMIN_ACCOUNT_UPDATE', 'ADMIN_ACCOUNT', user.id, {
    email: user.email,
    role: user.role,
    roleChanged: Boolean(roleChanged)
  });
  return user;
};

export const setAdminAccountStatus = async (
  actorId: string,
  targetId: string,
  status: 'ACTIVE' | 'DISABLED',
  context: AuditContext
) => {
  await ensureCanChangeRoleOrStatus(actorId, targetId, undefined, status);
  const user = await prisma.user.update({
    where: { id: targetId },
    data: { status, sessionVersion: { increment: 1 } },
    select: adminSelect
  });
  await writeAuditLog(context, status === 'ACTIVE' ? 'ADMIN_ACCOUNT_ENABLE' : 'ADMIN_ACCOUNT_DISABLE', 'ADMIN_ACCOUNT', user.id, { status });
  return user;
};

export const resetAdminPassword = async (targetId: string, context: AuditContext) => {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target || !['ADMIN', 'SUPER_ADMIN'].includes(target.role)) throw new Error('NOT_FOUND');
  const temporaryPassword = generateTemporaryPassword();
  await prisma.user.update({
    where: { id: targetId },
    data: {
      passwordHash: await bcrypt.hash(temporaryPassword, 12),
      mustChangePassword: true,
      sessionVersion: { increment: 1 }
    }
  });
  await writeAuditLog(context, 'ADMIN_ACCOUNT_RESET_PASSWORD', 'ADMIN_ACCOUNT', targetId, {});
  return { temporaryPassword };
};
