import { db } from '../db';
import { users } from '../schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function registerUser(email: string, password: string) {
  try {
    console.log("Registering user", email);
    const existing = await db.select().from(users).where(eq(users.email, email));
    console.log("Registering user1", email);
    if (existing.length > 0) {
      throw new Error('User already exists');
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ email, password_hash }).returning();
    return user;

  } catch(e) {
    console.error("Error registering user", e);
    throw new Error('Error registering user');
  }
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');
  return user;
}
