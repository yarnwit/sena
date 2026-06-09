import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';

/**
 * JWT authentication middleware
 * ตาม README.md — verify JWT token from Authorization header or cookies
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
