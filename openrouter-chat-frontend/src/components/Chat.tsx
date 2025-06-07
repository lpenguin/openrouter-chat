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
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [assistantMessageLoading, setAssistantMessageLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          } catch (error) {
            addError({
              message: error instanceof Error ? error.message : 'Failed to load messages',
            });
            setMessages([]);
          } finally {
            setLoading(false);
          }
        } else {
          setMessages([]);
        }
      })();
    }
  }, [currentChatId, addError, setCurrentChatId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      const assistantMsg = await chatService.sendMessageToChat({
        chatId,
        content,
        model: model!!,
        token: authUser.token,
        attachments,
        useSearch,
      });
      addMessage(assistantMsg);
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
            {(loading ? loadingStub : messages).map((msg: Message) =>
              msg.role === 'assistant' ? (
                <AssistantChatBubble key={msg.id} message={msg as AssistantMessageWithAnnotations} />
              ) : (
                <UserChatBubble key={msg.id} message={msg} />
              )
            )}
            {assistantMessageLoading && !loading && (
              <div className="px-4 py-2 text-gray-500">Assistant is typing...</div>
            )}
            <div ref={chatEndRef} />
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

