import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { RegisterRequest, LoginRequest, JWTPayload } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const SALT_ROUNDS = 12;

export class AuthService {
  async register(data: RegisterRequest) {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT', // Default role
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return newUser;
  }

  async login(data: LoginRequest) {
    const { email, password } = data;

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d', // Token expires in 7 days
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserById(id: number) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id));

    return user || null;
  }
}

// Authentication middleware
export function authenticateToken(token: string) {
  const authService = new AuthService();
  return authService.verifyToken(token);
}