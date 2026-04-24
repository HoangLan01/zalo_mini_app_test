// src/routes/news.routes.ts
import { Router } from 'express';
import * as newsController from '../controllers/news.controller';

const router = Router();

router.get('/', newsController.getNews);
router.get('/:id', newsController.getNewsById);

export default router;
