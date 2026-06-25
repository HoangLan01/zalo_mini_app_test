import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.middleware';
import * as uploadController from '../controllers/upload.controller';
import { verifyAdminOrigin } from '../middleware/csrf.middleware';
import { ALLOWED_IMAGE_MIME_TYPES } from '../services/upload.service';
import { validateQuery } from '../middleware/validate.middleware';
import { AppError } from '../utils/appError';

const router = Router();

const uploadQuerySchema = z
  .object({
    purpose: z.enum(['event']).optional()
  })
  .strict();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as typeof ALLOWED_IMAGE_MIME_TYPES[number])) {
      cb(null, true);
    } else {
      cb(new AppError('INVALID_FILE', 'Chỉ chấp nhận file ảnh', 400));
    }
  }
});

router.post(
  '/',
  authenticateToken,
  validateQuery(uploadQuerySchema),
  (req, res, next) => (String(req.query.purpose || '') === 'event' ? verifyAdminOrigin(req, res, next) : next()),
  upload.array('files', 10),
  uploadController.upload
);

export default router;
