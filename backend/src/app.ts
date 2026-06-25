import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {
  adminBookingRateLimiter,
  adminQuizRateLimiter,
  authRateLimiter,
  globalIpRateLimiter,
  globalRateLimiter,
  publicQuizRateLimiter
} from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import logger, { sanitizeUrlForLogging } from './utils/logger';
import { sendError, sendSuccess } from './utils/apiResponse';

import authRoutes from './routes/auth.routes';
import feedbackRoutes from './routes/feedback.routes';
import bookingRoutes from './routes/booking.routes';
import ratingRoutes from './routes/rating.routes';
import uploadRoutes from './routes/upload.routes';
import webhookRoutes from './routes/webhook.routes';
import quizRoutes from './routes/quiz.routes';
import adminQuizRoutes from './routes/adminQuiz.routes';
import eventsRoutes from './routes/events.routes';
import adminEventsRoutes from './routes/adminEvents.routes';
import adminBookingRoutes from './routes/adminBooking.routes';
import adminFeedbackRoutes from './routes/adminFeedback.routes';
import adminAccountRoutes from './routes/adminAccount.routes';

const app = express();
const isDevelopment = process.env.NODE_ENV === 'development';
const allowedOrigins = [process.env.APP_URL, process.env.ADMIN_APP_URL]
  .flatMap(value => (value || '').split(','))
  .map(value => value.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use('/webhook/zalo', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      objectSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
  next();
});

if (isDevelopment) {
  logger.warn('CORS is running in open development mode.');
} else if (allowedOrigins.length === 0) {
  logger.warn('No CORS origins configured. Browser cross-origin requests will be rejected.');
}

app.use(cors({
  origin: (origin, callback) => {
    if (isDevelopment) return callback(null, true);
    if (!origin) return callback(null, true);
    return callback(null, allowedOrigins.includes(origin));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${sanitizeUrlForLogging(req.originalUrl)} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use('/api', globalIpRateLimiter, globalRateLimiter);

app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/quiz', publicQuizRateLimiter, quizRoutes);
app.use('/api/events', publicQuizRateLimiter, eventsRoutes);
app.use('/api/admin/quiz', adminQuizRateLimiter, adminQuizRoutes);
app.use('/api/admin/events', adminQuizRateLimiter, adminEventsRoutes);
app.use('/api/admin/bookings', adminBookingRateLimiter, adminBookingRoutes);
app.use('/api/admin/feedbacks', adminBookingRateLimiter, adminFeedbackRoutes);
app.use('/api/admin', adminQuizRateLimiter, adminAccountRoutes);

app.use((req, res) => {
  return sendError(res, 'NOT_FOUND', 'Tài nguyên không tồn tại', 404);
});

app.use(errorHandler);

export default app;
