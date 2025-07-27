import { useState, useEffect } from 'react';
import type { StreamVideoClient } from '@stream-io/video-react-sdk';

interface CallStatus {
  isLive: boolean;
  participantCount: number;
  loading: boolean;
  error: string | null;
}

export function useCallStatus(callId: string, videoClient: StreamVideoClient | null): CallStatus {
  const [status, setStatus] = useState<CallStatus>({
    isLive: false,
    participantCount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!videoClient || !callId) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkCallStatus = async () => {
      try {
        // Query calls to check if our specific call is active
        const response = await videoClient.queryCalls({
          filter_conditions: {
            id: callId
          },
          limit: 1
        });

        if (response.calls && response.calls.length > 0) {
          const call = response.calls[0];
          // Check if call has active participants using the correct API structure
          const isActive = call.state?.members && Object.keys(call.state.members).length > 0;
          const participantCount = call.state?.members ? Object.keys(call.state.members).length : 0;

          setStatus({
            isLive: isActive,
            participantCount,
            loading: false,
            error: null
          });
        } else {
          // Call doesn't exist or has no active session
          setStatus({
            isLive: false,
            participantCount: 0,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error checking call status:', error);
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to check call status'
        }));
      }
    };

    // Initial check
    checkCallStatus();

    // Set up polling every 5 seconds
    intervalId = setInterval(checkCallStatus, 5000);

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [callId, videoClient]);

  return status;
}