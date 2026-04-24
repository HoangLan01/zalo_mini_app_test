// src/routes/booking.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as bookingController from '../controllers/booking.controller';
import { BookingField } from '@prisma/client';

const router = Router();

const createBookingSchema = z.object({
  field: z.nativeEnum(BookingField),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Sai định dạng YYYY-MM-DD'),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Sai định dạng HH:mm'),
  description: z.string().min(10, 'Nội dung tối thiểu 10 ký tự').max(500, 'Nội dung tối đa 500 ký tự'),
  contactName: z.string().min(2, 'Tên người liên hệ tối thiểu 2 ký tự').max(100, 'Tên người liên hệ tối đa 100 ký tự')
});

router.use(authenticateToken);

router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/me', bookingController.getMyBookings);
router.delete('/:id', bookingController.cancelBooking);

export default router;
