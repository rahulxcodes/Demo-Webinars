import type { Express } from "express";
import { createServer, type Server } from "http";
import { StreamClient } from '@stream-io/node-sdk';
import { joinCallSchema, insertUserSchema, insertCallSchema } from "@shared/schema";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiKey = process.env.STREAM_API_KEY || process.env.VITE_STREAM_API_KEY || "default_key";
  const apiSecret = process.env.STREAM_API_SECRET || process.env.VITE_STREAM_API_SECRET || "default_secret";

  const streamClient = new StreamClient(apiKey, apiSecret);

  // Generate Stream token for user authentication
  app.get("/api/token", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ 
          message: "userId is required" 
        });
      }

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

  // Join call endpoint
  app.post("/api/join-call", async (req, res) => {
    try {
      const validation = joinCallSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: validation.error.errors 
        });
      }

      const { name, callId } = validation.data;

      // Create or get user
      let user = await storage.getUserByEmail(`${name.toLowerCase().replace(/\s+/g, '')}@temp.com`);
      if (!user) {
        user = await storage.createUser({
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '')}@temp.com`,
        });
      }

      // Create or get call
      let call = await storage.getCall(callId);
      if (!call) {
        call = await storage.createCall({
          callId,
          title: `Call ${callId}`,
          createdById: user.id,
        });
      }

      // Add participant to call
      const existingParticipants = await storage.getCallParticipants(call.id);
      const isAlreadyParticipant = existingParticipants.some(p => p.userId === user.id);
      
      if (!isAlreadyParticipant) {
        await storage.addParticipant({
          callId: call.id,
          userId: user.id,
        });
      }

      res.json({
        call,
        user,
        participants: await storage.getCallParticipants(call.id),
      });
    } catch (error) {
      console.error("Join call error:", error);
      res.status(500).json({ message: "Failed to join call" });
    }
  });

  // Get active calls
  app.get("/api/calls", async (req, res) => {
    try {
      const activeCalls = await storage.getActiveCalls();
      res.json(activeCalls);
    } catch (error) {
      console.error("Get calls error:", error);
      res.status(500).json({ message: "Failed to get calls" });
    }
  });

  // Get call details
  app.get("/api/call/:callId", async (req, res) => {
    try {
      const { callId } = req.params;
      const call = await storage.getCall(callId);
      
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }

      const participants = await storage.getCallParticipants(call.id);
      
      res.json({
        call,
        participants,
      });
    } catch (error) {
      console.error("Get call error:", error);
      res.status(500).json({ message: "Failed to get call" });
    }
  });

  // End call
  app.post("/api/call/:callId/end", async (req, res) => {
    try {
      const { callId } = req.params;
      await storage.endCall(callId);
      
      res.json({ message: "Call ended successfully" });
    } catch (error) {
      console.error("End call error:", error);
      res.status(500).json({ message: "Failed to end call" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
