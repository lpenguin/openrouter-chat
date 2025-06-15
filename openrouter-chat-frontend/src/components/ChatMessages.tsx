import { forwardRef } from 'react';
import { UserChatBubble, AssistantChatBubble, AssistantMessageWithAnnotations } from './ChatBubble';
import { Message } from '../types/chat';

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  assistantMessageLoading: boolean;
  className?: string;
}

// Dummy stub for loading state
const loadingStub: Message[] = [
  { id: 'stub-1', role: 'user' as 'user', content: 'Loading...', },
  { id: 'stub-2', role: 'assistant' as 'assistant', content: 'Loading...', model: '' },
];

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, loading, assistantMessageLoading, className = '' }, lastMessageRef) => {
    const displayMessages = loading ? loadingStub : messages;

    return (
      <div className={`flex-1 overflow-y-auto ${className}`}>
        <div className="w-full max-w-2xl mx-auto flex flex-col space-y-3 px-4 py-4">
          {displayMessages.map((msg: Message, index) => {
            const isLastMessage = index === displayMessages.length - 1;
            const ref = isLastMessage ? lastMessageRef : null;
            
            return msg.role === 'assistant' ? (
              <div key={msg.id} ref={ref}>
                <AssistantChatBubble message={msg as AssistantMessageWithAnnotations} />
              </div>
            ) : (
              <div key={msg.id} ref={ref} data-role="user">
                <UserChatBubble message={msg} />
              </div>
            );
          })}
          {assistantMessageLoading && !loading && (
            <div className="px-4 py-2 text-gray-500">Assistant is typing...</div>
          )}
          {/* Add bottom padding to ensure scrollability only when user has added messages */}
          {messages.some(msg => msg.role === 'user') && <div className="h-[calc(100vh-140px)]" />}
        </div>
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;
