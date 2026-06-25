import { Router } from 'express';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { authenticateAdmin, requireAdmin } from '../middleware/auth.middleware';
import { verifyAdminOrigin } from '../middleware/csrf.middleware';
import { auditAdminMutation } from '../middleware/adminAudit.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validate.middleware';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  confirmedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  confirmedTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  rejectionReason: z.string().min(1).max(500).optional(),
  rescheduledNote: z.string().max(500).optional()
}).strict();
const adminBookingQuerySchema = z.object({
  status: z.union([z.literal('ALL'), z.nativeEnum(BookingStatus)]).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
}).strict();
const bookingIdParamsSchema = z.object({
  id: z.string().uuid('ID lich hen khong hop le')
}).strict();

router.use(authenticateAdmin, requireAdmin, verifyAdminOrigin, auditAdminMutation);

router.get('/summary', bookingController.getAdminBookingSummary);
router.get('/', validateQuery(adminBookingQuerySchema), bookingController.getAdminBookings);
router.patch('/:id/status', validateParams(bookingIdParamsSchema), validate(updateBookingStatusSchema), bookingController.updateBookingStatusByAdmin);

export default router;
