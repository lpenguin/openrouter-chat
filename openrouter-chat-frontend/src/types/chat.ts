export interface Chat {
  id: string;
  name: string;
  model: string;
}

interface BaseMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface UserMessage extends BaseMessage {
  role: 'user';
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  model: string;
}

export type Message = UserMessage | AssistantMessage;