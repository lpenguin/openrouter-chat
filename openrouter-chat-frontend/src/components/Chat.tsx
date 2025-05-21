import React, { useEffect, useRef } from 'react';
import ModelSelector from './ModelSelector';
import ChatInput from './ChatInput';
import ChatBubble from './ChatBubble';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  messages: Message[];
  loading: boolean;
  onSend: (content: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, loading, onSend }) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSend = (content: string) => {
    if (content.trim()) {
      onSend(content);
    }
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
            {messages.map(msg =>
              <ChatBubble
                key={msg.id}
                content={msg.content}
                role={msg.role}
              />
            )}
            {loading && (
              <div className="px-4 py-2 text-gray-500">Assistant is typing...</div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        {/* SendButton - Fixed at bottom */}
        <div className="w-full border-t border-gray-200 bg-white sticky bottom-0 z-10">
          <ChatInput
            onSend={handleSend}
            disabled={loading}
          />
        </div>
      </div> 
    </div>
  );
};

export default Chat;
