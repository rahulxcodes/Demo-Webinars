import { users, calls, callParticipants, type User, type InsertUser, type Call, type InsertCall, type CallParticipant, type InsertCallParticipant } from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Call operations
  getCall(callId: string): Promise<Call | undefined>;
  getCallById(id: number): Promise<Call | undefined>;
  createCall(insertCall: InsertCall): Promise<Call>;
  endCall(callId: string): Promise<void>;
  getActiveCalls(): Promise<Call[]>;
  
  // Call participant operations
  addParticipant(insertParticipant: InsertCallParticipant): Promise<CallParticipant>;
  removeParticipant(callId: number, userId: number): Promise<void>;
  getCallParticipants(callId: number): Promise<CallParticipant[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCall(callId: string): Promise<Call | undefined> {
    const [call] = await db.select().from(calls).where(eq(calls.callId, callId));
    return call || undefined;
  }

  async getCallById(id: number): Promise<Call | undefined> {
    const [call] = await db.select().from(calls).where(eq(calls.id, id));
    return call || undefined;
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const [call] = await db
      .insert(calls)
      .values(insertCall)
      .returning();
    return call;
  }

  async endCall(callId: string): Promise<void> {
    await db
      .update(calls)
      .set({ 
        isActive: false, 
        endedAt: new Date() 
      })
      .where(eq(calls.callId, callId));
  }

  async getActiveCalls(): Promise<Call[]> {
    return await db
      .select()
      .from(calls)
      .where(eq(calls.isActive, true));
  }

  async addParticipant(insertParticipant: InsertCallParticipant): Promise<CallParticipant> {
    const [participant] = await db
      .insert(callParticipants)
      .values(insertParticipant)
      .returning();
    return participant;
  }

  async removeParticipant(callId: number, userId: number): Promise<void> {
    await db
      .update(callParticipants)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(callParticipants.callId, callId),
          eq(callParticipants.userId, userId),
          isNull(callParticipants.leftAt)
        )
      );
  }

  async getCallParticipants(callId: number): Promise<CallParticipant[]> {
    return await db
      .select()
      .from(callParticipants)
      .where(
        and(
          eq(callParticipants.callId, callId),
          isNull(callParticipants.leftAt)
        )
      );
  }
}

export const storage = new DatabaseStorage();
