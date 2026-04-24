// src/routes/rating.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as ratingController from '../controllers/rating.controller';

const router = Router();

const createRatingSchema = z.object({
  procedure: z.string().min(2).max(100),
  attitudeScore: z.number().int().min(1).max(5),
  timelinessScore: z.number().int().min(1).max(5),
  outcomeScore: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional()
});

router.post('/', authenticateToken, validate(createRatingSchema), ratingController.createRating);
router.get('/summary', ratingController.getRatingSummary); // Public route

export default router;
