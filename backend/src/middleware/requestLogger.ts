import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requestStore, logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('x-request-id', requestId);

  requestStore.run({ requestId }, () => {
    const start = Date.now();
    logger.info(`--> ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`<-- ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${duration}ms`);
    });

    next();
  });
};
