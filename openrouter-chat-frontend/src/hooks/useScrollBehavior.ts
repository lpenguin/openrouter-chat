import { useEffect, useRef } from 'react';
import { Message } from '../types/chat';

interface UseScrollBehaviorOptions {
  messages: Message[];
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  chatId: string | null;
  loading?: boolean;
}

export function useScrollBehavior({ messages, lastMessageRef, chatId, loading }: UseScrollBehaviorOptions): void {
  const previousMessagesLengthRef = useRef(0);
  const previousChatIdRef = useRef<string | null>(null);
  const justLoadedChatRef = useRef(false);

  // Reset when chatId changes (new chat or chat switch)
  useEffect(() => {
    if (chatId !== previousChatIdRef.current) {
      // Mark that we just switched/loaded a chat
      justLoadedChatRef.current = true;
      previousChatIdRef.current = chatId;
      previousMessagesLengthRef.current = 0;
    }
  }, [chatId]);

  // Handle scrolling behavior
  useEffect(() => {
    const scrollToBottom = () => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
      }
    };

    if (justLoadedChatRef.current && messages.length > 0 && !loading) {
      // When just loaded/switched to a chat, scroll to the bottom immediately
      scrollToBottom();
      justLoadedChatRef.current = false;
    } else if (messages.length > previousMessagesLengthRef.current && messages.length > 0 && !loading) {
      // When new messages are added, handle different scroll behaviors
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.role === 'user') {
        // For user messages: scroll so the user message is visible with space for assistant response
        if (lastMessageRef.current) {
          const rect = lastMessageRef.current.getBoundingClientRect();
          const scrollContainer = lastMessageRef.current.closest('.overflow-y-auto');
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            // Position the bottom edge of the user message near the top with an offset
            const targetScrollTop = scrollContainer.scrollTop + (rect.bottom - containerRect.top) - 50;
            scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
          }
        }
      } else if (lastMessage.role === 'assistant') {
        // For assistant messages: scroll to bottom to show the full response
        scrollToBottom();
      }
    }
    
    // Update the previous messages length
    previousMessagesLengthRef.current = messages.length;
  }, [messages, lastMessageRef, loading]);
}
