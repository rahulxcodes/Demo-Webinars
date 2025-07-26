import { useState, useEffect } from 'react';
import { StreamVideo, StreamCall, StreamTheme, SpeakerLayout, CallControls, StreamVideoClient } from '@stream-io/video-react-sdk';
import type { Call } from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { AdminClassView } from '@/components/AdminClassView';
import { UserClassView } from '@/components/UserClassView';
import { RecordingsView } from '@/components/RecordingsView';

// Simulate current user - change this to test different roles
const currentUser = { 
  id: 'student-jane', 
  name: 'Jane Doe', 
  isAdmin: false 
};

function App() {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [callId, setCallId] = useState('');
  const [isCallJoined, setIsCallJoined] = useState(false);
  const [activeView, setActiveView] = useState('live');

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
          throw new Error('API key is not set');
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

  const handleLeaveCall = () => {
    if (call) {
      call.leave();
      setCall(null);
      setIsCallJoined(false);
    }
  };

  if (!videoClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing video client...</p>
        </div>
      </div>
    );
  }

  if (isCallJoined && call) {
    return (
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <StreamTheme>
            <div className="h-screen flex flex-col">
              <SpeakerLayout />
              <div className="p-4">
                <CallControls onLeave={handleLeaveCall} />
              </div>
            </div>
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    );
  }

  const renderMainContent = () => {
    if (activeView === 'live') {
      // Show admin interface if user is admin
      if (currentUser.isAdmin && videoClient) {
        return <AdminClassView videoClient={videoClient} currentUser={currentUser} />;
      }
      
      // Show user interface for students
      if (!currentUser.isAdmin && videoClient) {
        return <UserClassView videoClient={videoClient} currentUser={currentUser} />;
      }
      
      // Fallback for when videoClient is not ready
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (activeView === 'recordings') {
      if (videoClient) {
        return <RecordingsView videoClient={videoClient} />;
      }
      
      // Fallback for when videoClient is not ready
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderMainContent()}
    </Layout>
  );
}

export default App;