import React from 'react';
import { Box, Flex, Callout } from '@radix-ui/themes';

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, isUser }) => {
  if (!isUser) {
    // Agent message: just padded text, full width
    return (
      <Box px="4" py="2" style={{ textAlign: 'left', fontSize: 16, color: 'var(--gray-12, #222)', width: '100%' }}>
        {content}
      </Box>
    );
  }
  // User message: callout with black text, min width 570px, gray color
  return (
    <Flex justify="end">
      <Callout.Root size="2" color="gray" variant="surface" style={{ minWidth: 570, maxWidth: 320, margin: '4px 0' }}>
        <Callout.Text style={{ color: '#111', fontSize: 16 }}>
          {content}
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
};

export default ChatBubble;
