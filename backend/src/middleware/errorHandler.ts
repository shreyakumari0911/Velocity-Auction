import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(error as Error, `❌ Unhandled exception on ${req.method} ${req.url}`);

  const status = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
};
