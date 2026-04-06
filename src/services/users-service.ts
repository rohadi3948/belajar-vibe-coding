import { db } from '../db';
import { users, sessions } from '../db/schema';
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

export const loginUser = async (payload: { email: string; password?: string }) => {
  // 1. Find user by email
  const [user] = await db.select().from(users).where(eq(users.email, payload.email)).limit(1);

  if (!user) {
    throw new Error('Email atau password salah');
  }

  // 2. Verify password
  const isPasswordValid = await Bun.password.verify(payload.password || '', user.password);

  if (!isPasswordValid) {
    throw new Error('Email atau password salah');
  }

  // 3. Generate token
  const token = crypto.randomUUID();

  // 4. Insert session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
};
