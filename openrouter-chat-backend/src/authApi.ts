import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from './services/authService';
import { authMiddleware } from './services/authMiddleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const router = Router();

// Helper to get user from req (set by authMiddleware)
function getUserFromReq(req: Request) {
  // @ts-ignore
  return req.user;
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Missing email or password' });
    return;
  }
  try {
    const user = await registerUser(email, password);
    // Issue JWT
    const token = jwt.sign({ id: user.id, email: user.email, created_at: user.created_at }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, created_at: user.created_at }, token });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Missing email or password' });
    return;
  }
  try {
    const user = await loginUser(email, password);
    // Issue JWT
    const token = jwt.sign({ id: user.id, email: user.email, created_at: user.created_at }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, created_at: user.created_at }, token });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

router.get('/me', authMiddleware, (req, res, next) => {
  // @ts-ignore
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { id, email, created_at } = user;
  res.json({ user: { id, email, created_at } });
});

export default router;
