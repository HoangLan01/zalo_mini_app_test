import { Router } from 'express';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  confirmedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  confirmedTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  rejectionReason: z.string().min(1).max(500).optional(),
  rescheduledNote: z.string().max(500).optional()
});

router.use(authenticateToken, requireAdmin);

router.get('/summary', bookingController.getAdminBookingSummary);
router.get('/', bookingController.getAdminBookings);
router.patch('/:id/status', validate(updateBookingStatusSchema), bookingController.updateBookingStatusByAdmin);

export default router;
