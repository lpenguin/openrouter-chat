import { db } from '../db';
import { chats, messages } from '../schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function createChat({ userId, model }: { userId: number, model: string }) {
  const now = new Date();
  const chatId = randomUUID();
  await db.insert(chats).values({
    id: chatId,
    user_id: userId,
    model,
    created_at: now,
    updated_at: now,
  });
  return { id: chatId, user_id: userId, model, created_at: now, updated_at: now };
}

export async function listChats(userId: number) {
  return db.select().from(chats).where(eq(chats.user_id, userId)).orderBy(desc(chats.updated_at));
}

export async function getChatById(chatId: string) {
  const chatArr = await db.select().from(chats).where(eq(chats.id, chatId));
  return chatArr[0];
}

export async function insertMessage({ chatId, userId, role, content, model, provider }: {
  chatId: string,
  userId: number,
  role: 'user' | 'assistant',
  content: string,
  model?: string | null,
  provider?: string | null,
}) {
  const now = new Date();
  const msgId = randomUUID();
  await db.insert(messages).values({
    id: msgId,
    chat_id: chatId,
    user_id: userId,
    role,
    content,
    model: model ?? null,
    provider: provider ?? null,
    created_at: now,
    updated_at: now,
  });
  return { id: msgId, chat_id: chatId, user_id: userId, role, content, model, provider, created_at: now, updated_at: now };
}

export async function getMessagesForChat(chatId: string) {
  return db.select().from(messages).where(eq(messages.chat_id, chatId)).orderBy(messages.created_at);
}
