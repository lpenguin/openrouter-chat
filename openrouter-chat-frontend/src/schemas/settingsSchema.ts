import { z } from 'zod';

export const settingsSchema = z.object({
  operouter: z.object({
    token: z.string(),
  }),
  theme: z.string().default('github'),
  defaultModel: z.string().optional(),
});

export type Settings = z.infer<typeof settingsSchema>;
