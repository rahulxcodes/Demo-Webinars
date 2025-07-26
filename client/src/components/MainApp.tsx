import { useState, useEffect } from 'react';
import { StreamVideoClient, User as StreamUser } from '@stream-io/video-react-sdk';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { AdminClassView } from '@/components/AdminClassView';
import { UserClassView } from '@/components/UserClassView';
import { RecordingsView } from '@/components/RecordingsView';
import { useAuth } from '@/context/AuthContext';

export function MainApp() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'live-class' | 'recordings'>('live-class');
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

  // Simulate current user based on authenticated user
  const currentUser = user ? {
    id: user.id.toString(),
    name: user.name,
    isAdmin: user.role === 'ADMIN'
  } : null;

  // Fetch Stream token only when we have a valid user
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['/api/token', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const response = await fetch(`/api/token?userId=${encodeURIComponent(currentUser?.id || '')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }
      return response.json();
    },
  });

  // Initialize Stream Video Client only after token is fetched
  useEffect(() => {
    // Cleanup existing client first
    if (videoClient) {
      videoClient.disconnectUser();
      setVideoClient(null);
    }

    // Only create client if we have all required data
    if (tokenData?.token && currentUser) {
      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      if (!apiKey) {
        console.error('Stream API key not found');
        return;
      }

      const streamUser: StreamUser = {
        id: currentUser.id,
        name: currentUser.name,
      };

      try {
        const client = new StreamVideoClient({
          apiKey,
          user: streamUser,
          token: tokenData.token,
        });

        setVideoClient(client);
      } catch (error) {
        console.error('Failed to create StreamVideoClient:', error);
      }
    }

    // Cleanup function
    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, [tokenData, currentUser]); // Dependencies: only recreate when token or user changes

  // Handle loading states
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Fetching authentication token...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            Failed to authenticate with video service
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!videoClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing video client...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeView={activeView}
      setActiveView={setActiveView}
      currentUser={currentUser}
      onLogout={logout}
    >
      {activeView === 'live-class' && (
        <>
          {currentUser.isAdmin ? (
            <AdminClassView videoClient={videoClient} currentUser={currentUser} />
          ) : (
            <UserClassView videoClient={videoClient} currentUser={currentUser} />
          )}
        </>
      )}

      {activeView === 'recordings' && (
        <RecordingsView videoClient={videoClient} />
      )}
    </Layout>
  );
}