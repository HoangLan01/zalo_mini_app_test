import { Router } from 'express';
import * as eventsController from '../controllers/events.controller';

const router = Router();

router.get('/', eventsController.getPublicEvents);
router.get('/:id', eventsController.getPublicEvent);

export default router;
