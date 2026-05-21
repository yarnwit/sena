import { Request, Response, NextFunction } from 'express';

/**
 * Role-based access control middleware
 * แยกจาก auth.middleware.ts ตาม README.md structure
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};
