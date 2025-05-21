import React, { useState } from 'react';

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
    <div className="py-4">
      <div className="m-auto w-full max-w-2xl flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg">
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base"
          placeholder="Type your message..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-150 disabled:opacity-50 shadow"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
        >
          Send
        </button>
      </div>
    </div>

  );
};

export default ChatInput;
