import React, { useState } from 'react';
import { TextField, Button, Flex } from '@radix-ui/themes';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Flex gap="2" style={{ width: '100%', maxWidth: '760px', margin: '0 auto', padding: 8, borderTop: '1px solid var(--gray-6, #e5e7eb)', background: 'var(--color-panel, #fff)', alignItems: 'center' }}>
      <TextField.Root
        style={{ flex: 1 }}
        placeholder="Type your message..."
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Button
        color="blue"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
      >
        Send
      </Button>
    </Flex>
  );
};

export default ChatInput;
