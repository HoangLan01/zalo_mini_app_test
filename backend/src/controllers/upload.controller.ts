// src/controllers/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { uploadImages } from '../services/upload.service';

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE', message: 'Vui lòng đính kèm file ảnh' }
      });
    }

    const urls = await uploadImages(files);

    res.status(200).json({
      success: true,
      data: { urls }
    });
  } catch (error: any) {
    if (error.message.includes('tối đa') || error.message.includes('vượt quá') || error.message.includes('định dạng')) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE', message: error.message }
      });
    }
    next(error);
  }
};
