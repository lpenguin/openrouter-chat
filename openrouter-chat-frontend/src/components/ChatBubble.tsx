import React from 'react';

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, isUser }) => {
  if (!isUser) {
    // Agent message: just padded text, full width
    return (
      <div style={{ textAlign: 'left', fontSize: 16, color: 'var(--gray-12, #222)', width: '100%', padding: '8px' }}>
        {content}
      </div>
    );
  }
  // User message: callout with black text, min width 570px, gray color
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0' }}>
      <div style={{ backgroundColor: 'var(--gray-3, #f0f0f0)', borderRadius: '8px', padding: '8px', minWidth: 570, maxWidth: 320 }}>
        <span style={{ color: '#111', fontSize: 16 }}>
          {content}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
