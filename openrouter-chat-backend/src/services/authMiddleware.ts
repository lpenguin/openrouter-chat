import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check for token in Authorization header first
  let token: string | undefined;
  const auth = req.headers.authorization;
  
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.slice(7);
  } else if (req.query.token && typeof req.query.token === 'string') {
    // For SSE requests, check for token in query parameter
    token = req.query.token;
  }
  
  if (!token) {
    throw new ApiError('Missing or invalid Authorization header or token', 401);
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // @ts-ignore
    req.user = payload;
    next();
  } catch (e) {
    throw new ApiError('Invalid or expired token', 401);
  }
}
