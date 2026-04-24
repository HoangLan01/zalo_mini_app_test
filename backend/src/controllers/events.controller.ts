// src/controllers/events.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as eventsService from '../services/events.service';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as 'upcoming' | 'ongoing' | 'past' | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await eventsService.getAllEvents({ status, page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await eventsService.getEventById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sự kiện' } });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
