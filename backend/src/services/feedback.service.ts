// src/services/feedback.service.ts
import { prisma } from '../server';
import { FeedbackCategory, FeedbackStatus, Feedback } from '@prisma/client';
import { generateFeedbackCode, getNextSequence } from '../utils/generateCode';
import { sendFeedbackToOA } from './zaloOA.service';
import { sendFeedbackReceived, sendFeedbackUpdated } from './zns.service';
import logger from '../utils/logger';

interface CreateFeedbackInput {
  title: string;
  category: FeedbackCategory;
  description: string;
  imageUrls: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
}

export const createFeedback = async (userId: string, data: CreateFeedbackInput) => {
  if (data.imageUrls && data.imageUrls.length > 3) {
    throw new Error('Chỉ được phép gửi tối đa 3 ảnh');
  }

  const currentYear = new Date().getUTCFullYear();
  const sequence = await getNextSequence(prisma, 'feedback', currentYear);
  const code = generateFeedbackCode(currentYear, sequence);

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
      address: data.address,
      status: 'PENDING'
    },
    include: { user: true }
  });

  // Async trigger notifications
  sendFeedbackToOA(feedback, feedback.user).then(oaMessageId => {
    if (oaMessageId) {
      prisma.feedback.update({
        where: { id: feedback.id },
        data: { oaMessageId }
      }).catch(err => logger.error('Failed to update oaMessageId:', err));
    }
  });
  
  sendFeedbackReceived(feedback.user.phoneToken, feedback);

  return feedback;
};

export const getFeedbacksByUser = async (userId: string, filters: { status?: FeedbackStatus, page: number, limit: number }) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = { userId };
  if (status) {
    whereClause.status = status;
  }

  const total = await prisma.feedback.count({ where: whereClause });
  const data = await prisma.feedback.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getFeedbackById = async (id: string, userId: string): Promise<Feedback | null> => {
  return prisma.feedback.findFirst({
    where: { id, userId }
  });
};

export const updateFeedbackFromWebhook = async (oaMessageId: string, newStatus: FeedbackStatus, responseText: string): Promise<void> => {
  const feedback = await prisma.feedback.findFirst({
    where: { oaMessageId },
    include: { user: true }
  });

  if (!feedback) {
    logger.warn(`Webhook update skipped: Feedback with oaMessageId ${oaMessageId} not found`);
    return;
  }

  const updated = await prisma.feedback.update({
    where: { id: feedback.id },
    data: {
      status: newStatus,
      response: responseText,
      respondedAt: new Date()
    }
  });

  await sendFeedbackUpdated(feedback.user.phoneToken, updated);
};
