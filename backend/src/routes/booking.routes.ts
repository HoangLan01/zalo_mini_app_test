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
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Sai dinh dang YYYY-MM-DD'),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Sai dinh dang HH:mm'),
  description: z.string().min(10, 'Noi dung toi thieu 10 ky tu').max(500, 'Noi dung toi da 500 ky tu'),
  contactName: z.string().min(2, 'Ten nguoi lien he toi thieu 2 ky tu').max(100, 'Ten nguoi lien he toi da 100 ky tu'),
  contactPhone: z.string().regex(/^\d{10,11}$/, 'So dien thoai khong hop le')
});

router.use(authenticateToken);

router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/me', bookingController.getMyBookings);
router.delete('/:id', bookingController.cancelBooking);

export default router;
