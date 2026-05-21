import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import * as eventsController from '../controllers/events.controller';

const router = Router();

const eventBaseSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  category: z.enum(['VAN_HOA', 'THE_THAO', 'HANH_CHINH', 'LE_HOI', 'KHAC']).default('KHAC'),
  location: z.string().min(1).max(255),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  organizer: z.string().min(1).max(255),
  contactInfo: z.string().nullable().optional(),
  imageUrls: z.array(z.string().url()).default([]),
  thumbnailUrl: z.union([z.string().url(), z.literal('')]).default(''),
  order: z.number().int().min(0).optional()
});

router.use(authenticateToken, requireAdmin);

router.get('/', eventsController.getAdminEvents);
router.post('/', validate(eventBaseSchema), eventsController.createEvent);
router.patch('/:id', validate(eventBaseSchema.partial()), eventsController.updateEvent);
router.delete('/:id', eventsController.archiveEvent);
router.post('/:id/publish', eventsController.publishEvent);
router.post('/:id/close', eventsController.closeEvent);

export default router;
