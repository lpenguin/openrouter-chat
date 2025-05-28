import React from 'react';
import Markdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import MessageAttachment from './MessageAttachment';
import { MessageAttachment as MessageAttachmentType } from '../types/chat';
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks';

interface ChatBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  attachments?: MessageAttachmentType[];
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, role, attachments }) => {
  if (role === 'assistant') {
    // Agent message: just padded text, full width
    return (
      <div className="text-left text-[16px] w-full p-2">
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((attachment, index) => (
              <MessageAttachment key={attachment.id || `temp-${index}`} attachment={attachment} />
            ))}
          </div>
        )}
        <div className="markdown">
          <Markdown
            children={content}
            remarkPlugins={[remarkGfm]}
            components={{
              code({children, className}) {
                const match = /language-(\w+)/.exec(className || '')
                const codeString = String(children).replace(/\n$/, '')
                if (match) {
                  return <CodeBlock code={codeString} language={match[1]} />
                }
                return (
                  <code className={className}>
                    {children}
                  </code>
                )
              }
          }}
          />
        </div>
      </div>
    );
  }
  // User message: callout with themed background and text
  return (
    <div className="flex justify-end my-1">
      <div className="bg-theme-surface rounded-lg p-2 max-w-xs border border-theme">
        {attachments && attachments.length > 0 && (
          <div className="flex flex-col gap-1 mb-2 w-full">
            {attachments.map((attachment, index) => (
              <MessageAttachment key={attachment.id || `temp-${index}`} attachment={attachment} />
            ))}
          </div>
        )}
        <span className="text-[16px]">
          <Markdown remarkPlugins={[remarkBreaks]}>{content}</Markdown>
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
