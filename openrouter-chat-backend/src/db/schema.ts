import { pgTable, integer, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chat_id: uuid('chat_id').notNull().references(() => chats.id),
  user_id: integer('user_id').notNull().references(() => users.id),
  role: text('role').notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  model: text('model'), // model from which message was generated (null for user)
  provider: text('provider'), // provider for assistant message (null for user)
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});