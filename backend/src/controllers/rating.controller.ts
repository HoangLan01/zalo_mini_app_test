// src/controllers/rating.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as ratingService from '../services/rating.service';

export const createRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const rating = await ratingService.createRating(userId, req.body);
    res.status(201).json({ success: true, data: { id: rating.id, averageScore: rating.averageScore } });
  } catch (error) {
    next(error);
  }
};

export const getRatingSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await ratingService.getRatingSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
