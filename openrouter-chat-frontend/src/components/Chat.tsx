import { useEffect, useRef, useState } from 'react';
import UpperBar from './UpperBar';
import ChatInput from './ChatInput';
import { UserChatBubble, AssistantChatBubble, AssistantMessageWithAnnotations } from './ChatBubble';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useErrorStore } from '../store/errorStore';
import { useSettingsStore } from '../store/settingsStore';
import * as chatService from '../services/chatService';
import { Message } from '../types/chat';

// Dummy stub for loading state
const loadingStub: Message[] = [
  { id: 'stub-1', role: 'user' as 'user', content: 'Loading...', },
  { id: 'stub-2', role: 'assistant' as 'assistant', content: 'Loading...', model: '' },
];

interface ChatProps {
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
  onNewChatId?: (id: string) => void;
}

export default function Chat({ sidebarVisible, onToggleSidebar, isMobile, onNewChatId }: ChatProps) {
  const authUser = useAuthStore((state) => state.authUser);
  const { addError } = useErrorStore();
  
  if (!authUser) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Please log in to access the chat.</p>
    </div>
  );
  const {
    getChatById,
    setCurrentChatId,
    currentChatId,
    addChat,    
  } = useChatStore();
  const { settings } = useSettingsStore();
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const previousMessagesLengthRef = useRef(0);
  const justLoadedChatRef = useRef(false);
  const [assistantMessageLoading, setAssistantMessageLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamingChatIdRef = useRef<string | null>(null);

  const createRealChatFromTemp = async (firstMessageContent?: string) => {
    try {
      // Create real chat on server with the currently selected model and optional chatNameContent
      const realChat = await chatService.createChat(authUser.token, model || undefined, firstMessageContent);
      // Remove quotes from the chat name if present
      if (realChat.name) {
        realChat.name = realChat.name.replace(/^"|"$/g, '').trim();
      }
      addChat(realChat);
      setCurrentChatId(realChat.id);
      return realChat.id;
    } catch (error) {
      addError({
        message: error instanceof Error ? error.message : 'Failed to create chat',
      });
      throw error;
    }
  };


  useEffect(() => {
    if (currentChatId) {
      const currentChat = getChatById(currentChatId);
      if (currentChat) {
        setModel(currentChat.model);
      }
    } else {
      // Use default model from settings if available
      setModel(settings?.defaultModel || 'openai/gpt-3.5-turbo');
    }
  }, [currentChatId, settings]);

  useEffect(() => {
    if (isTransitioning) return;
    {
      (async () => {
        if (currentChatId !== null) {
          setLoading(true);
          try {
            const msgs = await chatService.getMessages(currentChatId, authUser.token);
            setMessages(msgs);
            // Reset the previous messages length when loading a chat
            previousMessagesLengthRef.current = msgs.length;
            // Mark that we just loaded a chat
            justLoadedChatRef.current = true;
          } catch (error) {
            addError({
              message: error instanceof Error ? error.message : 'Failed to load messages',
            });
            setMessages([]);
            previousMessagesLengthRef.current = 0;
          } finally {
            setLoading(false);
          }
        } else {
          setMessages([]);
          previousMessagesLengthRef.current = 0;
        }
      })();
    }
  }, [currentChatId, addError, setCurrentChatId]);

  useEffect(() => {
    if (justLoadedChatRef.current && messages.length > 0 && lastMessageRef.current) {
      // When just loaded a chat, scroll to the end of the last message
      lastMessageRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
      justLoadedChatRef.current = false;
    } else if (messages.length > previousMessagesLengthRef.current && messages.length > 0 && lastMessageRef.current) {
      // When new messages are added, only scroll for user messages
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        // For user messages: scroll so the last line of the user message is at the top, leaving space for assistant response
        setTimeout(() => {
          if (lastMessageRef.current) {
            const rect = lastMessageRef.current.getBoundingClientRect();
            const scrollContainer = lastMessageRef.current.closest('.overflow-y-auto');
            if (scrollContainer) {
              const containerRect = scrollContainer.getBoundingClientRect();
              // Position the bottom edge (last line) of the user message at the top with an offset to make it visible
              const targetScrollTop = scrollContainer.scrollTop + (rect.bottom - containerRect.top) - 50;
              scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
            }
          }
        }, 0);
      }
    }
    // Update the previous messages length
    previousMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Auto-resume streaming if last message is assistant and status is 'generating' after loading messages
  useEffect(() => {
    if (
      !streaming &&
      currentChatId &&
      messages.length > 0 &&
      messages[messages.length - 1].role === 'assistant' &&
      (messages[messages.length - 1] as any).status === 'generating'
    ) {
      startStreaming(currentChatId);
    }
    // Only run when messages or streaming state changes
  }, [messages, streaming, currentChatId]);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleSend = async (content: string, attachments?: { filename: string; mimetype: string; data: string }[], useSearch?: boolean) => {
    if ((!content.trim() && (!attachments || attachments.length === 0)) || !authUser) return;

    // Add user message to store immediately
    const userMsg = {
      id: `${Date.now()}-user`,
      role: 'user' as 'user',
      content,
      attachments: attachments?.map(att => ({
        // No ID for local echo - will be assigned by server
        filename: att.filename,
        mimetype: att.mimetype,
        data: att.data
      }))
    };

    addMessage(userMsg);
    setAssistantMessageLoading(true);

    let chatId;
    if (currentChatId) {
      chatId = currentChatId;
    } else {
      setIsTransitioning(true);
      try {
        // Pass the first message content for chat name suggestion
        chatId = await createRealChatFromTemp(content);
        if (onNewChatId && chatId) {
          onNewChatId(chatId);
        }
      } catch (e) {
        throw e;
      } finally {
        setIsTransitioning(false);
      }
    }

    // Send to backend and add assistant message to store
    try {
      // Actually send the message to backend (which will trigger streaming)
      const { messageId } = await chatService.sendMessageToChat({
        chatId,
        content,
        model: model!!,
        token: authUser.token,
        attachments,
        useSearch,
      });

      // Add a local echo of the assistant message with status 'generating' for streaming UI
      const assistantEcho = {
        id: messageId,
        role: 'assistant' as const,
        content: '',
        model: model || '',
        status: 'generating' as const,
      };
      addMessage(assistantEcho);

      // Start streaming immediately for this message
      startStreaming(chatId);
    } catch (error) {
      addError({
        message: error instanceof Error ? error.message : 'Failed to send message',
      });
    } finally {
      setAssistantMessageLoading(false);
    }
  };

  const handleModelChange = (model: string) => {
    setModel(model);
  };

  // Get current chat name
  const currentChat = currentChatId ? getChatById(currentChatId) : null;
  const chatName = currentChat?.name || null;

  // Helper: update last assistant message content
  const updateLastAssistantMessage = (delta: string, done = false) => {
    setMessages((prev) => {
      const idx = prev.length - 1;
      if (idx < 0) return prev;
      const last = prev[idx];
      if (last.role !== 'assistant' || last.status !== 'generating') return prev;
      const updated = { ...last, content: last.content + delta };
      if (done) updated.status = 'complete';
      return [...prev.slice(0, idx), updated];
    });
  };

  // Helper: start streaming for a specific chat
  const startStreaming = (chatId: string) => {
    if (!authUser?.token) return;
    if (streaming && streamingChatIdRef.current === chatId) return;

    setStreaming(true);
    streamingChatIdRef.current = chatId;
    const es = chatService.streamAssistantMessage({
      chatId,
      token: authUser.token,
      onDelta: (delta) => updateLastAssistantMessage(delta),
      onDone: () => {
        updateLastAssistantMessage('', true);
        setStreaming(false);
        streamingChatIdRef.current = null;
      },
      onError: () => {
        setStreaming(false);
        streamingChatIdRef.current = null;
        // Mark the current generating message as complete instead of refetching
        updateLastAssistantMessage('', true);
      },
    });
    eventSourceRef.current = es;
  };

  // Clean up stream on chat change/unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setStreaming(false);
        streamingChatIdRef.current = null;
      }
    };
  }, [currentChatId]);

  return (
    <div 
      className={`h-[100svh] flex flex-col ${sidebarVisible ? 'flex-1' : 'w-full'}`}
    >
      {/* Upper Bar with Model Selector - takes only required height */}
      <UpperBar
        currentModel={model}
        onModelChange={handleModelChange}
        className="w-full bg-white border-b border-theme shadow-sm p-3 flex items-center justify-between flex-shrink-0"
        chatName={chatName}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={onToggleSidebar}
        isMobile={isMobile}
      />
      {/* Chat content container - takes remaining height */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* ChatMessages - Scrollable area that takes remaining space */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto flex flex-col space-y-3 px-4 py-4">
            {(loading ? loadingStub : messages).map((msg: Message, index) => {
              const isLastMessage = index === messages.length - 1;
              return msg.role === 'assistant' ? (
                <div key={msg.id} ref={isLastMessage ? lastMessageRef : null}>
                  <AssistantChatBubble message={msg as AssistantMessageWithAnnotations} />
                </div>
              ) : (
                <div key={msg.id} ref={isLastMessage ? lastMessageRef : null} data-role="user">
                  <UserChatBubble message={msg} />
                </div>
              );
            })}
            {assistantMessageLoading && !loading && (
              <div className="px-4 py-2 text-gray-500">Assistant is typing...</div>
            )}
            {/* Add bottom padding to ensure scrollability only when user has added messages */}
            {messages.some(msg => msg.role === 'user') && <div className="h-[calc(100vh-140px)]" />}
          </div>
        </div>
        {/* ChatInput - Fixed at bottom */}
        <div className="flex-shrink-0 bg-gradient-to-t from-white via-white/80 to-transparent">
          <ChatInput
            onSend={handleSend}
            sendDisabled={loading || assistantMessageLoading}
          />
        </div>
      </div>
    </div>
  );
};

