// src/controllers/feedback.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as feedbackService from '../services/feedback.service';
import { FeedbackStatus } from '@prisma/client';

export const createFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const feedback = await feedbackService.createFeedback(userId, req.body);
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

export const getMyFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const status = req.query.status as FeedbackStatus | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);

    const result = await feedbackService.getFeedbacksByUser(userId, { status, page, limit });
    res.status(200).json({ success: true, ...result });
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phản ánh' } });
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};
