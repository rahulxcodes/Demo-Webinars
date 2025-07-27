import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StreamClient } from '@stream-io/node-sdk';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { RegisterRequest, LoginRequest, JWTPayload } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const SALT_ROUNDS = 12;

export class AuthService {
  private streamClient: StreamClient;

  constructor() {
    const apiKey = process.env.STREAM_API_KEY || process.env.VITE_STREAM_API_KEY || "";
    const apiSecret = process.env.STREAM_API_SECRET || process.env.VITE_STREAM_API_SECRET || "";
    this.streamClient = new StreamClient(apiKey, apiSecret);
  }
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

    // Create or update user in Stream (without role - Stream doesn't use predefined roles)
    try {
      await this.streamClient.upsertUsers([
        {
          id: user.id.toString(),
          name: user.name,
          custom: {
            role: user.role.toLowerCase(),
            email: user.email,
          }
        }
      ]);
    } catch (error) {
      console.error('Failed to upsert user in Stream:', error);
      console.error('Stream error details:', error.message || error);
      throw new Error(`Failed to initialize video service: ${error.message || 'Unknown error'}`);
    }

    // Generate Stream token for this specific user with longer expiration (24 hours)
    const streamToken = this.streamClient.generateUserToken({
      user_id: user.id.toString(),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    });

    // Generate JWT token
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const authToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d', // Token expires in 7 days
    });

    return {
      token: authToken,
      streamToken,
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