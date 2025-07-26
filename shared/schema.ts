import { z } from "zod";

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
