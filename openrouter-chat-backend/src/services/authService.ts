import { db, users } from '../db';
import { ApiError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function registerUser(email: string, password: string) {
  try {
    console.log("Registering user", email);
    const existing = await db.select().from(users).where(eq(users.email, email));
    console.log("Registering user1", email);
    if (existing.length > 0) {
      throw new ApiError('User already exists', 409);
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ email, password_hash }).returning();
    return user;

  } catch(e) {
    console.error("Error registering user", e);
    if (e instanceof ApiError) {
      throw e; // Re-throw API errors as-is
    }
    throw new ApiError('Error registering user', 500);
  }
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new ApiError('Invalid credentials', 401);
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError('Invalid credentials', 401);
  return user;
}
