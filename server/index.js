import express from 'express';
import cors from 'cors';
import { StreamClient } from '@stream-io/node-sdk';
import { storage } from './storage.ts';
import { joinCallSchema } from '../shared/schema.ts';

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize StreamClient
const apiKey = process.env.STREAM_API_KEY || process.env.VITE_STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET || process.env.VITE_STREAM_API_SECRET;

// Token endpoint
app.get('/token', (req, res) => {
  try {
    // Check for missing credentials
    if (!apiKey || !apiSecret) {
      return res.status(500).json({ 
        error: 'Stream API credentials not configured. Please set STREAM_API_KEY and STREAM_API_SECRET environment variables.' 
      });
    }

    // Get userId from query parameters
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'userId is required as a query parameter' 
      });
    }

    // Initialize StreamClient and generate token
    const streamClient = new StreamClient(apiKey, apiSecret);
    const token = streamClient.generateUserToken({ user_id: userId });

    res.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message 
    });
  }
});

// Join call endpoint with database integration
app.post('/join-call', async (req, res) => {
  try {
    const validation = joinCallSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: validation.error.errors 
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
    console.error('Join call error:', error);
    res.status(500).json({ 
      error: 'Failed to join call',
      details: error.message 
    });
  }
});

// Get active calls
app.get('/calls', async (req, res) => {
  try {
    const activeCalls = await storage.getActiveCalls();
    res.json(activeCalls);
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({ 
      error: 'Failed to get calls',
      details: error.message 
    });
  }
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});