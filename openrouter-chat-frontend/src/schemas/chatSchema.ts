import { z } from 'zod';

export const ChatSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  user_id: z.number(),
  model: z.string(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

const BaseMessageSchema = z.object({
  id: z.string().uuid(),
  chat_id: z.string().uuid(),
  user_id: z.number(),
  role: z.enum(['user', 'assistant']),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  content: z.string(),
});

export const UserMessageSchema = BaseMessageSchema.extend({
  role: z.literal('user'),
});
export const AssistantMessageSchema = BaseMessageSchema.extend({
  role: z.literal('assistant'),
  model: z.string(),
  provider: z.string(),
});

export const MessageSchema = z.discriminatedUnion('role', [
  UserMessageSchema,
  AssistantMessageSchema,
]);

