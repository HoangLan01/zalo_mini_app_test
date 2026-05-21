import rateLimit from 'express-rate-limit';

const parseEnvInt = (key: string, fallback: number) => {
  const value = Number.parseInt(process.env[key] || '', 10);
  return Number.isFinite(value) ? value : fallback;
};

const windowMs = parseEnvInt('RATE_LIMIT_WINDOW_MS', 900000);
const legacyMax = parseEnvInt('RATE_LIMIT_MAX_REQUESTS', 1000);

const createLimiter = (maxEnvKey: string, fallback: number) => rateLimit({
  windowMs,
  max: parseEnvInt(maxEnvKey, process.env.RATE_LIMIT_MAX_REQUESTS ? legacyMax : fallback),
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

export const globalRateLimiter = createLimiter('RATE_LIMIT_GLOBAL_MAX_REQUESTS', 1000);
export const authRateLimiter = createLimiter('RATE_LIMIT_AUTH_MAX_REQUESTS', 30);
export const adminQuizRateLimiter = createLimiter('RATE_LIMIT_ADMIN_QUIZ_MAX_REQUESTS', 500);
export const publicQuizRateLimiter = createLimiter('RATE_LIMIT_PUBLIC_QUIZ_MAX_REQUESTS', 500);

export const rateLimiter = globalRateLimiter;
