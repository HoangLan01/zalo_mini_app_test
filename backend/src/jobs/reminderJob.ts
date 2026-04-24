// src/jobs/reminderJob.ts
import cron from 'node-cron';
import { prisma } from '../server';
import { sendBookingReminder } from '../services/zns.service';
import logger from '../utils/logger';

export const startReminderJob = () => {
  // Chạy mỗi 30 phút
  cron.schedule('*/30 * * * *', async () => {
    logger.info('Running cron job: reminderJob');
    try {
      const now = new Date();
      const nowPlus25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
      const nowPlus90m = new Date(now.getTime() + 90 * 60 * 1000);
      const nowMinus1h = new Date(now.getTime() - 60 * 60 * 1000);

      // 1. Nhắc lịch 24h
      const bookings24h = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          reminder24hSent: false,
          confirmedDate: {
            gte: now,
            lt: nowPlus25h
          }
        },
        include: { user: true }
      });

      for (const booking of bookings24h) {
        if (booking.user.phoneToken) {
          await sendBookingReminder(booking.user.phoneToken, booking, '24h');
          await prisma.booking.update({ where: { id: booking.id }, data: { reminder24hSent: true } });
        }
      }

      // 2. Nhắc lịch 1h
      const bookings1h = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          reminder1hSent: false,
          confirmedDate: {
            gte: now,
            lt: nowPlus90m
          }
        },
        include: { user: true }
      });

      for (const booking of bookings1h) {
        if (booking.user.phoneToken) {
          await sendBookingReminder(booking.user.phoneToken, booking, '1h');
          await prisma.booking.update({ where: { id: booking.id }, data: { reminder1hSent: true } });
        }
      }

      // 3. Auto-complete
      await prisma.booking.updateMany({
        where: {
          status: 'CONFIRMED',
          confirmedDate: {
            lt: nowMinus1h
          }
        },
        data: { status: 'COMPLETED' }
      });

    } catch (error) {
      logger.error('Error in reminderJob:', error);
    }
  });
};
