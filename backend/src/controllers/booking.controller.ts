import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';
import { sendPaginated, sendSuccess } from '../utils/apiResponse';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const booking = await bookingService.createBooking(userId, req.body);
    return sendSuccess(res, booking, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const result = await bookingService.getBookingsByUser(userId, page, limit);
    return sendPaginated(res, result.data, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const bookingId = req.params.id;

    await bookingService.cancelBooking(bookingId, userId);
    return sendSuccess(res, { message: 'Đã hủy lịch hẹn thành công' });
  } catch (error) {
    next(error);
  }
};

export const getAdminBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await bookingService.getAdminBookings(req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getAdminBookingSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await bookingService.getAdminBookingSummary();
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatusByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await bookingService.updateBookingStatusByAdmin(req.params.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
