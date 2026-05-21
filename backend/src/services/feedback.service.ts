import { FeedbackCategory, FeedbackStatus } from '@prisma/client';
import { prisma } from '../server';
import { generateFeedbackCode, getNextSequence } from '../utils/generateCode';
import { sendFeedbackReceived, sendFeedbackUpdated } from './zns.service';
import { sendFeedbackToOA } from './zaloOA.service';

interface CreateFeedbackInput {
  title: string;
  category: FeedbackCategory;
  description: string;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
}

export const createFeedback = async (userId: string, data: CreateFeedbackInput) => {
  const year = new Date().getFullYear();
  const code = generateFeedbackCode(year, await getNextSequence(prisma, 'feedback', year));

  const feedback = await prisma.feedback.create({
    data: {
      userId,
      code,
      title: data.title,
      category: data.category,
      description: data.description,
      imageUrls: data.imageUrls || [],
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address
    },
    include: { user: true }
  });

  sendFeedbackReceived(feedback.user.phoneToken || null, feedback).catch();
  sendFeedbackToOA(feedback, feedback.user).then(oaMessageId => {
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
