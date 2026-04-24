// src/controllers/news.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as newsService from '../services/news.service';

export const getNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    const featured = req.query.featured as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await newsService.getAllNews({ category, featured, page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getNewsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await newsService.getNewsById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
