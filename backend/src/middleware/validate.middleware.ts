import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/apiResponse';

const parseWithSchema = (schema: ZodSchema, input: unknown) => {
  const result = schema.safeParse(input);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return { errors };
  }

  return { data: result.data };
};

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = parseWithSchema(schema, req.body);
  if (!('data' in result)) {
    return sendError(res, 'VALIDATION_ERROR', result.errors, 400);
  }

  req.body = result.data;
  next();
};

export const validateQuery = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = parseWithSchema(schema, req.query);
  if (!('data' in result)) {
    return sendError(res, 'VALIDATION_ERROR', result.errors, 400);
  }

  req.query = result.data as Request['query'];
  next();
};

export const validateParams = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = parseWithSchema(schema, req.params);
  if (!('data' in result)) {
    return sendError(res, 'VALIDATION_ERROR', result.errors, 400);
  }

  req.params = result.data as Request['params'];
  next();
};
