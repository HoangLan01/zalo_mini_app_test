import { Router } from 'express';
import { z } from 'zod';
import { BookingField } from '@prisma/client';
import { bookingCreateIpRateLimiter, bookingCreateRateLimiter } from '../middleware/rateLimit.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

const createBookingSchema = z.object({
  field: z.nativeEnum(BookingField),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/),
  description: z.string().min(10).max(500),
  contactName: z.string().min(2).max(100),
  contactPhone: z.string().regex(/^\d{10,11}$/)
}).strict();
const bookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10)
}).strict();
const bookingIdParamsSchema = z.object({
  id: z.string().uuid('ID lich hen khong hop le')
}).strict();

router.use(authenticateToken);

router.post('/', bookingCreateIpRateLimiter, bookingCreateRateLimiter, validate(createBookingSchema), bookingController.createBooking);
router.get('/me', validateQuery(bookingQuerySchema), bookingController.getMyBookings);
router.delete('/:id', validateParams(bookingIdParamsSchema), bookingController.cancelBooking);

export default router;
