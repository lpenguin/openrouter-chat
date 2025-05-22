import { z } from 'zod';

export const settingsSchema = z.object({
  operouter: z.object({
    token: z.string(),
  }),
  defaultModel: z.string().default('openai/gpt-3.5-turbo'),
  defaultProvider: z.enum(['openrouter']).default('openrouter'),
});

export type Settings = z.infer<typeof settingsSchema>;