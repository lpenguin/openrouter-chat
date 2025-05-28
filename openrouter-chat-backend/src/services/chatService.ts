import { db, chats, messages } from '../db';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { getUserSettings } from './settingsService';
import { attachments, DbInsertAttachment, DbInsertMessage, DbSelectAttachment, DbSelectChat, DbSelectMessage } from '../db/schema';

export async function createChat({ userId, model }: { userId: number; model?: string }): Promise<DbSelectChat> {
  const now = new Date();
  const userSettings = await getUserSettings(userId);
  const finalModel = model ?? userSettings.defaultModel ?? 'openai/gpt-3.5-turbo';
  const resultChats = await db.insert(chats).values({
    user_id: userId,
    model: finalModel,
    created_at: now,
    updated_at: now,
  }).returning();
  return resultChats[0];
}

export async function listChats(userId: number) {
  return db.select().from(chats).where(eq(chats.user_id, userId)).orderBy(desc(chats.updated_at));
}

export async function getChatById(chatId: string) {
  const chatArr = await db.select().from(chats).where(eq(chats.id, chatId));
  return chatArr[0];
}

export async function insertMessage(message: DbInsertMessage): Promise<DbSelectMessage> {
  const [msg] = await db.insert(messages).values(message).returning();
  return msg;
}

export async function insertAttachments(atts: DbInsertAttachment[]): Promise<number[]> {
  if (atts.length === 0) return [];
  return (await db.insert(attachments).values(atts).returning()).map(m => m.id);
}

export async function getAttachmentsForMessage(messageId: string): Promise<DbSelectAttachment[]> {
  return db.select().from(attachments).where(eq(attachments.message_id, messageId)).orderBy(attachments.created_at);
}

export async function getMessagesForChat(chatId: string): Promise<DbSelectMessage[]> {
  return db.select().from(messages).where(eq(messages.chat_id, chatId)).orderBy(messages.created_at);
}

export async function setChatModel(chatId: string, model: string) {
  const now = new Date();
  await db.update(chats).set({ model, updated_at: now }).where(eq(chats.id, chatId));
  return { id: chatId, model, updated_at: now };
}

export async function renameChat(chatId: string, name: string) {
  const now = new Date();
  const updated = await db.update(chats)
    .set({ name, updated_at: now })
    .where(eq(chats.id, chatId))
    .returning();
  return updated[0];
}

export async function deleteChat(chatId: string) {
  // First get all message IDs for this chat
  const messageIds = await db.select({ id: messages.id })
    .from(messages)
    .where(eq(messages.chat_id, chatId));
  
  // Delete attachments for all messages in this chat
  if (messageIds.length > 0) {
    await db.delete(attachments)
      .where(inArray(attachments.message_id, messageIds.map(m => m.id)));
  }
  
  // Delete messages for this chat
  await db.delete(messages).where(eq(messages.chat_id, chatId));
  
  // Delete the chat itself
  await db.delete(chats).where(eq(chats.id, chatId));
}
