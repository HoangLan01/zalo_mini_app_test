// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors }
    });
  }
  req.body = result.data; // replace with parsed/sanitized data
  next();
};
