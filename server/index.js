import express from 'express';
import cors from 'cors';
import { StreamClient } from '@stream-io/node-sdk';

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

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});