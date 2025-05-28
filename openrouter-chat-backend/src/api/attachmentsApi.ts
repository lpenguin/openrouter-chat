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
    
    // Properly encode filename for Content-Disposition header
    // Remove/replace any problematic characters and encode for RFC 5987
    const safeFilename = attachment.filename
      .replace(/[^\w\s.-]/g, '') // Remove special characters except word chars, spaces, dots, hyphens
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 100); // Limit length
    
    // Use RFC 5987 encoding for better Unicode support
    const encodedFilename = encodeURIComponent(attachment.filename);
    res.setHeader(
      'Content-Disposition', 
      `inline; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`
    );
    
    res.send(attachment.data);
  }
});

export default router;
