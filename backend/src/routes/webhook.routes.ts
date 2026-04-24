// src/routes/webhook.routes.ts
import { Router } from 'express';
import { handleZaloWebhook } from '../controllers/webhook.controller';

const router = Router();

// Note: express.raw middleware is applied in app.ts for this specific route.
router.post('/', handleZaloWebhook);

export default router;
