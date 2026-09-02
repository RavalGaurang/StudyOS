import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors/AppError';
import { sendError } from '../common/utils/responseFormatter';
import { logger } from '../config/logger';
import { env } from '../config/env.config';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  logger.error(`[Error] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code,
  });

  // 1. Known Operational AppErrors
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // 2. Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      return sendError(res, `A record with this ${target} already exists`, 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found in database', 404);
    }
    if (err.code === 'P2003') {
      return sendError(res, 'Foreign key constraint violation', 400);
    }
  }

  // 3. Syntax / JSON Parsing Errors
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, 'Invalid JSON body in request', 400);
  }

  // 4. Default / Unhandled 500 Internal Error (Sanitized in production)
  const isDev = env.NODE_ENV === 'development';
  const message = isDev ? err.message || 'Internal Server Error' : 'An unexpected internal server error occurred';

  return sendError(res, message, 500);
}
