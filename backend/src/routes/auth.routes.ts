import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

const loginSchema = z.object({
  accessToken: z.string().min(1, 'accessToken không được để trống')
});

const adminLoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống')
});

router.post('/login', validate(loginSchema), authController.login);
router.post('/dev-login', authController.devLogin);
router.post('/admin/login', validate(adminLoginSchema), authController.adminLogin);
router.get('/me', authenticateToken, authController.getMe);

export default router;
