import { Router } from 'express';
import { authMiddleware } from './services/authMiddleware';
import { z } from 'zod';
import { createChatSchema, postMessageSchema } from './chatsSchema';
import { getOpenRouterCompletion, ChatMessage } from './services/openrouterService';
import { getUserSettings } from './services/settingsService';
import {
  createChat,
  listChats,
  getChatById,
  insertMessage,
  getMessagesForChat
} from './services/chatService';

const router = Router();

// POST /chats/ - create new chat
router.post('/chats', authMiddleware, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const parseResult = createChatSchema.safeParse(req.body);
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
  const parseResult = postMessageSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.errors[0].message });
    return;
  }
  const { content, provider, model } = parseResult.data;
  // Check chat exists and belongs to user
  const chat = await getChatById(uuid);
  if (!chat || chat.user_id !== user.id) {
    res.status(404).json({ error: 'Chat not found' });
    return;
  }
  // Insert user message
  await insertMessage({ chatId: uuid, userId: user.id, role: 'user', content, model: null, provider: null });
  // Get all messages for chat (for context)
  const chatMessages = await getMessagesForChat(uuid);
  const openrouterMessages: ChatMessage[] = (chatMessages as any[]).map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content, model: m.model ?? undefined }));
  openrouterMessages.push({ role: 'user', content });
  // Get OpenRouter API key from user settings (expecting settings.operouter.token)
  const settings = await getUserSettings(user.id);
  const apiKey = settings?.operouter?.token;
  if (!apiKey) {
    res.status(400).json({ error: 'No OpenRouter API key in user settings' });
    return;
  }
  try {
    const assistantMsg = await getOpenRouterCompletion({ messages: openrouterMessages, model, apiKey });
    const assistantMsgObj = await insertMessage({ chatId: uuid, userId: user.id, role: 'assistant', content: assistantMsg.content, model, provider });
    res.json({ message: assistantMsgObj });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'OpenRouter error' });
  }
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
  res.json({ messages: chatMessages });
});

export default router;
