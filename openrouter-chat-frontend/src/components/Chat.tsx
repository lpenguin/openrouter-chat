import { Box, ScrollArea } from '@radix-ui/themes';
import ChatBubble from './ChatBubble';
import React from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  messages: Message[];
  loading: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, loading }) => (
  <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, padding: 16 }}>
    <Box asChild>
      <div className="space-y-2">
        {messages.map(msg => (
          <ChatBubble
            key={msg.id}
            content={msg.content}
            isUser={msg.role === 'user'}
          />
        ))}
        {loading && (
          <Box px="4" py="2" style={{ color: '#888' }}>
            Assistant is typing...
          </Box>
        )}
      </div>
    </Box>
  </ScrollArea>
);

export default Chat;
