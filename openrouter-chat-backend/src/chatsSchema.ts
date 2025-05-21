import { z } from 'zod';

export const postMessageSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  model: z.string().min(1, 'Model is required'),
});
