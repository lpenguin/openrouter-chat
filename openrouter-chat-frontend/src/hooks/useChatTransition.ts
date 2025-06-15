import { useState, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import * as chatService from '../services/chatService';

interface UseChatTransitionOptions {
  token: string;
  model: string | null;
  onNewChatId?: (id: string) => void;
  onError: (error: string) => void;
}

interface UseChatTransitionReturn {
  isTransitioning: boolean;
  createRealChatFromTemp: (firstMessageContent?: string) => Promise<string>;
}

export function useChatTransition({ token, model, onNewChatId, onError }: UseChatTransitionOptions): UseChatTransitionReturn {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { addChat, setCurrentChatId } = useChatStore();

  const createRealChatFromTemp = useCallback(async (firstMessageContent?: string): Promise<string> => {
    setIsTransitioning(true);
    try {
      // Create real chat on server with the currently selected model and optional chatNameContent
      const realChat = await chatService.createChat(token, model || undefined, firstMessageContent);
      
      // Remove quotes from the chat name if present
      if (realChat.name) {
        realChat.name = realChat.name.replace(/^"|"$/g, '').trim();
      }
      
      addChat(realChat);
      setCurrentChatId(realChat.id);
      
      if (onNewChatId) {
        onNewChatId(realChat.id);
      }
      
      return realChat.id;
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to create chat');
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, [token, model, addChat, setCurrentChatId]); // Removed callback functions from dependencies

  return {
    isTransitioning,
    createRealChatFromTemp,
  };
}
