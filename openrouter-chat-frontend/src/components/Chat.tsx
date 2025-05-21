import React, { useEffect, useRef, useState } from 'react';
import ModelSelector from './ModelSelector';
import ChatInput from './ChatInput';
import ChatBubble from './ChatBubble';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import * as chatService from '../services/chatService';
import { Message } from '../schemas/chatSchema';

interface ChatProps {
  chatUuid: string;
}

const Chat: React.FC<ChatProps> = ({ chatUuid }) => {
  const authUser = useAuthStore((state) => state.authUser);
  if (!authUser) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Please log in to access the chat.</p>
    </div>
  );
  const { messages, setMessages, addMessage, loading, setLoading , getChatById} = useChatStore();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [assistantMessageLoading, setAssistantMessageLoading] = useState(false);
  const chat = getChatById(chatUuid);
  if (!chat) return null;

  // Dummy stub for loading state
  const loadingStub = [
    { id: 'stub-1', role: 'user' as 'user', content: 'Loading...', chat_id: chatUuid, model: null, provider: null, user_id: 0, created_at: '', updated_at: '' },
    { id: 'stub-2', role: 'assistant' as 'assistant', content: 'Loading...', chat_id: chatUuid, model: null, provider: null, user_id: 0, created_at: '', updated_at: '' },
  ];

  // Load messages when chatUuid changes
  useEffect(() => {
    if (!chatUuid) return;
    (async () => {
      setLoading(true);
      const msgs = await chatService.getMessages(chatUuid, authUser.token);
      setMessages(msgs);
      setLoading(false);
    })();
  }, [chatUuid, setMessages, setLoading]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSend = async (content: string) => {
    if (!chatUuid || !content.trim() || !authUser) return;
    setAssistantMessageLoading(true);
    // Add user message to store immediately
    const userMsg = {
      id: `${Date.now()}-user`,
      chat_id: chatUuid,
      role: 'user' as 'user',
      content,
      model: null,
      provider: null,
      user_id: authUser.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addMessage(userMsg);
    // Send to backend and add assistant message to store
    const assistantMsg = await chatService.sendMessageToChat({ chatId: chatUuid, content, model: chat.model, token: authUser.token });
    addMessage(assistantMsg);
    setAssistantMessageLoading(false);
  };

  return (
    <div className="h-screen w-screen">
      {/* Model Selector at top where the panel used to be */}
      <div className="absolute">
        <ModelSelector />
      </div>
      <div className="flex flex-col h-screen">
        {/* ChatMessages - Scrollable area */}
        <div className="flex-1 w-full overflow-y-auto max-w-2xl m-auto">
          <div className="w-full max-w-2xl mx-auto flex flex-col space-y-3 px-4 py-4">
            {(loading ? loadingStub : messages).map((msg: Message) =>
              <ChatBubble
                key={msg.id}
                content={msg.content}
                role={msg.role}
              />
            )}
            {assistantMessageLoading && !loading && (
              <div className="px-4 py-2 text-gray-500">Assistant is typing...</div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        {/* SendButton - Fixed at bottom */}
        <div className="w-full border-t border-gray-200 bg-white sticky bottom-0 z-10">
          <ChatInput
            onSend={handleSend}
            disabled={loading || assistantMessageLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
