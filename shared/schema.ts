import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Calls table
export const calls = pgTable("calls", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  callId: text("call_id").unique().notNull(),
  title: text("title"),
  createdById: integer("created_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

// Call participants table
export const callParticipants = pgTable("call_participants", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  callId: integer("call_id").references(() => calls.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdCalls: many(calls),
  callParticipants: many(callParticipants),
}));

export const callsRelations = relations(calls, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [calls.createdById],
    references: [users.id],
  }),
  participants: many(callParticipants),
}));

export const callParticipantsRelations = relations(callParticipants, ({ one }) => ({
  call: one(calls, {
    fields: [callParticipants.callId],
    references: [calls.id],
  }),
  user: one(users, {
    fields: [callParticipants.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  createdAt: true,
  endedAt: true,
});

export const insertCallParticipantSchema = createInsertSchema(callParticipants).omit({
  id: true,
  joinedAt: true,
  leftAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type CallParticipant = typeof callParticipants.$inferSelect;
export type InsertCallParticipant = z.infer<typeof insertCallParticipantSchema>;

// API schemas
export const tokenRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  callId: z.string().min(1, "Call ID is required"),
});

export const tokenResponseSchema = z.object({
  token: z.string(),
  apiKey: z.string(),
});

export type TokenRequest = z.infer<typeof tokenRequestSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

export const joinCallSchema = z.object({
  name: z.string().min(1, "Name is required"),
  callId: z.string().min(1, "Call ID is required"),
});

export type JoinCallRequest = z.infer<typeof joinCallSchema>;
