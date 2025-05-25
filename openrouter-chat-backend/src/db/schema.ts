import { pgTable, integer, text, timestamp, uuid, customType, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { InferInsertModel, type InferSelectModel } from 'drizzle-orm';

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable('settings', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id),
  settings_json: text('settings_json').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: integer('user_id').notNull().references(() => users.id),
  name: text('name').default('New Chat'),
  model: text('model').notNull(), // default model for the chat
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type DbSelectChat = InferSelectModel<typeof chats>;
export type DbInsertChat = InferInsertModel<typeof chats>;

export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chat_id: uuid('chat_id').notNull().references(() => chats.id),
  user_id: integer('user_id').notNull().references(() => users.id),
  role: messageRoleEnum('role').notNull(), // 'user' or 'assistant', now enforced as enum
  content: text('content').notNull(),
  model: text('model'), // model from which message was generated (null for user)
  provider: text('provider'), // provider for assistant message (null for user)
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  annotations: jsonb('annotations'), // JSON, optional
});

export type DbSelectMessage = InferSelectModel <typeof messages>;
export type DbInsertMessage = InferInsertModel<typeof messages>;

export const attachments = pgTable('attachments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  message_id: uuid('message_id').notNull().references(() => messages.id),
  user_id: integer('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  mimetype: text('mimetype').notNull(),
  data: bytea('data').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type DbSelectAttachment = InferSelectModel<typeof attachments>;
export type DbInsertAttachment = InferInsertModel<typeof attachments>;