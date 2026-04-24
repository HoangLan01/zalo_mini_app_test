// src/routes/feedback.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as feedbackController from '../controllers/feedback.controller';
import { FeedbackCategory } from '@prisma/client';

const router = Router();

const createFeedbackSchema = z.object({
  title: z.string().min(10, 'Tiêu đề tối thiểu 10 ký tự').max(100, 'Tiêu đề tối đa 100 ký tự'),
  category: z.nativeEnum(FeedbackCategory),
  description: z.string().min(20, 'Nội dung tối thiểu 20 ký tự').max(1000, 'Nội dung tối đa 1000 ký tự'),
  imageUrls: z.array(z.string().url()).max(3, 'Tối đa 3 ảnh').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().max(200).optional()
});

router.use(authenticateToken);

router.post('/', validate(createFeedbackSchema), feedbackController.createFeedback);
router.get('/me', feedbackController.getMyFeedbacks);
router.get('/:id', feedbackController.getFeedbackDetails);

export default router;
