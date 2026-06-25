import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination
  });
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number,
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  });
};
