// Route handler functions for chats API
import { Request, Response } from 'express';
import { ApiError } from '../../middleware/errorHandler';
import { getOpenRouterCompletion, getOpenRouterCompletionNonStreaming } from '../../services/openrouterService';
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
  getStreamingMessage,
  addStreamingMessage,
  removeStreamingMessage,
  triggerStreamingMessageListeners,
  addStreamingMessageListener
} from './helpers';
import { v4 as uuidv4 } from 'uuid';

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
      chatName = await getOpenRouterCompletionNonStreaming({
        messages: [
          { role: 'user', content: 'Suggest a short, descriptive chat title for this conversation:' },
          { role: 'user', content: chatNameContent }
        ],
        model: model || 'gpt-3.5-turbo',
        apiKey,
      });
      chatName = chatName.trim();
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
  // Prevent sending a new message if streaming is already occurring for this chat
  if (getStreamingMessage(uuid)) {
    throw new ApiError('A message is already being streamed for this chat. Please wait until it finishes.', 409);
  }
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

  // Instead of waiting for the full assistant message, start streaming in the background
  const messageId = uuidv4();
  const now = new Date().toISOString();
  const streamingAssistantMessage: MessageDto = {
    id: messageId,
    role: 'assistant',
    content: '',
    createdAt: now,
    updatedAt: now,
    model,
    provider: 'openrouter',
    status: 'generating',
  };
  addStreamingMessage(uuid, streamingAssistantMessage);

  // Start OpenRouter completion in the background (streaming)
  (async () => {
    let content = '';
    try {
      await getOpenRouterCompletion({
        messages: openrouterMessages,
        model,
        apiKey,
        useWebSearch: !!useSearch,
        onDelta: (delta: string, done: boolean) => {
          content += delta;

          streamingAssistantMessage.content = content;
          streamingAssistantMessage.updatedAt = new Date().toISOString();
          addStreamingMessage(uuid, streamingAssistantMessage);
          triggerStreamingMessageListeners(uuid, content, done);
          if (done) {
            (async () => {
              const assistantMsgObj = await insertMessage({
                chat_id: uuid,
                user_id: user.id,
                role: 'assistant',
                content,
                model,
                provider: 'openrouter',
                annotations: undefined,
              });
              removeStreamingMessage(uuid);
            })();
          }
        }
      });
    } catch (err) {
      removeStreamingMessage(uuid);
    }
  })();

  // Respond immediately with the streaming message id
  res.json({ messageId });
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
      return dbMessageToMessageDto(msg, attachments);
    })
  );
  // Check for in-memory streaming message for this chat
  const streamingMsg = getStreamingMessage(uuid);
  if (streamingMsg) {
    messageDtos.push({
      ...streamingMsg,
      status: 'generating',
    });
  }
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
  removeStreamingMessage(uuid);
  await deleteChat(uuid);
  res.json({ success: true });
};

export const streamMessageHandler = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { uuid } = req.params;
  // Check if chat exists and belongs to user
  const chat = await getChatById(uuid);
  if (!chat || chat.user_id !== user.id) {
    throw new ApiError('Chat not found', 404);
  }
  // Get streaming message for this chat
  const streamingMsg = getStreamingMessage(uuid);
  if (!streamingMsg) {
    throw new ApiError('No streaming message for this chat', 404);
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let sentLength = 0;
  const sendChunk = (content: string, done: boolean) => {
    if (content.length > sentLength) {
      const chunk = content.slice(sentLength);
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      sentLength = content.length;
    }
    if (done) {
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
      removeStreamingMessage(uuid);
    }
  };
  addStreamingMessageListener(uuid, sendChunk);
  if (streamingMsg.content.length > 0) {
    sendChunk(streamingMsg.content, false);
  }
};
