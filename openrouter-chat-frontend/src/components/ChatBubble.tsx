import React from 'react';
import Markdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import MessageAttachment from './MessageAttachment';
import SearchCitation from './SearchCitation';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { AssistantMessage, UserMessage } from '../types/chat';

export interface AssistantMessageWithAnnotations extends AssistantMessage {
  searchAnnotations?: Array<{
    url: string;
    faviconUrl?: string;
    citation?: string;
    title?: string;
    content?: string;
    startIndex?: number;
    endIndex?: number;
  }>;
}

export const UserChatBubble: React.FC<{ message: UserMessage }> = ({ message }) => (
  <div className="flex justify-end my-1">
    <div className="bg-theme-surface rounded-lg p-2 max-w-xs border border-theme">
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex flex-col gap-1 mb-2 w-full">
          {message.attachments.map((attachment, index) => (
            <MessageAttachment key={attachment.id || `temp-${index}`} attachment={attachment} />
          ))}
        </div>
      )}
      <span className="text-[16px]">
        <Markdown remarkPlugins={[remarkBreaks]}>{message.content}</Markdown>
      </span>
    </div>
  </div>
);

export const AssistantChatBubble: React.FC<{ message: AssistantMessageWithAnnotations }> = ({ message }) => (
  <div className="text-left text-[16px] w-full p-2">
    {message.attachments && message.attachments.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-3">
        {message.attachments.map((attachment, index) => (
          <MessageAttachment key={attachment.id || `temp-${index}`} attachment={attachment} />
        ))}
      </div>
    )}
    <div className="markdown">
      <Markdown
        children={message.content}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ children, className }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            if (match) {
              return <CodeBlock code={codeString} language={match[1]} />;
            }
            return <code className={className}>{children}</code>;
          },
        }}
      />
    </div>
    {message.searchAnnotations && message.searchAnnotations.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-4">
        {message.searchAnnotations.map((ann, i) => (
          <div className="min-w-[220px] max-w-xs flex-1" key={ann.url + i}>
            <SearchCitation {...ann} />
          </div>
        ))}
      </div>
    )}
  </div>
);
