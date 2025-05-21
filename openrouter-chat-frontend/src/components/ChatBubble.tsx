import React from 'react';

interface ChatBubbleProps {
  content: string;
  role: 'user' | 'assistant';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, role }) => {
  if (role === 'assistant') {
    // Agent message: just padded text, full width
    return (
      <div className="text-left text-[16px] text-gray-900 w-3/4 p-2">
        {content}
      </div>
    );
  }
  // User message: callout with black text, gray color
  return (
    <div className="flex justify-end my-1">
      <div className="bg-gray-100 rounded-lg p-2 max-w-xs">
        <span className="text-black text-[16px]">
          {content}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
