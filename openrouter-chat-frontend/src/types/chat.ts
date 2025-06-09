export interface Chat {
  id: string;
  name: string;
  model: string;
}

export interface MessageAttachment {
  id?: number; // Optional numeric ID (missing for local echo, present for server attachments)
  filename: string;
  mimetype: string;
  size?: number;
  uploadedAt?: string;
  data?: string; // For temporary local echo before upload
}

interface BaseMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: MessageAttachment[];
  status?: 'generating' | 'complete' | null; // Streaming status
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserMessage extends BaseMessage {
  role: 'user';
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  model: string;
  provider?: string;
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

export type Message = UserMessage | AssistantMessage;