import { FeedbackCategory, FeedbackStatus, FeedbackType, Prisma } from '@prisma/client';
import { prisma } from '../server';
import { generateFeedbackCode, getNextSequence } from '../utils/generateCode';
import { sendFeedbackReceived, sendFeedbackUpdated } from './zns.service';
import { sendFeedbackAdminAlert } from './zaloOA.service';

interface CreateFeedbackInput {
  type?: FeedbackType;
  title?: string;
  category?: FeedbackCategory;
  serviceUnit?: string;
  satisfactionScore?: number;
  contactPhone?: string;
  description: string;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface AdminFeedbackQuery {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

type FeedbackCreateData = {
  type: FeedbackType;
  title: string;
  category: FeedbackCategory;
  serviceUnit?: string;
  satisfactionScore?: number;
  contactPhone: string;
  description: string;
  imageUrls: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
};

const getPagination = (query: AdminFeedbackQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

const normalizeCreateData = (data: CreateFeedbackInput): FeedbackCreateData => {
  const type = data.type || 'FIELD';
  const description = data.description?.trim();
  const contactPhone = data.contactPhone?.trim();

  if (!contactPhone || !/^\d{10,11}$/.test(contactPhone)) {
    throw new Error('INVALID_CONTACT_PHONE');
  }

  if (type === 'SERVICE_ATTITUDE') {
    const serviceUnit = data.serviceUnit?.trim();
    if (!serviceUnit) throw new Error('MISSING_SERVICE_UNIT');
    if (!data.satisfactionScore || data.satisfactionScore < 1 || data.satisfactionScore > 5) {
      throw new Error('INVALID_SATISFACTION_SCORE');
    }
    if (!description) throw new Error('MISSING_DESCRIPTION');

    return {
      type,
      title: `Phản ánh thái độ phục vụ - ${serviceUnit}`.slice(0, 100),
      category: 'KHAC',
      serviceUnit,
      satisfactionScore: data.satisfactionScore,
      contactPhone,
      description,
      imageUrls: []
    };
  }

  if (!data.title?.trim()) throw new Error('MISSING_TITLE');
  if (!data.category) throw new Error('MISSING_CATEGORY');
  if (!description) throw new Error('MISSING_DESCRIPTION');
  if ((data.imageUrls || []).length > 3) throw new Error('TOO_MANY_IMAGES');

  return {
    type: 'FIELD',
    title: data.title.trim(),
    category: data.category,
    contactPhone,
    description,
    imageUrls: data.imageUrls || [],
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address?.trim() || undefined
  };
};

export const createFeedback = async (userId: string, data: CreateFeedbackInput) => {
  const year = new Date().getFullYear();
  const code = generateFeedbackCode(year, await getNextSequence(prisma, 'feedback', year));
  const feedbackData = normalizeCreateData(data);

  const feedback = await prisma.feedback.create({
    data: {
      userId,
      code,
      ...feedbackData
    },
    include: { user: true }
  });

  sendFeedbackReceived(feedback.user.phoneToken || null, feedback).catch();
  sendFeedbackAdminAlert(feedback, feedback.user).then(oaMessageId => {
    if (oaMessageId) {
      prisma.feedback.update({ where: { id: feedback.id }, data: { oaMessageId } }).catch();
    }
  }).catch();

  return feedback;
};

export const getFeedbacksByUser = async (
  userId: string,
  filters: { status?: FeedbackStatus; page: number; limit: number }
) => {
  const where = { userId, ...(filters.status ? { status: filters.status } : {}) };
  const skip = (filters.page - 1) * filters.limit;
  const [data, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.limit
    }),
    prisma.feedback.count({ where })
  ]);

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const getFeedbackById = async (id: string, userId: string) => {
  return prisma.feedback.findFirst({ where: { id, userId } });
};

export const getAdminFeedbacks = async (query: AdminFeedbackQuery) => {
  const { page, limit, skip } = getPagination(query);
  const search = query.search?.trim();
  const containsSearch = search
    ? { contains: search, mode: Prisma.QueryMode.insensitive }
    : undefined;

  const searchFilters: Prisma.FeedbackWhereInput[] = containsSearch ? [
    { code: containsSearch },
    { title: containsSearch },
    { description: containsSearch },
    { contactPhone: containsSearch } as unknown as Prisma.FeedbackWhereInput,
    { serviceUnit: containsSearch },
    { user: { displayName: containsSearch } }
  ] : [];

  const where: Prisma.FeedbackWhereInput = {
    ...(query.type && query.type !== 'ALL' ? { type: query.type as FeedbackType } : {}),
    ...(query.status && query.status !== 'ALL' ? { status: query.status as FeedbackStatus } : {}),
    ...(searchFilters.length > 0 ? { OR: searchFilters } : {})
  };

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: { user: { select: { id: true, displayName: true, avatarUrl: true, zaloId: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.feedback.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAdminFeedbackSummary = async () => {
  const [byStatusGrouped, byTypeGrouped] = await Promise.all([
    prisma.feedback.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.feedback.groupBy({ by: ['type'], _count: { type: true } })
  ]);

  const byStatus = byStatusGrouped.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});
  const byType = byTypeGrouped.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = item._count.type;
    return acc;
  }, {});

  const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
  return { total, pendingCount: byStatus.PENDING || 0, byStatus, byType };
};

export const updateFeedbackStatusByAdmin = async (
  id: string,
  data: { status: FeedbackStatus; response?: string }
) => {
  const existing = await prisma.feedback.findUnique({ where: { id } });
  if (!existing) throw new Error('NOT_FOUND');
  if (data.status === 'RESOLVED' && !data.response?.trim()) throw new Error('MISSING_RESPONSE');

  const feedback = await prisma.feedback.update({
    where: { id },
    data: {
      status: data.status,
      response: data.response?.trim() || (data.status === 'RESOLVED' ? existing.response : undefined),
      respondedAt: data.status === 'RESOLVED' ? new Date() : undefined
    },
    include: { user: true }
  });

  sendFeedbackUpdated(feedback.user.phoneToken || null, feedback).catch();
  return feedback;
};

export const updateFeedbackFromWebhook = async (oaMessageId: string, status: FeedbackStatus, response?: string) => {
  const existing = await prisma.feedback.findFirst({ where: { oaMessageId } });
  if (!existing) throw new Error('NOT_FOUND');

  const feedback = await prisma.feedback.update({
    where: { id: existing.id },
    data: {
      status,
      response,
      respondedAt: status === 'RESOLVED' ? new Date() : undefined
    },
    include: { user: true }
  });

  sendFeedbackUpdated(feedback.user.phoneToken || null, feedback).catch();
  return feedback;
};
