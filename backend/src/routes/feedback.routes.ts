import { Router } from 'express';
import { z } from 'zod';
import { FeedbackCategory, FeedbackStatus, FeedbackType } from '@prisma/client';
import { feedbackCreateIpRateLimiter, feedbackCreateRateLimiter } from '../middleware/rateLimit.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as feedbackController from '../controllers/feedback.controller';

const router = Router();

const createFieldFeedbackSchema = z.object({
  type: z.literal(FeedbackType.FIELD).optional().default(FeedbackType.FIELD),
  title: z.string().min(10).max(100),
  category: z.nativeEnum(FeedbackCategory),
  contactPhone: z.string().regex(/^\d{10,11}$/),
  description: z.string().min(20).max(1000),
  imageUrls: z.array(z.string().url()).max(3).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().max(200).optional()
}).strict();

const createServiceAttitudeFeedbackSchema = z.object({
  type: z.literal(FeedbackType.SERVICE_ATTITUDE),
  serviceUnit: z.string().min(1).max(255),
  satisfactionScore: z.number().int().min(1).max(5),
  contactPhone: z.string().regex(/^\d{10,11}$/),
  description: z.string().min(1).max(1000)
}).strict();

const createFeedbackSchema = z.union([createServiceAttitudeFeedbackSchema, createFieldFeedbackSchema]);
const feedbackQuerySchema = z.object({
  status: z.nativeEnum(FeedbackStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10)
}).strict();
const feedbackIdParamsSchema = z.object({
  id: z.string().uuid('ID phan anh khong hop le')
}).strict();

router.use(authenticateToken);

router.post('/', feedbackCreateIpRateLimiter, feedbackCreateRateLimiter, validate(createFeedbackSchema), feedbackController.createFeedback);
router.get('/me', validateQuery(feedbackQuerySchema), feedbackController.getMyFeedbacks);
router.get('/:id', validateParams(feedbackIdParamsSchema), feedbackController.getFeedbackDetails);

export default router;
