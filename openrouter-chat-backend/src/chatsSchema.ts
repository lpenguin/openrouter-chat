import { z } from 'zod';

export const createChatSchema = z.object({
  model: z.string().min(1, 'Model is required'),
});

export const postMessageSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  provider: z.string().min(1, 'Provider is required'),
  model: z.string().min(1, 'Model is required'),
});
