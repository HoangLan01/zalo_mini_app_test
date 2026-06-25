import { Request, Response, NextFunction } from 'express';
import { uploadImages } from '../services/upload.service';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    const purpose = String(req.query.purpose || req.body?.purpose || '');

    if (!files || files.length === 0) {
      throw new AppError('INVALID_FILE', 'Vui lòng đính kèm ít nhất 1 file ảnh', 400);
    }

    if (purpose === 'event' && !['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role || '')) {
      throw new AppError('FORBIDDEN', 'Bạn không có quyền tải ảnh sự kiện', 403);
    }

    const urls = await uploadImages(
      files,
      purpose === 'event' ? { folder: 'tung-thien/events', maxFiles: 10 } : { folder: 'tung-thien/feedbacks', maxFiles: 3 }
    );

    return sendSuccess(res, { urls });
  } catch (error) {
    next(error);
  }
};
