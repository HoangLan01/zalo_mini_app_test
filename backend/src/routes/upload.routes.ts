// src/routes/upload.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware';
import * as uploadController from '../controllers/upload.controller';
import { verifyAdminOrigin } from '../middleware/csrf.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'));
    }
  }
});

router.post(
  '/', 
  authenticateToken,
  (req, res, next) => String(req.query.purpose || '') === 'event' ? verifyAdminOrigin(req, res, next) : next(),
  upload.array('files', 10), 
  uploadController.upload
);

export default router;
