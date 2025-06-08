// Route handler functions for chats API
import { Request, Response } from 'express';
import { ApiError } from '../../middleware/errorHandler';
import { getOpenRouterCompletionWithAttachments as getOpenRouterCompletion } from '../../services/openrouterService';
import { getUserSettings } from '../../services/settingsService';
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
} from '../../services/chatService';
import {
  RenameChatSchema,
  CreateChatSchema,
  PostMessageRequestSchema,
  MessageDto,
} from './schemas';
import {
  buildUserOpenRouterMessage,
  validateAttachments,
  dbMessageToOpenRouterMessage,
  dbMessageToMessageDto,
  attachmentsToInsertArray,
} from './helpers';

export const createChatHandler = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const parseResult = CreateChatSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(parseResult.error.errors[0].message, 400);
  }
  const { model, chatNameContent } = parseResult.data;
  let chatName: string | undefined = undefined;
  if (chatNameContent) {
    const settings = await getUserSettings(user.id);
    const apiKey = settings?.operouter?.token;
    if (!apiKey) {
      throw new ApiError('No OpenRouter API key in user settings', 400);
    }
    try {
      const nameResponse = await getOpenRouterCompletion({
        messages: [
          { role: 'user', content: 'Suggest a short, descriptive chat title for this conversation:' },
          { role: 'user', content: chatNameContent }
        ],
        model: model || 'gpt-3.5-turbo',
        apiKey,
      });
      chatName = (typeof nameResponse.content === 'string') ? nameResponse.content.trim() : undefined;
    } catch (err) {
      chatName = undefined;
    }
  }
  const chat = await createChat({ userId: user.id, model, name: chatName });
  res.json({ chat });
};

export const listChatsHandler = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const userChats = await listChats(user.id);
  res.json({ chats: userChats });
};

export const postMessageHandler = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;
  const parseResult = PostMessageRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(parseResult.error.errors[0].message, 400);
  }
  const { content, model, attachments, useSearch } = parseResult.data;
  const chat = await getChatById(uuid);
  if (!chat) {
    throw new ApiError('Chat not found', 404);
  }
  if (attachments) {
    try {
      validateAttachments(attachments);
    } catch (err) {
      throw new ApiError(err instanceof Error ? err.message : 'Attachment validation error', 400);
    }
  }
  const settings = await getUserSettings(user.id);
  const apiKey = settings?.operouter?.token;
  if (!apiKey) {
    throw new ApiError('No OpenRouter API key in user settings', 400);
  }
  await setChatModel(uuid, model);
  const chatMessages = await getMessagesForChat(uuid);
  const userDbMessage = await insertMessage({
    chat_id: uuid,
    user_id: user.id,
    role: 'user',
    model,
    provider: 'openrouter',
    content,
  });
  const attachmentsToInsert = attachmentsToInsertArray(attachments, uuid, user.id, userDbMessage.id);
  await insertAttachments(attachmentsToInsert);
  const openrouterMessages = [];
  for (const msg of chatMessages) {
    const openRouterMsg = await dbMessageToOpenRouterMessage(msg);
    openrouterMessages.push(openRouterMsg);
  }
  // Add the user message(s) with attachments
  const userMessages = buildUserOpenRouterMessage(content, attachments);
  for (const msg of userMessages) {
    openrouterMessages.push(msg);
  }
  const assistantMsg = await getOpenRouterCompletion({
    messages: openrouterMessages,
    model,
    apiKey,
    useWebSearch: !!useSearch,
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
};

export const getMessagesHandler = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;
  const chat = await getChatById(uuid);
  if (!chat || chat.user_id !== user.id) {
    throw new ApiError('Chat not found', 404);
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
};

export const renameChatHandler = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;
  const parseResult = RenameChatSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(parseResult.error.errors[0].message, 400);
  }
  const { name } = parseResult.data;
  const chat = await getChatById(uuid);
  if (!chat || chat.user_id !== user.id) {
    throw new ApiError('Chat not found', 404);
  }
  const updatedChat = await renameChat(uuid, name.trim());
  res.json({ chat: updatedChat });
};

export const deleteChatHandler = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;
  const chat = await getChatById(uuid);
  if (!chat || chat.user_id !== user.id) {
    throw new ApiError('Chat not found', 404);
  }
  await deleteChat(uuid);
  res.json({ success: true });
};
