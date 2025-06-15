import { useRef, useState, useEffect } from 'react';
import UpperBar from './UpperBar';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import AuthRequired from './AuthRequired';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useErrorStore } from '../store/errorStore';
import { useMessages } from '../hooks/useMessages';
import { useStreaming } from '../hooks/useStreaming';
import { useModelSelection } from '../hooks/useModelSelection';
import { useChatTransition } from '../hooks/useChatTransition';
import { useScrollBehavior } from '../hooks/useScrollBehavior';
import * as chatService from '../services/chatService';
import { Message } from '../types/chat';

interface ChatProps {
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
  onNewChatId?: (id: string) => void;
}

export default function Chat({ sidebarVisible, onToggleSidebar, isMobile, onNewChatId }: ChatProps) {
  const authUser = useAuthStore((state) => state.authUser);
  const { currentChatId, getChatById, updateChatUpdatedAt } = useChatStore();
  const { addError } = useErrorStore();
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [assistantMessageLoading, setAssistantMessageLoading] = useState(false);

  if (!authUser) return <AuthRequired />;

  // Custom hooks for separated concerns
  const { messages, loading, addMessage, updateMessage } = useMessages({
    chatId: currentChatId,
    token: authUser.token,
    onError: (error) => addError({ message: error }),
  });

  const { model, setModel } = useModelSelection(currentChatId);

  const { isTransitioning, createRealChatFromTemp } = useChatTransition({
    token: authUser.token,
    model,
    onNewChatId,
    onError: (error) => addError({ message: error }),
  });

  // Helper function to update last assistant message during streaming
  const updateLastAssistantMessage = (delta: string, done = false) => {
    // Find the last assistant message and update it
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && (lastMessage as any).status === 'generating') {
      const updates: Partial<Message> = {
        content: lastMessage.content + delta,
      };
      if (done) {
        (updates as any).status = 'complete';
      }
      updateMessage(lastMessage.id, updates);
    }
  };

  const { streaming, startStreaming, stopStreaming } = useStreaming({
    chatId: currentChatId,
    token: authUser.token,
    onMessageUpdate: updateLastAssistantMessage,
    onError: (error) => addError({ message: error }),
  });

  useScrollBehavior({ messages, lastMessageRef, chatId: currentChatId, loading });

  // Auto-resume streaming if last message is assistant and status is 'generating'
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
  }, [messages, streaming, currentChatId, startStreaming]);

  const handleSend = async (content: string, attachments?: { filename: string; mimetype: string; data: string }[], useSearch?: boolean) => {
    if ((!content.trim() && (!attachments || attachments.length === 0)) || !authUser) return;

    // Add user message immediately
    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        mimetype: att.mimetype,
        data: att.data
      }))
    };

    addMessage(userMsg);
    setAssistantMessageLoading(true);

    let chatId = currentChatId;
    
    // Create chat if needed
    if (!chatId) {
      try {
        chatId = await createRealChatFromTemp(content);
      } catch (error) {
        setAssistantMessageLoading(false);
        return;
      }
    }

    // Send message to backend
    try {
      const { messageId } = await chatService.sendMessageToChat({
        chatId,
        content,
        model: model!,
        token: authUser.token,
        attachments,
        useSearch,
      });
      
      updateChatUpdatedAt(chatId, new Date());

      // Add assistant message echo for streaming
      const assistantEcho: Message = {
        id: messageId,
        role: 'assistant',
        content: '',
        model: model || '',
        status: 'generating' as any,
      };
      addMessage(assistantEcho);

      // Start streaming
      startStreaming(chatId);
    } catch (error) {
      addError({
        message: error instanceof Error ? error.message : 'Failed to send message',
      });
    } finally {
      setAssistantMessageLoading(false);
    }
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
  };

  const handleStopStreaming = async () => {
    await stopStreaming();
    // Mark current generating message as complete
    updateLastAssistantMessage('', true);
  };

  // Get current chat name
  const currentChat = currentChatId ? getChatById(currentChatId) : null;
  const chatName = currentChat?.name || null;

  return (
    <div className={`h-[100svh] flex flex-col ${sidebarVisible ? 'flex-1' : 'w-full'}`}>
      <UpperBar
        currentModel={model}
        onModelChange={handleModelChange}
        className="w-full bg-white border-b border-theme shadow-sm p-3 flex items-center justify-between flex-shrink-0"
        chatName={chatName}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={onToggleSidebar}
        isMobile={isMobile}
      />
      
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <ChatMessages
          ref={lastMessageRef}
          messages={messages}
          loading={loading}
          assistantMessageLoading={assistantMessageLoading}
        />
        
        <div className="flex-shrink-0 bg-gradient-to-t from-white via-white/80 to-transparent">
          <ChatInput
            onSend={handleSend}
            onStop={handleStopStreaming}
            sendDisabled={loading || assistantMessageLoading || isTransitioning}
            streaming={streaming}
          />
        </div>
      </div>
    </div>
  );
}
