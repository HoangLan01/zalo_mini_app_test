// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import logger from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import feedbackRoutes from './routes/feedback.routes';
import bookingRoutes from './routes/booking.routes';
import ratingRoutes from './routes/rating.routes';
import newsRoutes from './routes/news.routes';
import eventsRoutes from './routes/events.routes';
import heritageRoutes from './routes/heritage.routes';
import uploadRoutes from './routes/upload.routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

// 1. Webhook route phải dùng express.raw ĐỂ preserve raw body cho verify signature
app.use('/webhook/zalo', express.raw({ type: 'application/json' }), webhookRoutes);

// 2. HTTP Security Headers
app.use(helmet());

// 3. CORS
app.use(cors({ origin: process.env.APP_URL || '*' }));

// 4. Body Parser (cho các route khác)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 5. Rate Limiting
app.use(rateLimiter);

// 6. Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// 7. API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/heritage', heritageRoutes);
app.use('/api/upload', uploadRoutes);

// 8. 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Tài nguyên không tồn tại' }
  });
});

// 9. Global Error Handler
app.use(errorHandler);

export default app;
