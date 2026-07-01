import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to sanitize user inputs and prevent MongoDB NoSQL Injection attacks
 * by recursively deleting keys that start with '$'.
 */
export const sanitizeMongo = (req: Request, _res: Response, next: NextFunction): void => {
  const sanitize = (obj: any): void => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  
  next();
};
