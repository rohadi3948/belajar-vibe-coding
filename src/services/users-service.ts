import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface RegisterUserPayload {
  name: string;
  email: string;
  password?: string;
}

export const registerUser = async (payload: RegisterUserPayload) => {
  // Check if user with this email already exists
  const existingUsers = await db.select().from(users).where(eq(users.email, payload.email));
  
  if (existingUsers.length > 0) {
    throw new Error('Email sudah terdaftar');
  }

  // Hash the password using Bun's built-in bcrypt
  const hashedPassword = await Bun.password.hash(payload.password || '', {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Insert the new user
  await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
  });

  return { message: 'OK' };
};
