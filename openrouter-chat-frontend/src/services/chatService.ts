import { ChatSchema, MessageSchema } from '../schemas/chatSchema';
import { z } from 'zod';
import { Chat, Message } from '../types/chat';
import { API_BASE_URL } from '../config/api';

export async function createChat(token: string, model?: string, chatNameContent?: string): Promise<Chat> {
  const body: any = model ? { model } : {};
  if (chatNameContent) body.chatNameContent = chatNameContent;
  const res = await fetch(`${API_BASE_URL}/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create chat');
  return ChatSchema.parse(data.chat);
}

export async function getChats(token: string): Promise<Chat[]> {
  const res = await fetch(`${API_BASE_URL}/chats`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list chats');
  return z.array(ChatSchema).parse(data.chats);
}

export async function getMessages(chatId: string, token: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get messages');
  return z.array(MessageSchema).parse(data.messages);
}

export async function sendMessageToChat({ chatId, content, model, token, attachments, useSearch }: {
  chatId: string,
  content: string,
  model: string,
  token: string,
  attachments?: { filename: string; mimetype: string; data: string }[],
  useSearch?: boolean,
}): Promise<Message> {
  const body: any = { content, model };
  if (attachments && attachments.length > 0) {
    body.attachments = attachments;
  }
  if (useSearch) {
    body.useSearch = true;
  }
  const res = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send message');
  return MessageSchema.parse(data.message);
}

export async function renameChat(chatId: string, name: string, token: string): Promise<Chat> {
  const res = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to rename chat');
  return ChatSchema.parse(data.chat);
}

export async function deleteChat(chatId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete chat');
  if (!data.success) throw new Error('Failed to delete chat');
}
