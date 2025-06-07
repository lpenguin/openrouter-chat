import { Router, Request, Response } from 'express';
import { getUserSettings, setUserSettings } from '../services/settingsService';
import { authMiddleware } from '../services/authMiddleware';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  if (!user) {
    throw new ApiError('Unauthorized', 401);
  }
  const settings = await getUserSettings(user.id);
  res.json({ settings });
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  if (!user) {
    throw new ApiError('Unauthorized', 401);
  }
  
  const updated = await setUserSettings(user.id, req.body);
  res.json({ settings: updated });
});

export default router;
