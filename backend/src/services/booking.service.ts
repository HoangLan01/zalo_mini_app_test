import { BookingField, BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../server';
import { generateBookingCode, getNextSequence } from '../utils/generateCode';
import { sendBookingConfirmed, sendBookingReceived, sendBookingRejected } from './zns.service';
import { sendBookingAdminAlert } from './zaloOA.service';

interface CreateBookingInput {
  field: BookingField;
  preferredDate: string;
  preferredTime: string;
  description: string;
  contactName: string;
  contactPhone: string;
}

interface AdminBookingQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
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
  const bookingData = {
    userId,
    code,
    field: data.field,
    preferredDate: parsePreferredDate(data.preferredDate),
    preferredTime: data.preferredTime,
    description: data.description,
    contactName: data.contactName,
    contactPhone: data.contactPhone.trim()
  } as Prisma.BookingUncheckedCreateInput & { contactPhone: string };

  const booking = await prisma.booking.create({
    data: bookingData,
    include: { user: true }
  });

  sendBookingReceived(booking.user.phoneToken || null, booking).catch();
  sendBookingAdminAlert(booking, booking.user).then(oaMessageId => {
    if (oaMessageId) {
      prisma.booking.update({ where: { id: booking.id }, data: { oaMessageId } }).catch();
    }
  }).catch();

  return booking;
};

const getPagination = (query: AdminBookingQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

export const getAdminBookings = async (query: AdminBookingQuery) => {
  const { page, limit, skip } = getPagination(query);
  const where: Prisma.BookingWhereInput = {
    ...(query.status && query.status !== 'ALL' ? { status: query.status as BookingStatus } : {}),
    ...(query.search ? {
      OR: [
        { code: { contains: query.search, mode: 'insensitive' } },
        { contactName: { contains: query.search, mode: 'insensitive' } },
        { contactPhone: { contains: query.search, mode: 'insensitive' } } as Prisma.BookingWhereInput,
        { description: { contains: query.search, mode: 'insensitive' } },
        { user: { displayName: { contains: query.search, mode: 'insensitive' } } }
      ]
    } : {})
  };

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { user: { select: { id: true, displayName: true, avatarUrl: true, zaloId: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.booking.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAdminBookingSummary = async () => {
  const grouped = await prisma.booking.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const byStatus = grouped.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
  return { total, pendingCount: byStatus.PENDING || 0, byStatus };
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

const parseStatusDate = (value?: string | Date) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) throw new Error('INVALID_DATE');
  return new Date(Date.UTC(year, month - 1, day));
};

export const updateBookingStatusByAdmin = async (
  id: string,
  data: {
    status: BookingStatus;
    confirmedDate?: string | Date;
    confirmedTime?: string;
    rejectionReason?: string;
    rescheduledNote?: string;
  }
) => {
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) throw new Error('NOT_FOUND');

  if ((data.status === 'CONFIRMED' || data.status === 'RESCHEDULED') && (!data.confirmedDate || !data.confirmedTime)) {
    throw new Error('MISSING_CONFIRMATION');
  }
  if (data.status === 'REJECTED' && !data.rejectionReason?.trim()) {
    throw new Error('MISSING_REJECTION_REASON');
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status: data.status,
      confirmedDate: data.status === 'CONFIRMED' || data.status === 'RESCHEDULED' ? parseStatusDate(data.confirmedDate) : undefined,
      confirmedTime: data.status === 'CONFIRMED' || data.status === 'RESCHEDULED' ? data.confirmedTime : undefined,
      rejectionReason: data.status === 'REJECTED' ? data.rejectionReason?.trim() : undefined,
      rescheduledNote: data.status === 'RESCHEDULED' ? data.rescheduledNote?.trim() || null : undefined
    },
    include: { user: true }
  });

  if (data.status === 'CONFIRMED' || data.status === 'RESCHEDULED') {
    sendBookingConfirmed(booking.user.phoneToken || null, booking).catch();
  }
  if (data.status === 'REJECTED') {
    sendBookingRejected(booking.user.phoneToken || null, booking).catch();
  }

  return booking;
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
