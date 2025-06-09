import { ChatSchema, MessageSchema } from '../schemas/chatSchema';
import { z } from 'zod';
import { Chat, Message } from '../types/chat';
import { httpClient, HttpError } from './httpClient';

export async function createChat(token: string, model?: string, chatNameContent?: string): Promise<Chat> {
  httpClient.setAuthToken(token);
  try {
    const body: any = model ? { model } : {};
    if (chatNameContent) body.chatNameContent = chatNameContent;
    
    const data = await httpClient.post<{ chat: any }>('/chats', body);
    return ChatSchema.parse(data.chat);
  } catch (error) {
    if (error instanceof HttpError) {
      // Re-throw with better context for specific errors
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (error.status === 400) {
        throw new Error(error.responseBody?.error || 'Invalid chat creation request.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  } finally {
    httpClient.clearAuthToken();
  }
}

export async function getChats(token: string): Promise<Chat[]> {
  httpClient.setAuthToken(token);
  try {
    const data = await httpClient.get<{ chats: any[] }>('/chats');
    return z.array(ChatSchema).parse(data.chats);
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  } finally {
    httpClient.clearAuthToken();
  }
}

export async function getMessages(chatId: string, token: string): Promise<Message[]> {
  httpClient.setAuthToken(token);
  try {
    const data = await httpClient.get<{ messages: any[] }>(`/chat/${chatId}/messages`);
    return z.array(MessageSchema).parse(data.messages);
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (error.status === 404) {
        throw new Error('Chat not found or you do not have permission to access it.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  } finally {
    httpClient.clearAuthToken();
  }
}

export async function sendMessageToChat({ chatId, content, model, token, attachments, useSearch }: {
  chatId: string,
  content: string,
  model: string,
  token: string,
  attachments?: { filename: string; mimetype: string; data: string }[],
  useSearch?: boolean,
}): Promise<{ messageId: string }> {
  httpClient.setAuthToken(token);
  try {
    const body: any = { content, model };
    if (attachments && attachments.length > 0) {
      body.attachments = attachments;
    }
    if (useSearch) {
      body.useSearch = true;
    }
    
    const data = await httpClient.post<{ messageId: string }>(`/chat/${chatId}/messages`, body);
    return { messageId: data.messageId };
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (error.status === 404) {
        throw new Error('Chat not found or you do not have permission to access it.');
      }
      if (error.status === 400) {
        throw new Error(error.responseBody?.error || 'Invalid message content or format.');
      }
      if (error.status === 413) {
        throw new Error('Message or attachments are too large.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  } finally {
    httpClient.clearAuthToken();
  }
}

export async function renameChat(chatId: string, name: string, token: string): Promise<Chat> {
  httpClient.setAuthToken(token);
  try {
    const data = await httpClient.put<{ chat: any }>(`/chat/${chatId}`, { name });
    return ChatSchema.parse(data.chat);
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (error.status === 404) {
        throw new Error('Chat not found or you do not have permission to access it.');
      }
      if (error.status === 400) {
        throw new Error(error.responseBody?.error || 'Invalid chat name.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  } finally {
    httpClient.clearAuthToken();
  }
}

export async function deleteChat(chatId: string, token: string): Promise<void> {
  httpClient.setAuthToken(token);
  try {
    const data = await httpClient.delete<{ success: boolean }>(`/chat/${chatId}`);
    if (!data.success) {
      throw new Error('Failed to delete chat');
    }
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (error.status === 404) {
        throw new Error('Chat not found or you do not have permission to access it.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  } finally {
    httpClient.clearAuthToken();
  }
}

export function streamAssistantMessage({
  chatId,
  token,
  onDelta,
  onDone,
  onError,
}: {
  chatId: string;
  token: string;
  onDelta: (delta: string) => void;
  onDone: () => void;
  onError: (err: any) => void;
}): EventSource {
  httpClient.setAuthToken(token);
  const url = `/stream-message/${chatId}`;
  const es = httpClient.streamSSE({
    url,
    onDelta,
    onDone,
    onError,
  });
  // Do NOT clear the auth token here; leave it set for the duration of the stream
  return es;
}
