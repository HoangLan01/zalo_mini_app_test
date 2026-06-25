import { Router } from 'express';
import { z } from 'zod';
import { FeedbackStatus, FeedbackType } from '@prisma/client';
import { authenticateAdmin, requireAdmin } from '../middleware/auth.middleware';
import { verifyAdminOrigin } from '../middleware/csrf.middleware';
import { auditAdminMutation } from '../middleware/adminAudit.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validate.middleware';
import * as feedbackController from '../controllers/feedback.controller';

const router = Router();

const updateFeedbackStatusSchema = z.object({
  status: z.enum([FeedbackStatus.PENDING, FeedbackStatus.PROCESSING, FeedbackStatus.RESOLVED]),
  response: z.string().max(1000).optional()
}).strict();
const adminFeedbackQuerySchema = z.object({
  type: z.union([z.literal('ALL'), z.nativeEnum(FeedbackType)]).optional(),
  status: z.union([z.literal('ALL'), z.nativeEnum(FeedbackStatus)]).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
}).strict();
const feedbackIdParamsSchema = z.object({
  id: z.string().uuid('ID phan anh khong hop le')
}).strict();

router.use(authenticateAdmin, requireAdmin, verifyAdminOrigin, auditAdminMutation);

router.get('/summary', feedbackController.getAdminFeedbackSummary);
router.get('/', validateQuery(adminFeedbackQuerySchema), feedbackController.getAdminFeedbacks);
router.patch('/:id/status', validateParams(feedbackIdParamsSchema), validate(updateFeedbackStatusSchema), feedbackController.updateFeedbackStatusByAdmin);

export default router;
