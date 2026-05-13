import { BookingField, BookingStatus } from '@prisma/client';
import { prisma } from '../server';
import { generateBookingCode, getNextSequence } from '../utils/generateCode';
import { sendBookingConfirmed, sendBookingReceived, sendBookingRejected } from './zns.service';
import { sendBookingToOA } from './zaloOA.service';

interface CreateBookingInput {
  field: BookingField;
  preferredDate: string;
  preferredTime: string;
  description: string;
  contactName: string;
}

const parsePreferredDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  if (date < todayUtc) throw new Error('Không thể đặt lịch trước ngày hiện tại');
  if (date.getUTCDay() === 6 || date.getUTCDay() === 0) throw new Error('Không thể đặt lịch vào Thứ 7 hoặc Chủ nhật');
  return date;
};

export const createBooking = async (userId: string, data: CreateBookingInput) => {
  const year = new Date().getFullYear();
  const code = generateBookingCode(year, await getNextSequence(prisma, 'booking', year));

  const booking = await prisma.booking.create({
    data: {
      userId,
      code,
      field: data.field,
      preferredDate: parsePreferredDate(data.preferredDate),
      preferredTime: data.preferredTime,
      description: data.description,
      contactName: data.contactName
    },
    include: { user: true }
  });

  sendBookingReceived(booking.user.phoneToken || null, booking).catch();
  sendBookingToOA(booking, booking.user).then(oaMessageId => {
    if (oaMessageId) {
      prisma.booking.update({ where: { id: booking.id }, data: { oaMessageId } }).catch();
    }
  }).catch();

  return booking;
};

export const getBookingsByUser = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.booking.count({ where: { userId } })
  ]);

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
  if (!['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(booking.status)) {
    throw new Error('Lịch hẹn này không thể hủy');
  }

  return prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
};

export const processWebhookReply = async (
  oaMessageId: string,
  status: BookingStatus,
  data: { confirmedDate?: Date; confirmedTime?: string; rejectionReason?: string; rescheduledNote?: string }
) => {
  const existing = await prisma.booking.findFirst({ where: { oaMessageId } });
  if (!existing) throw new Error('NOT_FOUND');

  const booking = await prisma.booking.update({
    where: { id: existing.id },
    data: {
      status,
      confirmedDate: data.confirmedDate,
      confirmedTime: data.confirmedTime,
      rejectionReason: data.rejectionReason,
      rescheduledNote: data.rescheduledNote
    },
    include: { user: true }
  });

  if (status === 'CONFIRMED' || status === 'RESCHEDULED') {
    sendBookingConfirmed(booking.user.phoneToken || null, booking).catch();
  }
  if (status === 'REJECTED') {
    sendBookingRejected(booking.user.phoneToken || null, booking).catch();
  }

  return booking;
};
