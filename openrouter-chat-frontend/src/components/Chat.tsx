import React, { useEffect, useRef } from 'react';
import ModelSelector from './ModelSelector';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  messages: Message[];
  loading: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, loading }) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div className="flex-1 p-4 bg-gray-50 overflow-auto pb-32" style={{ height: '100vh', boxSizing: 'border-box' }}>
      <div className="fixed top-0 left-0 w-full z-20 flex items-start bg-gray-50 p-4 border-b border-gray-200">
        <div className="mr-6">
          <ModelSelector />
        </div>
      </div>
      <div className="space-y-2 pt-24">
        {messages.map(msg =>
          msg.role === 'user' ? (
            <div
              key={msg.id}
              className="ml-auto bg-blue-500 text-white p-3 rounded-xl max-w-3/4 w-fit shadow-md"
              style={{ maxWidth: '75%' }}
            >
              {msg.content}
            </div>
          ) : (
            <div
              key={msg.id}
              className="w-full text-gray-900 bg-transparent px-2 py-3 text-base"
              style={{ maxWidth: '100%' }}
            >
              {msg.content}
            </div>
          )
        )}
        {loading && (
          <div className="px-4 py-2 text-gray-500">Assistant is typing...</div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default Chat;
