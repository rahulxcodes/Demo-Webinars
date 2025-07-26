import { useState, useEffect } from 'react';
import { StreamVideo, StreamCall, StreamTheme, SpeakerLayout, CallControls, StreamVideoClient } from '@stream-io/video-react-sdk';
import type { Call } from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function App() {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [callId, setCallId] = useState('');
  const [isCallJoined, setIsCallJoined] = useState(false);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        // Generate a random userId for the session
        const userId = Math.random().toString(36).substring(2, 15);
        
        // Fetch a user token from the backend
        const response = await fetch(`/api/token?userId=${encodeURIComponent(userId)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch token');
        }
        
        const { token, apiKey } = await response.json();
        
        if (!apiKey) {
          throw new Error('VITE_STREAM_API_KEY is not set');
        }
        
        // Create user object
        const user = {
          id: userId,
          name: `User ${userId.substring(0, 6)}`,
        };
        
        // Instantiate StreamVideoClient
        const client = new StreamVideoClient({
          apiKey,
          user,
          token,
        });
        
        setVideoClient(client);
      } catch (error) {
        console.error('Failed to initialize StreamVideoClient:', error);
      }
    };

    initializeClient();

    // Cleanup function
    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, []);

  const handleJoinCall = async () => {
    if (!videoClient || !callId.trim()) return;

    try {
      const newCall = videoClient.call('default', callId.trim());
      await newCall.join({ create: true });
      setCall(newCall);
      setIsCallJoined(true);
    } catch (error) {
      console.error('Failed to join call:', error);
    }
  };

  const handleLeaveCall = async () => {
    if (call) {
      await call.leave();
      setCall(null);
      setIsCallJoined(false);
      setCallId('');
    }
  };

  // Show loading state while client is initializing
  if (!videoClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing video client...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamTheme>
        <div className="min-h-screen bg-gray-900">
          {!isCallJoined ? (
            // Join call form
            <div className="min-h-screen flex items-center justify-center p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center">Join Video Call</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter Call ID"
                      value={callId}
                      onChange={(e) => setCallId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinCall()}
                    />
                  </div>
                  <Button
                    onClick={handleJoinCall}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!callId.trim()}
                  >
                    Join Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Live video interface
            call && (
              <StreamCall call={call}>
                <div className="h-screen relative">
                  <SpeakerLayout />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <CallControls onLeave={handleLeaveCall} />
                  </div>
                </div>
              </StreamCall>
            )
          )}
        </div>
      </StreamTheme>
    </StreamVideo>
  );
}

export default App;
