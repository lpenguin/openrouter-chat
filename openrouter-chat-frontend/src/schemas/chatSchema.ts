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
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  attachments: z.array(
    z.object({
      id: z.number(),
      filename: z.string(),
      mimetype: z.string(),
    })
  ).optional(),
});

export const UserMessageSchema = BaseMessageSchema.extend({
  role: z.literal('user'),
});
export const AssistantMessageSchema = BaseMessageSchema.extend({
  role: z.literal('assistant'),
  model: z.string(),
  provider: z.string(),
  searchAnnotations: z.array(z.object({
    url: z.string().url(),
    faviconUrl: z.string().url().optional(),
    citation: z.string().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
    startIndex: z.number().optional(),
    endIndex: z.number().optional(),
  })).optional(),
});

export const MessageSchema = z.discriminatedUnion('role', [
  UserMessageSchema,
  AssistantMessageSchema,
]);

