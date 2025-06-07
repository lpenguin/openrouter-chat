import { Router, Request, Response } from 'express';
import { db } from '../db';
import { attachments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../services/authMiddleware';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// GET /attachments/:id/content - returns the binary content of the attachment
router.get('/attachments/:id/content', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  // @ts-ignore
  const user = req.user;
  const result = await db.select().from(attachments).where(eq(attachments.id, Number(id))).limit(1);
  const attachment = result[0];
  if (!attachment) {
    throw new ApiError('Attachment not found', 404);
  } else if (attachment.user_id !== user.id) {
    throw new ApiError('Forbidden', 403);
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
