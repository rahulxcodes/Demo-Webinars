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
        console.log(`[useCallStatus] Checking status for call ID: ${callId}`);
        
        // Query calls to check if our specific call is active
        const response = await videoClient.queryCalls({
          filter_conditions: {
            id: callId
          },
          limit: 10
        });

        console.log(`[useCallStatus] Query response:`, response);

        if (response.calls && response.calls.length > 0) {
          const call = response.calls[0];
          console.log(`[useCallStatus] Found call:`, call);
          console.log(`[useCallStatus] Call state:`, call.state);
          console.log(`[useCallStatus] Call members:`, call.state?.members);
          console.log(`[useCallStatus] Call session:`, call.session);
          console.log(`[useCallStatus] Call participants:`, call.state?.participants);
          console.log(`[useCallStatus] Call recording:`, call.state?.recording);
          console.log(`[useCallStatus] Call backstage:`, call.backstage);
          
          // Check multiple indicators for an active call
          const hasMembers = call.state?.members && Object.keys(call.state.members).length > 0;
          const hasParticipants = call.state?.participants && call.state.participants.length > 0;
          const isRecording = call.state?.recording === true;
          
          // For queryCalls, the main indicator is call.state.members
          const isActive = hasMembers || hasParticipants || isRecording;
          const participantCount = call.state?.members ? Object.keys(call.state.members).length : 
                                 (call.state?.participants?.length || 0);

          console.log(`[useCallStatus] Status - isActive: ${isActive}, participantCount: ${participantCount}`);

          setStatus({
            isLive: isActive,
            participantCount,
            loading: false,
            error: null
          });
        } else {
          console.log(`[useCallStatus] No calls found for ID: ${callId}`);
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

    // Set up polling every 3 seconds for faster detection
    intervalId = setInterval(checkCallStatus, 3000);

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [callId, videoClient]);

  return status;
}