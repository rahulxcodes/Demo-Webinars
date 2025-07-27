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
import { clearExpiredTokens } from '@/utils/tokenRefresh';

export function MainApp() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'live-class' | 'recordings'>('live-class');
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [isInLiveClass, setIsInLiveClass] = useState(false);

  // Simulate current user based on authenticated user
  const currentUser = user ? {
    id: user.id.toString(),
    name: user.name,
    isAdmin: user.role === 'ADMIN'
  } : null;

  // Get Stream token from localStorage (set during login)
  const streamToken = localStorage.getItem('stream_token');

  // Initialize Stream Video Client with user data and token from auth
  useEffect(() => {
    // Reset client state
    setVideoClient(null);

    // Only create client if we have all required data
    if (streamToken && currentUser) {
      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      if (!apiKey) {
        console.error('Stream API key not found');
        return;
      }

      // Check if token is expired before creating client
      try {
        // Parse JWT to check expiration
        const payload = JSON.parse(atob(streamToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('Stream token is expired, forcing logout and re-login');
          logout(); // Use the auth logout function instead
          return;
        }
      } catch (error) {
        console.log('Invalid token format, forcing logout and re-login');
        logout(); // Use the auth logout function instead
        return;
      }

      const streamUser: StreamUser = {
        id: currentUser.id,
        name: currentUser.name,
        custom: {
          role: currentUser.isAdmin ? 'admin' : 'user',
        }
      };

      try {
        const client = new StreamVideoClient({
          apiKey,
          user: streamUser,
          token: streamToken,
        });

        setVideoClient(client);

        // Handle client connection errors
        client.on('connection.error', (error: any) => {
          console.error('Stream connection error:', error);
          if (error?.error?.code === 40 || error?.error?.message?.includes('expired')) {
            console.log('Token expired during connection, forcing logout');
            logout();
          }
        });

        // Cleanup function to disconnect when dependencies change
        return () => {
          client.disconnectUser();
        };
      } catch (error) {
        console.error('Failed to create StreamVideoClient:', error);
        // If token creation fails, likely due to expired token
        if (error.message?.includes('expired') || error.message?.includes('JWT')) {
          console.log('Token expired, forcing logout');
          logout();
        }
      }
    }
  }, [streamToken, currentUser?.id, currentUser?.name, currentUser?.isAdmin]); // Dependencies: only recreate when token or user changes

  // Handle loading states
  if (!currentUser) {
    console.log('[MainApp] No currentUser found, showing loading');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!streamToken) {
    // Clear auth state and force re-login if no stream token
    logout();
    return null;
  }

  // Check for expired tokens by attempting to create the client
  if (!videoClient && streamToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            No video service token found. Please log in again.
          </div>
          <button 
            onClick={() => logout()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Re-authenticate
          </button>
        </div>
      </div>
    );
  }

  if (!videoClient) {
    console.log('[MainApp] No videoClient found, showing loading. StreamToken exists:', !!streamToken);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing video client...</p>
        </div>
      </div>
    );
  }

  console.log('[MainApp] Rendering - activeView:', activeView, 'isAdmin:', currentUser?.isAdmin, 'hasVideoClient:', !!videoClient);

  return (
    <div className="app-container">
      {!isInLiveClass && (
        <Layout
          activeView={activeView}
          setActiveView={setActiveView}
          currentUser={currentUser}
          onLogout={logout}

        >
          {activeView === 'live-class' && (
            <>
              {currentUser.isAdmin ? (
                <AdminClassView 
                  videoClient={videoClient} 
                  currentUser={currentUser}
                  onLiveClassStart={() => setIsInLiveClass(true)}
                  onLiveClassEnd={() => setIsInLiveClass(false)}
                />
              ) : (
                <UserClassView 
                  videoClient={videoClient} 
                  currentUser={currentUser}
                  onLiveClassStart={() => setIsInLiveClass(true)}
                  onLiveClassEnd={() => setIsInLiveClass(false)}
                />
              )}
            </>
          )}

          {activeView === 'recordings' && (
            <RecordingsView videoClient={videoClient} />
          )}
        </Layout>
      )}
      
      {isInLiveClass && (
        <div className="main-content-fullscreen">
          {currentUser.isAdmin ? (
            <AdminClassView 
              videoClient={videoClient} 
              currentUser={currentUser}
              onLiveClassStart={() => setIsInLiveClass(true)}
              onLiveClassEnd={() => setIsInLiveClass(false)}
              isFullScreen={true}
            />
          ) : (
            <UserClassView 
              videoClient={videoClient} 
              currentUser={currentUser}
              onLiveClassStart={() => setIsInLiveClass(true)}
              onLiveClassEnd={() => setIsInLiveClass(false)}
              isFullScreen={true}
            />
          )}
        </div>
      )}
    </div>
  );
}