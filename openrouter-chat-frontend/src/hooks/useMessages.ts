import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types/chat';
import * as chatService from '../services/chatService';

interface UseMessagesOptions {
  chatId: string | null;
  token: string;
  onError: (error: string) => void;
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
}

export function useMessages({ chatId, token, onError }: UseMessagesOptions): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Load messages when chatId changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        const msgs = await chatService.getMessages(chatId, token);
        setMessages(msgs);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to load messages');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId, token]); // Removed onError from dependencies to prevent infinite loop

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } as Message : msg
    ));
  }, []);

  return {
    messages,
    loading,
    addMessage,
    updateMessage,
  };
}
