import { Request, Response, NextFunction } from 'express';
import { writeAuditLog } from '../services/adminAudit.service';
import logger from '../utils/logger';

const getAuditDescriptor = (req: Request) => {
  const path = req.originalUrl.split('?')[0];
  const id = path.match(/\/(?:bookings|events|topics|sets|questions)\/([^/]+)/)?.[1];
  const actionSuffix =
    path.endsWith('/publish') ? 'PUBLISH' :
    path.endsWith('/close') ? 'CLOSE' :
    path.endsWith('/clone') ? 'CLONE' :
    req.method === 'POST' ? 'CREATE' :
    req.method === 'PATCH' || req.method === 'PUT' ? 'UPDATE' :
    req.method === 'DELETE' ? 'ARCHIVE' : req.method;
  const entityType =
    path.includes('/bookings') ? 'BOOKING' :
    path.includes('/events') ? 'EVENT' :
    path.includes('/quiz') ? 'QUIZ_CONTENT' : 'ADMIN_RESOURCE';
  return { action: `${entityType}_${actionSuffix}`, entityType, id };
};

export const auditAdminMutation = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user?.userId) {
      const descriptor = getAuditDescriptor(req);
      writeAuditLog(
        { actorId: req.user.userId, ipAddress: req.ip, userAgent: req.get('user-agent') },
        descriptor.action,
        descriptor.entityType,
        descriptor.id,
        { method: req.method, path: req.originalUrl.split('?')[0] }
      ).catch(error => logger.error('Failed to write admin audit log', { error: error.message }));
    }
  });
  next();
};
