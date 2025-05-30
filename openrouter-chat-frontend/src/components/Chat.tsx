import { useEffect, useRef, useState } from 'react';
import ModelSelector from './ModelSelector';
import ChatInput from './ChatInput';
import { UserChatBubble, AssistantChatBubble, AssistantMessageWithAnnotations } from './ChatBubble';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import * as chatService from '../services/chatService';
import { Message } from '../types/chat';

// Dummy stub for loading state
const loadingStub: Message[] = [
  { id: 'stub-1', role: 'user' as 'user', content: 'Loading...', },
  { id: 'stub-2', role: 'assistant' as 'assistant', content: 'Loading...', model: '' },
];

export default () => {
  const authUser = useAuthStore((state) => state.authUser);
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
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [assistantMessageLoading, setAssistantMessageLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createRealChatFromTemp = async (firstMessageContent?: string) => {
    // Create real chat on server with the currently selected model and optional chatNameContent
    const realChat = await chatService.createChat(authUser.token, model || undefined, firstMessageContent);
    // Remove quotes from the chat name if present
    if (realChat.name) {
      realChat.name = realChat.name.replace(/^"|"$/g, '').trim();
    }
    addChat(realChat);
    setCurrentChatId(realChat.id);
    return realChat.id;
  };


  useEffect(() => {
    if (currentChatId) {
      const currentChat = getChatById(currentChatId);
      if (currentChat) {
        setModel(currentChat.model);
      }
    } else {
      setModel('openai/gpt-3.5-turbo');
    }
  }, [currentChatId]);

  useEffect(() => {
    if (isTransitioning) return;
    {
      (async () => {
        if (currentChatId !== null) {
          setLoading(true);
          const msgs = await chatService.getMessages(currentChatId, authUser.token);
          setMessages(msgs);
          setLoading(false);
        } else {
          setMessages([]);
        }
      })();
    }
  }, [currentChatId]);

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
      } catch (e) {
        throw e;
      } finally {
        setIsTransitioning(false);
      }
    }

    // Send to backend and add assistant message to store
    const assistantMsg = await chatService.sendMessageToChat({
      chatId,
      content,
      model: model!!,
      token: authUser.token,
      attachments,
      useSearch,
    });
    addMessage(assistantMsg);
    setAssistantMessageLoading(false);
  };

  const handleModelChange = (model: string) => {
    setModel(model);
  };
  return (
    <div className="h-screen w-screen">
      {/* Model Selector at top where the panel used to be */}
      <div className="absolute">
        <ModelSelector
          currentModel={model}
          onModelChange={handleModelChange}
         />
      </div>
      <div className="flex flex-col h-screen">
        {/* ChatMessages - Scrollable area */}
        <div className="flex-1 w-full overflow-y-auto max-w-2xl m-auto">
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
        {/* SendButton - Fixed at bottom */}
        <div className="w-full bg-gradient-to-b from-white/80 to-transparent sticky bottom-0 z-10">
          <ChatInput
            onSend={handleSend}
            sendDisabled={loading || assistantMessageLoading}
          />
        </div>
      </div>
    </div>
  );
};

