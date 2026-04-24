// src/services/booking.service.ts
import { prisma } from '../server';
import { BookingField, BookingStatus, Booking } from '@prisma/client';
import { generateBookingCode, getNextSequence } from '../utils/generateCode';
import { sendBookingToOA } from './zaloOA.service';
import { sendBookingReceived, sendBookingConfirmed, sendBookingRejected, sendBookingReminder } from './zns.service';
import logger from '../utils/logger';

interface CreateBookingInput {
  field: BookingField;
  preferredDate: string;
  preferredTime: string;
  description: string;
  contactName: string;
}

export const createBooking = async (userId: string, data: CreateBookingInput) => {
  const prefDateObj = new Date(data.preferredDate);
  const now = new Date();
  
  if (prefDateObj.getTime() <= now.getTime()) {
    throw new Error('Ngày mong muốn phải lớn hơn ngày hiện tại');
  }
  
  const dayOfWeek = prefDateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    throw new Error('Ngày mong muốn không được rơi vào Thứ 7 hoặc Chủ nhật');
  }

  const currentYear = now.getUTCFullYear();
  const sequence = await getNextSequence(prisma, 'booking', currentYear);
  const code = generateBookingCode(currentYear, sequence);

  const booking = await prisma.booking.create({
    data: {
      userId,
      code,
      field: data.field,
      preferredDate: prefDateObj,
      preferredTime: data.preferredTime,
      description: data.description,
      contactName: data.contactName,
      status: 'PENDING'
    },
    include: { user: true }
  });

  // Async triggers
  sendBookingToOA(booking, booking.user).then(oaMessageId => {
    if (oaMessageId) {
      prisma.booking.update({
        where: { id: booking.id },
        data: { oaMessageId }
      }).catch(err => logger.error('Failed to update oaMessageId:', err));
    }
  });

  sendBookingReceived(booking.user.phoneToken, booking);

  return booking;
};

export const getBookingsByUser = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const total = await prisma.booking.count({ where: { userId } });
  const data = await prisma.booking.findMany({
    where: { userId },
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

export const cancelBooking = async (id: string, userId: string) => {
  const booking = await prisma.booking.findFirst({ where: { id, userId } });
  if (!booking) throw new Error('NOT_FOUND');

  if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
    throw new Error('Chỉ có thể hủy lịch khi đang chờ xác nhận hoặc đã xác nhận');
  }

  if (booking.status === 'CONFIRMED' && booking.confirmedDate) {
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const confirmedDateTime = new Date(booking.confirmedDate);
    const [h, m] = (booking.confirmedTime || '00:00').split(':');
    confirmedDateTime.setUTCHours(parseInt(h), parseInt(m), 0, 0);

    if (confirmedDateTime <= twoHoursFromNow) {
      throw new Error('Không thể hủy lịch khi chỉ còn chưa tới 2 giờ trước giờ hẹn');
    }
  }

  return prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' }
  });
};

export const processWebhookReply = async (oaMessageId: string, status: BookingStatus, dataUpdate: Partial<Booking>) => {
  const booking = await prisma.booking.findFirst({
    where: { oaMessageId },
    include: { user: true }
  });

  if (!booking) {
    logger.warn(`Booking Webhook update skipped: Booking with oaMessageId ${oaMessageId} not found`);
    return;
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status,
      ...dataUpdate
    }
  });

  if (status === 'CONFIRMED') {
    await sendBookingConfirmed(booking.user.phoneToken, updated);
  } else if (status === 'REJECTED') {
    await sendBookingRejected(booking.user.phoneToken, updated);
  }
};
