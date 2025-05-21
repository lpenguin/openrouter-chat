import { db } from '../db';
import { settings } from '../schema';
import { eq } from 'drizzle-orm';
import { settingsSchema } from '../settingsSchema';

export async function getUserSettings(userId: number) {
  const result = await db.select().from(settings).where(eq(settings.user_id, userId));
  if (!result[0]) return null;
  try {
    return settingsSchema.parse(JSON.parse(result[0].settings_json));
  } catch (e) {
    return null;
  }
}

export async function setUserSettings(userId: number, settingsObj: unknown) {
  const parsed = settingsSchema.parse(settingsObj);
  const settingsJson = JSON.stringify(parsed);
  const existing = await db.select().from(settings).where(eq(settings.user_id, userId));
  if (existing[0]) {
    await db.update(settings).set({ settings_json: settingsJson, updated_at: new Date() }).where(eq(settings.user_id, userId));
  } else {
    await db.insert(settings).values({ user_id: userId, settings_json: settingsJson });
  }
  return parsed;
}