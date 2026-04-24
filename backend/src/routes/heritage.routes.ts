// src/routes/heritage.routes.ts
import { Router } from 'express';
import * as heritageController from '../controllers/heritage.controller';

const router = Router();

router.get('/', heritageController.getHeritage);
router.get('/:id', heritageController.getHeritageById);

export default router;
