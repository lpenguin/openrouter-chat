import React from 'react';

interface ChatBubbleProps {
  content: string;
  role: 'user' | 'assistant';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, role }) => {
  if (role === 'assistant') {
    // Agent message: just padded text, full width
    return (
      <div className="text-left text-[16px] text-theme-primary w-full p-2">
        {content}
      </div>
    );
  }
  // User message: callout with themed background and text
  return (
    <div className="flex justify-end my-1">
      <div className="bg-theme-surface rounded-lg p-2 max-w-xs border border-theme">
        <span className="text-theme-primary text-[16px]">
          {content}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
