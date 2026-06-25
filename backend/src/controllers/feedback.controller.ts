import { Request, Response, NextFunction } from 'express';
import * as feedbackService from '../services/feedback.service';
import { FeedbackStatus } from '@prisma/client';
import { sendPaginated, sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export const createFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const feedback = await feedbackService.createFeedback(userId, req.body);
    return sendSuccess(res, feedback, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const status = req.query.status as FeedbackStatus | undefined;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const result = await feedbackService.getFeedbacksByUser(userId, { status, page, limit });
    return sendPaginated(res, result.data, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getFeedbackDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const feedbackId = req.params.id;

    const feedback = await feedbackService.getFeedbackById(feedbackId, userId);
    if (!feedback) {
      throw new AppError('NOT_FOUND', 'Không tìm thấy phản ánh', 404);
    }

    return sendSuccess(res, feedback);
  } catch (error) {
    next(error);
  }
};

export const getAdminFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await feedbackService.getAdminFeedbacks(req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getAdminFeedbackSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await feedbackService.getAdminFeedbackSummary();
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateFeedbackStatusByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await feedbackService.updateFeedbackStatusByAdmin(req.params.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
