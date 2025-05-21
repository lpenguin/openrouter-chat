import { Router } from 'express';
import { getUserSettings, setUserSettings } from '../services/settingsService';
import { authMiddleware } from '../services/authMiddleware';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  // @ts-ignore
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const settings = await getUserSettings(user.id);
  res.json({ settings });
});

router.post('/', authMiddleware, async (req, res) => {
  // @ts-ignore
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const updated = await setUserSettings(user.id, req.body);
    res.json({ settings: updated });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid settings' });
  }
});

export default router;
