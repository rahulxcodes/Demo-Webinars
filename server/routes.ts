import type { Express } from "express";
import { createServer, type Server } from "http";
import { StreamClient } from '@stream-io/node-sdk';
import { tokenRequestSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiKey = process.env.STREAM_API_KEY || process.env.VITE_STREAM_API_KEY || "default_key";
  const apiSecret = process.env.STREAM_API_SECRET || process.env.VITE_STREAM_API_SECRET || "default_secret";

  const streamClient = new StreamClient(apiKey, apiSecret);

  // Generate Stream token for user authentication
  app.post("/api/token", async (req, res) => {
    try {
      const validation = tokenRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: validation.error.errors 
        });
      }

      const { userId, callId } = validation.data;

      // Generate token for the user
      const token = streamClient.generateUserToken({ user_id: userId });

      res.json({
        token,
        apiKey,
      });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  // Create or get call
  app.post("/api/call", async (req, res) => {
    try {
      const { callId, userId } = req.body;
      
      if (!callId || !userId) {
        return res.status(400).json({ message: "Call ID and User ID are required" });
      }

      res.json({
        callId,
        created: true,
      });
    } catch (error) {
      console.error("Call creation error:", error);
      res.status(500).json({ message: "Failed to create call" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
