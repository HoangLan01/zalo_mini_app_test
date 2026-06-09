import { Router } from 'express';
import { z } from 'zod';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/auth.middleware';
import { verifyAdminOrigin } from '../middleware/csrf.middleware';
import { validate } from '../middleware/validate.middleware';
import * as controller from '../controllers/adminAccount.controller';

const router = Router();
const accountSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(255),
  role: z.enum(['ADMIN', 'SUPER_ADMIN'])
});

router.use(authenticateAdmin, requireSuperAdmin, verifyAdminOrigin);
router.get('/accounts', controller.listAccounts);
router.post('/accounts', validate(accountSchema), controller.createAccount);
router.patch('/accounts/:id', validate(accountSchema.partial()), controller.updateAccount);
router.post('/accounts/:id/disable', controller.disableAccount);
router.post('/accounts/:id/enable', controller.enableAccount);
router.post('/accounts/:id/reset-password', controller.resetPassword);
router.get('/audit-logs', controller.getAuditLogs);

export default router;
