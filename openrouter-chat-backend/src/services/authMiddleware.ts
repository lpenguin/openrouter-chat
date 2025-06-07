import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    throw new ApiError('Missing or invalid Authorization header', 401);
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // @ts-ignore
    req.user = payload;
    next();
  } catch (e) {
    throw new ApiError('Invalid or expired token', 401);
  }
}
