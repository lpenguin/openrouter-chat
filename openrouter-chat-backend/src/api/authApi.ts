import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { authMiddleware } from '../services/authMiddleware';
import { ApiError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const router = Router();

// Helper to get user from req (set by authMiddleware)
function getUserFromReq(req: Request) {
  // @ts-ignore
  return req.user;
}

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError('Missing email or password', 400);
  }
  
  const user = await registerUser(email, password);
  // Issue JWT
  const token = jwt.sign({ id: user.id, email: user.email, created_at: user.created_at }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, email: user.email, created_at: user.created_at }, token });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError('Missing email or password', 400);
  }
  
  const user = await loginUser(email, password);
  // Issue JWT
  const token = jwt.sign({ id: user.id, email: user.email, created_at: user.created_at }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, email: user.email, created_at: user.created_at }, token });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  if (!user) {
    throw new ApiError('Unauthorized', 401);
  }
  const { id, email, created_at } = user;
  res.json({ user: { id, email, created_at } });
});

export default router;
