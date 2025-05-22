import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from "dotenv";

export { chats, messages, settings, users }  from "./schema";

dotenv.config({ path: ".env" });

// Use your Supabase connection string (service role recommended for migrations)
const databaseUrl = process.env.DATABASE_URL as string;
console.log("Connecting to database with connection string:", databaseUrl);

export const db = drizzle(databaseUrl);