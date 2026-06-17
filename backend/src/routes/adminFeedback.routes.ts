import { Router } from 'express';
import { z } from 'zod';
import { FeedbackStatus } from '@prisma/client';
import { authenticateAdmin, requireAdmin } from '../middleware/auth.middleware';
import { verifyAdminOrigin } from '../middleware/csrf.middleware';
import { auditAdminMutation } from '../middleware/adminAudit.middleware';
import { validate } from '../middleware/validate.middleware';
import * as feedbackController from '../controllers/feedback.controller';

const router = Router();

const updateFeedbackStatusSchema = z.object({
  status: z.enum([FeedbackStatus.PENDING, FeedbackStatus.PROCESSING, FeedbackStatus.RESOLVED]),
  response: z.string().max(1000).optional()
});

router.use(authenticateAdmin, requireAdmin, verifyAdminOrigin, auditAdminMutation);

router.get('/summary', feedbackController.getAdminFeedbackSummary);
router.get('/', feedbackController.getAdminFeedbacks);
router.patch('/:id/status', validate(updateFeedbackStatusSchema), feedbackController.updateFeedbackStatusByAdmin);

export default router;
