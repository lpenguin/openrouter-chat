import { Router } from 'express';
import { authMiddleware } from '../../services/authMiddleware';
import { createChatHandler, listChatsHandler, postMessageHandler, getMessagesHandler, renameChatHandler, deleteChatHandler, streamMessageHandler } from './handlers';

const router = Router();

router.post('/chats', authMiddleware, createChatHandler);
router.get('/chats', authMiddleware, listChatsHandler);
router.post('/chat/:uuid/messages', authMiddleware, postMessageHandler);
router.get('/chat/:uuid/messages', authMiddleware, getMessagesHandler);
router.put('/chat/:uuid', authMiddleware, renameChatHandler);
router.delete('/chat/:uuid', authMiddleware, deleteChatHandler);
router.get('/stream-message/:uuid', authMiddleware, streamMessageHandler);

export default router;
