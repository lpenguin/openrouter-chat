import { ChatSchema, MessageSchema, Chat, Message } from '../schemas/chatSchema';
import { z } from 'zod';

const API = '/api';

export async function createChat(token: string): Promise<Chat> {
  const res = await fetch(`${API}/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create chat');
  return ChatSchema.parse(data.chat);
}

export async function listChats(token: string): Promise<Chat[]> {
  const res = await fetch(`${API}/chats`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list chats');
  return z.array(ChatSchema).parse(data.chats);
}

export async function getMessages(chatId: string, token: string): Promise<Message[]> {
  const res = await fetch(`${API}/chat/${chatId}/messages`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get messages');
  return z.array(MessageSchema).parse(data.messages);
}

export async function sendMessageToChat({ chatId, content, model, token }: {
  chatId: string,
  content: string,
  model: string,
  token: string,
}): Promise<Message> {
  const res = await fetch(`${API}/chat/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, model }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send message');
  return MessageSchema.parse(data.message);
}
