import { Message } from '../types/chat';

export async function fetchMessages(): Promise<Message[]> {
  const res = await fetch('/api/messages');
  const data = await res.json();
  return data.messages;
}

export async function sendMessage(content: string): Promise<Message> {
  const res = await fetch('/api/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  return data.reply;
}
