// src/routes/events.routes.ts
import { Router } from 'express';
import * as eventsController from '../controllers/events.controller';

const router = Router();

router.get('/', eventsController.getEvents);
router.get('/:id', eventsController.getEventById);

export default router;
