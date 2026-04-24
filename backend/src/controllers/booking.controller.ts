// src/controllers/booking.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const booking = await bookingService.createBooking(userId, req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    if (error.message.includes('ngày hiện tại') || error.message.includes('Thứ 7')) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_DATE', message: error.message } });
    }
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);

    const result = await bookingService.getBookingsByUser(userId, page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const bookingId = req.params.id;

    await bookingService.cancelBooking(bookingId, userId);
    res.status(200).json({ success: true, data: { message: 'Đã hủy lịch hẹn thành công' } });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lịch hẹn' } });
    }
    if (error.message.includes('Chỉ có thể hủy') || error.message.includes('không thể hủy')) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: error.message } });
    }
    next(error);
  }
};
