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

  // Fetch Stream token
  const { data: tokenData } = useQuery({
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

  // Initialize Stream Video Client
  useEffect(() => {
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

      const client = new StreamVideoClient({
        apiKey,
        user: streamUser,
        token: tokenData.token,
      });

      setVideoClient(client);

      return () => {
        client.disconnectUser();
      };
    }
  }, [tokenData, currentUser]);

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
            videoClient ? (
              <AdminClassView videoClient={videoClient} currentUser={currentUser} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Initializing video client...</p>
                </div>
              </div>
            )
          ) : (
            videoClient ? (
              <UserClassView videoClient={videoClient} currentUser={currentUser} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Initializing video client...</p>
                </div>
              </div>
            )
          )}
        </>
      )}

      {activeView === 'recordings' && (
        <>
          {videoClient ? (
            <RecordingsView videoClient={videoClient} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}