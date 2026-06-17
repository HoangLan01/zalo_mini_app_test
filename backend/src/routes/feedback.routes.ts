// src/routes/feedback.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { FeedbackCategory, FeedbackType } from '@prisma/client';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as feedbackController from '../controllers/feedback.controller';

const router = Router();

const createFieldFeedbackSchema = z.object({
  type: z.literal(FeedbackType.FIELD).optional().default(FeedbackType.FIELD),
  title: z.string().min(10, 'Tiêu đề tối thiểu 10 ký tự').max(100, 'Tiêu đề tối đa 100 ký tự'),
  category: z.nativeEnum(FeedbackCategory),
  contactPhone: z.string().regex(/^\d{10,11}$/, 'Số điện thoại không hợp lệ'),
  description: z.string().min(20, 'Nội dung tối thiểu 20 ký tự').max(1000, 'Nội dung tối đa 1000 ký tự'),
  imageUrls: z.array(z.string().url()).max(3, 'Tối đa 3 ảnh').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().max(200).optional()
});

const createServiceAttitudeFeedbackSchema = z.object({
  type: z.literal(FeedbackType.SERVICE_ATTITUDE),
  serviceUnit: z.string().min(1, 'Vui lòng nhập đơn vị').max(255, 'Đơn vị tối đa 255 ký tự'),
  satisfactionScore: z.number().int().min(1, 'Số sao từ 1-5').max(5, 'Số sao từ 1-5'),
  contactPhone: z.string().regex(/^\d{10,11}$/, 'Số điện thoại không hợp lệ'),
  description: z.string().min(1, 'Vui lòng nhập nội dung').max(1000, 'Nội dung tối đa 1000 ký tự')
});

const createFeedbackSchema = z.union([createServiceAttitudeFeedbackSchema, createFieldFeedbackSchema]);

router.use(authenticateToken);

router.post('/', validate(createFeedbackSchema), feedbackController.createFeedback);
router.get('/me', feedbackController.getMyFeedbacks);
router.get('/:id', feedbackController.getFeedbackDetails);

export default router;
