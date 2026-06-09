import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { authenticateAdmin, requireAdmin } from '../middleware/auth.middleware';
import { verifyAdminOrigin } from '../middleware/csrf.middleware';
import { auditAdminMutation } from '../middleware/adminAudit.middleware';
import * as quizController from '../controllers/quiz.controller';

const router = Router();

const optionSchema = z.object({
  content: z.string().min(1),
  order: z.number().int().min(0).optional(),
  isCorrect: z.boolean()
});

const topicCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional()
});

const topicUpdateSchema = topicCreateSchema.partial();

const setCreateSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  timeLimit: z.number().int().min(30),
  order: z.number().int().optional()
});

const setUpdateSchema = setCreateSchema.partial();

const questionCreateSchema = z.object({
  quizSetId: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']).default('MULTIPLE_CHOICE'),
  points: z.number().int().min(1).default(10),
  order: z.number().int().optional(),
  explanation: z.string().optional(),
  options: z.array(optionSchema).min(2)
});

const questionUpdateSchema = questionCreateSchema.omit({ quizSetId: true }).partial();

router.use(authenticateAdmin, requireAdmin, verifyAdminOrigin, auditAdminMutation);

router.get('/dashboard', quizController.getDashboardStats);

router.get('/topics', quizController.getAdminTopics);
router.post('/topics', validate(topicCreateSchema), quizController.createTopic);
router.patch('/topics/:id', validate(topicUpdateSchema), quizController.updateTopic);
router.delete('/topics/:id', quizController.archiveTopic);

router.get('/sets', quizController.getAdminSets);
router.post('/sets', validate(setCreateSchema), quizController.createSet);
router.patch('/sets/:id', validate(setUpdateSchema), quizController.updateSet);
router.delete('/sets/:id', quizController.archiveSet);
router.post('/sets/:id/publish', quizController.publishSet);
router.post('/sets/:id/close', quizController.closeSet);
router.post('/sets/:id/clone', quizController.cloneSet);
router.get('/sets/:id/stats', quizController.getSetStats);
router.post('/sets/:id/questions/batch', quizController.batchSaveQuestions);

router.get('/questions', quizController.getAdminQuestions);
router.post('/questions', validate(questionCreateSchema), quizController.createQuestion);
router.patch('/questions/:id', validate(questionUpdateSchema), quizController.updateQuestion);
router.delete('/questions/:id', quizController.archiveQuestion);

export default router;
