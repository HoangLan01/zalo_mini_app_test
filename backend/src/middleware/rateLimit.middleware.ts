// src/middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 phút
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    error: { 
      code: 'RATE_LIMIT', 
      message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' 
    } 
  }
});
