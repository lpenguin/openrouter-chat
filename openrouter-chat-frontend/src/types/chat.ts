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
}

export interface UserMessage extends BaseMessage {
  role: 'user';
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  model: string;
}

export type Message = UserMessage | AssistantMessage;