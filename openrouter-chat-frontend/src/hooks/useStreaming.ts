import { useState, useEffect, useRef, useCallback } from 'react';
import * as chatService from '../services/chatService';

interface UseStreamingOptions {
  chatId: string | null;
  token: string;
  onMessageUpdate: (delta: string, done?: boolean) => void;
  onError: (error: string) => void;
}

interface UseStreamingReturn {
  streaming: boolean;
  startStreaming: (chatId: string) => void;
  stopStreaming: () => void;
}

export function useStreaming({ chatId, token, onMessageUpdate, onError }: UseStreamingOptions): UseStreamingReturn {
  const [streaming, setStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamingChatIdRef = useRef<string | null>(null);

  const stopStreaming = useCallback(async () => {
    if (!chatId || !token) return;
    
    try {
      await chatService.stopAssistantStream(chatId, token);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setStreaming(false);
      streamingChatIdRef.current = null;
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to stop streaming');
    }
  }, [chatId, token]); // Removed onError from dependencies

  const startStreaming = useCallback((targetChatId: string) => {
    if (!token) return;
    if (streaming && streamingChatIdRef.current === targetChatId) return;

    setStreaming(true);
    streamingChatIdRef.current = targetChatId;
    
    const es = chatService.streamAssistantMessage({
      chatId: targetChatId,
      token,
      onDelta: (delta) => {
        onMessageUpdate(delta, false);
      },
      onDone: () => {
        onMessageUpdate('', true);
        setStreaming(false);
        streamingChatIdRef.current = null;
      },
      onError: () => {
        setStreaming(false);
        streamingChatIdRef.current = null;
        onMessageUpdate('', true);
      },
    });
    
    eventSourceRef.current = es;
  }, [token, streaming]); // Removed onMessageUpdate from dependencies

  // Clean up stream on chat change or unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setStreaming(false);
        streamingChatIdRef.current = null;
      }
    };
  }, [chatId]);

  return {
    streaming,
    startStreaming,
    stopStreaming,
  };
}
