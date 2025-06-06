import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;
