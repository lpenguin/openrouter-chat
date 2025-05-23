import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface ChatInputProps {
  onSend: (content: string) => void;
  sendDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, sendDisabled }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Always focus textarea when enabled or after sending
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [sendDisabled, value]);

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue('');
      // Refocus the textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendDisabled) handleSend();
    }
  };

  return (
    <div className="py-4">
      <div className="m-auto w-full max-w-2xl flex items-center gap-2 bg-theme-surface border border-theme rounded-lg px-3 py-2 shadow-lg">
        <TextareaAutosize
          className="flex-1 bg-transparent outline-none text-theme-primary placeholder:text-theme-secondary text-base resize-none py-2"
          placeholder="Type your message..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          minRows={1}
          maxRows={8}
          ref={textareaRef}
        />
        <button
          className="bg-theme-primary hover:bg-theme-success text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-150 disabled:opacity-50 shadow cursor-pointer"
          onClick={handleSend}
          disabled={sendDisabled || !value.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
