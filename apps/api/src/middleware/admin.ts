import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'PLATFORM_ADMIN') {
    return res.status(403).json({ error: 'Access denied. Platform Admin privileges required.' });
  }

  next();
};
