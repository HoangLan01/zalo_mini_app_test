import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse';

const parseEnvInt = (key: string, fallback: number) => {
  const value = Number.parseInt(process.env[key] || '', 10);
  return Number.isFinite(value) ? value : fallback;
};

const windowMs = parseEnvInt('RATE_LIMIT_WINDOW_MS', 900000);
const legacyMax = parseEnvInt('RATE_LIMIT_MAX_REQUESTS', 1000);
const creationWindowMs = parseEnvInt('RATE_LIMIT_CREATION_WINDOW_MS', windowMs);

const getClientKey = (req: Request) => {
  const authorization = req.get('authorization');
  const secret = process.env.JWT_SECRET;
  if (secret && authorization?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authorization.slice(7), secret) as { userId?: string; role?: string };
      if (decoded.userId) return `user:${decoded.role || 'USER'}:${decoded.userId}`;
    } catch {
      // Invalid tokens share the IP quota and are rejected later by auth middleware.
    }
  }

  return `ip:${req.ip}`;
};

const getIpOnlyKey = (req: Request) => `ip:${req.ip}`;

const createLimiter = (
  maxEnvKey: string,
  fallback: number,
  options: { window?: number; keyGenerator?: (req: Request) => string } = {}
) => rateLimit({
  windowMs: options.window || windowMs,
  max: parseEnvInt(maxEnvKey, process.env.RATE_LIMIT_MAX_REQUESTS ? legacyMax : fallback),
  keyGenerator: options.keyGenerator || getClientKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => sendError(res, 'RATE_LIMIT', 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', 429)
});

export const globalRateLimiter = createLimiter('RATE_LIMIT_GLOBAL_MAX_REQUESTS', 1000);
export const globalIpRateLimiter = createLimiter('RATE_LIMIT_GLOBAL_IP_MAX_REQUESTS', 1500, {
  keyGenerator: getIpOnlyKey
});
export const authRateLimiter = createLimiter('RATE_LIMIT_AUTH_MAX_REQUESTS', 30);
export const adminQuizRateLimiter = createLimiter('RATE_LIMIT_ADMIN_QUIZ_MAX_REQUESTS', 500);
export const adminBookingRateLimiter = createLimiter('RATE_LIMIT_ADMIN_BOOKING_MAX_REQUESTS', 500);
export const publicQuizRateLimiter = createLimiter('RATE_LIMIT_PUBLIC_QUIZ_MAX_REQUESTS', 500);
export const feedbackCreateIpRateLimiter = createLimiter('RATE_LIMIT_FEEDBACK_CREATE_IP_MAX_REQUESTS', 10, {
  window: creationWindowMs,
  keyGenerator: getIpOnlyKey
});
export const feedbackCreateRateLimiter = createLimiter('RATE_LIMIT_FEEDBACK_CREATE_MAX_REQUESTS', 10, {
  window: creationWindowMs
});
export const bookingCreateIpRateLimiter = createLimiter('RATE_LIMIT_BOOKING_CREATE_IP_MAX_REQUESTS', 10, {
  window: creationWindowMs,
  keyGenerator: getIpOnlyKey
});
export const bookingCreateRateLimiter = createLimiter('RATE_LIMIT_BOOKING_CREATE_MAX_REQUESTS', 10, {
  window: creationWindowMs
});
export const ratingCreateIpRateLimiter = createLimiter('RATE_LIMIT_RATING_CREATE_IP_MAX_REQUESTS', 10, {
  window: creationWindowMs,
  keyGenerator: getIpOnlyKey
});
export const ratingCreateRateLimiter = createLimiter('RATE_LIMIT_RATING_CREATE_MAX_REQUESTS', 10, {
  window: creationWindowMs
});

export const rateLimiter = globalRateLimiter;
