import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import logger, { sanitizeUrlForLogging } from '../utils/logger';
import { sendError } from '../utils/apiResponse';
import { isAppError } from '../utils/appError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${sanitizeUrlForLogging(req.originalUrl)} - ${err.message}`, { stack: err.stack });

  if (isAppError(err)) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  if (err.name === 'ZodError') {
    return sendError(res, 'VALIDATION_ERROR', 'Dữ liệu đầu vào không hợp lệ', 400);
  }

  if (err instanceof multer.MulterError) {
    return sendError(res, 'INVALID_FILE', 'Tệp tải lên không hợp lệ', 400);
  }

  if (err.message === 'NOT_FOUND') {
    return sendError(res, 'NOT_FOUND', 'Không tìm thấy tài nguyên', 404);
  }

  const message = process.env.NODE_ENV === 'production'
    ? 'Đã xảy ra lỗi hệ thống.'
    : err.message;

  return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
};
