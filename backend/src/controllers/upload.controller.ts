// src/controllers/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { uploadImages } from '../services/upload.service';

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    const purpose = String(req.query.purpose || req.body?.purpose || '');
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE', message: 'Vui long dinh kem file anh' }
      });
    }

    if (purpose === 'event' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Ban khong co quyen tai anh su kien' }
      });
    }

    const urls = await uploadImages(files, purpose === 'event'
      ? { folder: 'tung-thien/events', maxFiles: 10 }
      : { folder: 'tung-thien/feedbacks', maxFiles: 3 });

    res.status(200).json({
      success: true,
      data: { urls }
    });
  } catch (error: any) {
    if (error.message.includes('toi da') || error.message.includes('vuot qua') || error.message.includes('dinh dang')) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE', message: error.message }
      });
    }
    next(error);
  }
};
