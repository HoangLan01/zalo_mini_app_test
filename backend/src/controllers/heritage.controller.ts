// src/controllers/heritage.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as heritageService from '../services/heritage.service';

export const getHeritage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await heritageService.getAllHeritage({ search, page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getHeritageById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await heritageService.getHeritageById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy di tích' } });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
