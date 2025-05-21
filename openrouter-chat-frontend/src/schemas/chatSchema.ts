import { z } from 'zod';

export const ChatSchema = z.object({
  id: z.string().uuid(),
  user_id: z.number(),
  model: z.string(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

export type Chat = z.infer<typeof ChatSchema>;

export const MessageSchema = z.object({
  id: z.string().uuid(),
  chat_id: z.string().uuid(),
  user_id: z.number(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  model: z.string().nullable(),
  provider: z.string().nullable(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

export type Message = z.infer<typeof MessageSchema>;
