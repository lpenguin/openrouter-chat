// Zod schemas and types for chat API (excluding OpenRouter)
import { z } from 'zod';

export const RenameChatSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const CreateChatSchema = z.object({
  model: z.string().optional(),
  chatNameContent: z.string().optional(),
});

export const AttachmentSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  data: z.string(), // base64
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const PostMessageRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  model: z.string().min(1, 'Model is required'),
  attachments: z.array(AttachmentSchema).optional(),
  useSearch: z.boolean().optional(),
});

export const MessageDtoSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  model: z.string().optional(),
  provider: z.string().optional(),
  attachments: z.array(
    z.object({
      id: z.number(),
      filename: z.string(),
      mimetype: z.string(),
    })
  ).optional(),
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

export type MessageDto = z.infer<typeof MessageDtoSchema>;
