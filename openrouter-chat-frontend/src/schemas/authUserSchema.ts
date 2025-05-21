import { z } from 'zod';
import { userSchema } from './userSchema';

export const authUserSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
