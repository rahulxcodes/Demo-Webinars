import { useState, useCallback } from 'react';
import { StreamVideoClient, User } from '@stream-io/video-react-sdk';
import { createStreamClient, disconnectStreamClient } from '@/lib/stream';
import { apiRequest } from '@/lib/queryClient';
import { TokenResponse } from '@shared/schema';

export const useStream = () => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = useCallback(async (userId: string, userName: string, callId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get token from backend
      const response = await fetch(`http://localhost:3001/token?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get token');
      }

      const tokenData = await response.json();
      
      // For now, we'll use a default API key since we need Stream credentials
      const apiKey = 'default_key';

      const user: User = {
        id: userId,
        name: userName,
      };

      const streamClient = createStreamClient({
        apiKey: apiKey,
        token: tokenData.token,
        user,
      });

      setClient(streamClient);
      return streamClient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Stream client';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectStreamClient();
    setClient(null);
    setError(null);
  }, []);

  return {
    client,
    isLoading,
    error,
    initializeClient,
    disconnect,
  };
};
