import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../services/authMiddleware';
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
  AttachmentSchema,
  PostMessageRequestSchema,
  MessageDto,
} from './schemas';
import {
  buildUserOpenRouterMessage,
  validateAttachments,
  dbMessageToOpenRouterMessage,
  dbMessageToMessageDto,
} from './helpers';
import { createChatHandler, listChatsHandler, postMessageHandler, getMessagesHandler, renameChatHandler, deleteChatHandler } from './handlers';

const router = Router();

router.post('/chats', authMiddleware, createChatHandler);
router.get('/chats', authMiddleware, listChatsHandler);
router.post('/chat/:uuid/messages', authMiddleware, postMessageHandler);
router.get('/chat/:uuid/messages', authMiddleware, getMessagesHandler);
router.put('/chat/:uuid', authMiddleware, renameChatHandler);
router.delete('/chat/:uuid', authMiddleware, deleteChatHandler);

export default router;
