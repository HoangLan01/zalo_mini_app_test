import { Prisma } from '@prisma/client';
import { prisma } from '../server';

export type AuditContext = {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
};

export const writeAuditLog = async (
  context: AuditContext,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Prisma.InputJsonValue
) => prisma.adminAuditLog.create({
  data: {
    actorId: context.actorId,
    action,
    entityType,
    entityId: entityId || null,
    metadata,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  }
});

export const listAuditLogs = async (query: {
  page?: string;
  limit?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const where: Prisma.AdminAuditLogWhereInput = {
    ...(query.action ? { action: { contains: query.action, mode: 'insensitive' } } : {}),
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.actorId ? { actorId: query.actorId } : {})
  };
  const [items, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      include: { actor: { select: { id: true, displayName: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.adminAuditLog.count({ where })
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
