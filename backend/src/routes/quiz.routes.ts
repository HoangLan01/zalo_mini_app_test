import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as quizController from '../controllers/quiz.controller';

const router = Router();

const submitAttemptSchema = z.object({
  timeTaken: z.number().int().min(0),
  expired: z.boolean().optional(),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    selectedOptionId: z.string().min(1).nullable().optional()
  }))
});

router.use(authenticateToken);

router.get('/topics', quizController.getTopics);
router.get('/topics/:topicId/sets', quizController.getSetsByTopic);
router.get('/sets/:setId', quizController.getSet);
router.post('/sets/:setId/attempts/start', quizController.startAttempt);
router.post('/attempts/:attemptId/submit', validate(submitAttemptSchema), quizController.submitAttempt);
router.get('/sets/:setId/result', quizController.getResult);
router.get('/sets/:setId/leaderboard', quizController.getLeaderboard);

export default router;
