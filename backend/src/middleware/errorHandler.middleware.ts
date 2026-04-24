// src/middleware/errorHandler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ApiError } from '../types';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method });

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu đầu vào không hợp lệ' }
    });
  }

  if (err.message === 'INVALID_ZALO_TOKEN') {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Xác thực Zalo thất bại' }
    });
  }

  if (err.message === 'NOT_FOUND') {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Không tìm thấy tài nguyên' }
    });
  }

  const message = process.env.NODE_ENV === 'production' 
    ? 'Đã xảy ra lỗi hệ thống.' 
    : err.message;

  const response: ApiError = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message
    }
  };

  res.status(500).json(response);
};
