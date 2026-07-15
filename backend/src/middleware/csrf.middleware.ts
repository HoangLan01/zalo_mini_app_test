import { Request, Response, NextFunction } from 'express';

export const verifyAdminOrigin = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.get('origin');
  const allowed = (process.env.ADMIN_APP_URL || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const isDevelopmentAdminOrigin = (() => {
    if (process.env.NODE_ENV !== 'development' || !origin) return false;
    try {
      const url = new URL(origin);
      return ['http:', 'https:'].includes(url.protocol) && url.port === '3100';
    } catch {
      return false;
    }
  })();
  if (!origin || (!allowed.includes(origin) && !isDevelopmentAdminOrigin)) {
    return res.status(403).json({ success: false, error: { code: 'INVALID_ORIGIN', message: 'Nguồn yêu cầu không hợp lệ' } });
  }
  next();
};
