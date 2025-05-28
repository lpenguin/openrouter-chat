import { Router } from 'express';
import { authMiddleware } from '../services/authMiddleware';
import { z } from 'zod';
import { getOpenRouterCompletionWithAttachments as getOpenRouterCompletion, OpenRouterResponseMessage, OpenRouterContent, OpenRouterRequestMessage, OpenRouterAttachment } from '../services/openrouterService';
import { getUserSettings } from '../services/settingsService';
import {
  createChat,
  listChats,
  getChatById,
  insertMessage,
  getMessagesForChat,
  setChatModel,
  renameChat,
  deleteChat,
  insertAttachments,
  getAttachmentsForMessage,
} from '../services/chatService';
import { DbSelectAttachment, DbSelectMessage } from '../db/schema';


const RenameChatSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

// Define schema for creating a chat
const CreateChatSchema = z.object({
  model: z.string().optional(),
});

// Define Zod schema and type for attachments
export const AttachmentSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  data: z.string(), // base64
});
export type Attachment = z.infer<typeof AttachmentSchema>;

const PostMessageRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  model: z.string().min(1, 'Model is required'),
  attachments: z.array(AttachmentSchema).optional(),
});

const MessageDtoSchema = z.object({
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
});

type MessageDto = z.infer<typeof MessageDtoSchema>;


// Zod schema for OpenRouter annotations: must be object, array, or null
export const OpenRouterAnnotationsSchema = z.union([
  z.record(z.any()),
  z.array(z.any()),
  z.null(),
]);
export type OpenRouterAnnotations = z.infer<typeof OpenRouterAnnotationsSchema>;

// Helper to map a single attachment to OpenRouterContent
export function mapAttachmentToOpenRouterContent(att: Attachment): OpenRouterAttachment | undefined {
  if (att.mimetype === 'application/pdf') {
    return {
      type: 'file',
      file: {
        filename: att.filename,
        file_data: `data:application/pdf;base64,${att.data}`,
      },
    };
  } else if (att.mimetype.startsWith('image/')) {
    return {
      type: 'image_url',
      image_url: {
        url: `data:${att.mimetype};base64,${att.data}`,
      },
    };
  } else {
    return undefined;
  }
}

// Helper to build OpenRouter user message with attachments/annotations
export function buildUserOpenRouterMessage(content: string, attachments?: Attachment[]): OpenRouterRequestMessage {
  if (!attachments || attachments.length === 0) {
    return { role: 'user', content };
  }
  return {
    role: 'user',
    content: [
      { type: 'text', text: content },
      ...attachments
        .map(mapAttachmentToOpenRouterContent)
        .filter((x): x is Exclude<typeof x, undefined> => x !== undefined)
    ]
  };
}

// Helper to validate attachments (decode base64, check PDF header, throw on error)
export function validateAttachments(attachments: Attachment[]): void {
  attachments.forEach((a) => {
    if (a.mimetype === 'application/pdf') {
      const buffer = Buffer.from(a.data, 'base64');
      if (buffer.subarray(0, 5).toString() !== '%PDF-') {
        throw new Error(`File does not start with %PDF-: ${a.filename}`);
      }
    }
  });
}

function mapDbAttacmentToOpenRouterContent(dbAttachment: DbSelectAttachment): OpenRouterAttachment | undefined {
  if (dbAttachment.mimetype === 'application/pdf') {
    return {
      type: 'file',
      file: {
        filename: dbAttachment.filename,
        file_data: `data:application/pdf;base64,${dbAttachment.data.toString('base64')}`,
      },
    };
  } else if (dbAttachment.mimetype.startsWith('image/')) {
    return {
      type: 'image_url',
      image_url: {
        url: `data:${dbAttachment.mimetype};base64,${dbAttachment.data.toString('base64')}`,
      },
    };
  }
  return undefined;

}

// Helper to map attachments to OpenRouterContent (base64 encoding)
export function mapAttachmentsToOpenRouterContent(attachments: Attachment[]): OpenRouterAttachment[] {
  return attachments
    .map(mapAttachmentToOpenRouterContent)
    .filter((x) => x !== undefined);
}

// Helper to convert DB annotation to OpenRouter annotation (validates with Zod)
export function dbAnnotationToOpenRouterAnnotation(annotation: unknown): any {
  const p = OpenRouterAnnotationsSchema.safeParse(annotation);
  return p.success && p.data !== null ? p.data : undefined;
}

// Helper to convert DB message to OpenRouter message
export async function dbMessageToOpenRouterMessage(dbMessage: DbSelectMessage): Promise<OpenRouterRequestMessage> {
  const attachments = await getAttachmentsForMessage(dbMessage.id);
  const content = attachments.length > 0
    ? [
        { type: 'text' as 'text', text: dbMessage.content },
        ...attachments
          .map(mapDbAttacmentToOpenRouterContent)
          .filter((x) => x !== undefined)
      ]
    : dbMessage.content ;
  const base = { role: dbMessage.role, content };
  const annotations = dbAnnotationToOpenRouterAnnotation(dbMessage.annotations);
  return annotations ? { ...base, annotations } : base;
}

function dbMessageToMessageDto(dbMessage: DbSelectMessage, dbAttachments?: DbSelectAttachment[] | undefined): MessageDto {
  const messageDto: MessageDto = {
    id: dbMessage.id,
    role: dbMessage.role,
    content: dbMessage.content,
    createdAt: dbMessage.created_at,
    updatedAt: dbMessage.updated_at,
    model: dbMessage.model ?? undefined,
    provider: dbMessage.provider ?? undefined,
  };
  if (dbAttachments && dbAttachments.length > 0) {
    messageDto.attachments = dbAttachments.map(att => ({
      id: att.id,
      filename: att.filename,
      mimetype: att.mimetype,
    }));
  }
  return messageDto;
}

const router = Router();

// POST /chats/ - create new chat
router.post('/chats', authMiddleware, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;

  const parseResult = CreateChatSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.errors[0].message });
    return;
  }
  const { model } = parseResult.data;

  const chat = await createChat({ userId: user.id, model });
  res.json({ chat });
});

// GET /chats/ - list chats
router.get('/chats', authMiddleware, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const userChats = await listChats(user.id);
  res.json({ chats: userChats });
});

// POST /chat/:uuid/messages - post message, call OpenRouter, return assistant message
router.post('/chat/:uuid/messages', authMiddleware, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;

  const parseResult = PostMessageRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.errors[0].message });
    return;
  }
  const { content, model, attachments } = parseResult.data;

  const chat = await getChatById(uuid);
  if (!chat) {
    res.status(404).json({ error: 'Chat not found' });
    return;
  }

  if (attachments) {
    try {
      validateAttachments(attachments);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Attachment validation error' });
      return;
    }
  }

  const settings = await getUserSettings(user.id);
  const apiKey = settings?.operouter?.token;
  if (!apiKey) {
    res.status(400).json({ error: 'No OpenRouter API key in user settings' });
    return;
  }

  await setChatModel(uuid, model);

  const chatMessages = await getMessagesForChat(uuid);
  console.log(`Number of messages in chat ${uuid}:`, chatMessages.length);

  const userDbMessage = await insertMessage({
    chat_id: uuid,
    user_id: user.id,
    role: 'user',
    model,
    provider: 'openrouter',
    content,
  });

  const attachmentsToInsert = attachments?.map(att => ({
    chat_id: uuid,
    user_id: user.id,
    message_id: userDbMessage.id,
    filename: att.filename,
    mimetype: att.mimetype,
    data: Buffer.from(att.data, 'base64'),
  })) || [];
  await insertAttachments(attachmentsToInsert);

  const openrouterMessages = [];
  for (const msg of chatMessages) {
    const openRouterMsg = await dbMessageToOpenRouterMessage(msg);
    openrouterMessages.push(openRouterMsg);
  }
  // Add the user message with attachments
  openrouterMessages.push(buildUserOpenRouterMessage(content, attachments));

  const assistantMsg = await getOpenRouterCompletion({
    messages: openrouterMessages,
    model,
    apiKey,
  });

  const assistantMsgObj = await insertMessage({
    chat_id: uuid,
    user_id: user.id,
    role: 'assistant',
    content: assistantMsg.content,
    model,
    provider: 'openrouter',
    annotations: assistantMsg.annotations,
  });

  const messageDto: MessageDto = dbMessageToMessageDto(assistantMsgObj);

  res.json({ message: messageDto });
});

// GET /chat/:uuid/messages - get messages for chat
router.get('/chat/:uuid/messages', authMiddleware, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;
  // Check chat exists and belongs to user
  const chat = await getChatById(uuid);
  if (!chat || chat.user_id !== user.id) {
    res.status(404).json({ error: 'Chat not found' });
    return;
  }
  const chatMessages = await getMessagesForChat(uuid);
  const messageDtos = await Promise.all(
    chatMessages.map(async (msg) => {
      const attachments = await getAttachmentsForMessage(msg.id);
      const messageDto: MessageDto = dbMessageToMessageDto(msg, attachments);
      return messageDto;
    })
  );
  res.json({ messages: messageDtos });
});

// PUT /chat/:uuid - rename chat
router.put('/chat/:uuid', authMiddleware, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;
  const parseResult = RenameChatSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.errors[0].message });
    return;
  }
  const { name } = parseResult.data;
  const chat = await getChatById(uuid);
  if (!chat || chat.user_id !== user.id) {
    res.status(404).json({ error: 'Chat not found' });
    return;
  }
  const updatedChat = await renameChat(uuid, name.trim());
  res.json({ chat: updatedChat });
});

// DELETE /chat/:uuid - delete chat
router.delete('/chat/:uuid', authMiddleware, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;
  const chat = await getChatById(uuid);
  if (!chat || chat.user_id !== user.id) {
    res.status(404).json({ error: 'Chat not found' });
    return;
  }
  await deleteChat(uuid);
  res.json({ success: true });
});

export default router;
