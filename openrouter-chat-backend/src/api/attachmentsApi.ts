import { Router } from 'express';
import { db } from '../db';
import { attachments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../services/authMiddleware';

const router = Router();

// GET /attachments/:id/content - returns the binary content of the attachment
router.get('/attachments/:id/content', authMiddleware, async (req, res) => {
  const { id } = req.params;
  // @ts-ignore
  const user = req.user;
  const result = await db.select().from(attachments).where(eq(attachments.id, Number(id))).limit(1);
  const attachment = result[0];
  if (!attachment) {
    res.status(404).json({ error: 'Attachment not found' });
  } else if (attachment.user_id !== user.id) {
    res.status(403).json({ error: 'Forbidden' });
  } else {
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`);
    res.send(attachment.data);
  }
});

export default router;
