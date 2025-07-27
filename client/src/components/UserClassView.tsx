import { useState, useEffect } from 'react';
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  CallingState,
  useCallStateHooks,
  type StreamVideoClient,
  type Call,
} from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorBoundary } from './ErrorBoundary';
import { useCallStatus } from '@/hooks/useCallStatus';

interface UserClassViewProps {
  videoClient: StreamVideoClient;
  currentUser: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
  onLiveClassStart: () => void;
  onLiveClassEnd: () => void;
}

// Student Live Class Layout Component - Hooks must be inside StreamCall  
function StudentLiveClassLayout({ 
  currentUser, 
  onLeaveClass 
}: { 
  currentUser: any;
  onLeaveClass: () => void;
}) {
  // Hooks are now properly inside StreamCall wrapper
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Joining class...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we connect you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-class-layout">
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <SpeakerLayout />
        </div>
        <div style={{ width: '300px' }}>
          <CallParticipantsList onClose={() => {}} />
        </div>
      </div>
      <CallControls onLeave={() => onLeaveClass()} />
    </div>
  );
}

export function UserClassView({ videoClient, currentUser, onLiveClassStart, onLiveClassEnd }: UserClassViewProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [call, setCall] = useState<Call | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  
  // Use the call status hook to monitor live classes in real-time
  const { isLive, participantCount, loading, error } = useCallStatus('live-class-main-1', videoClient);
  
  console.log('[UserClassView] RENDERING - videoClient exists:', !!videoClient, 'user:', currentUser?.name);
  console.log('[UserClassView] Hook status:', { isLive, participantCount, loading, error });

  // No longer need manual status checking - using the hook instead

  const handleJoinClass = async () => {
    if (!videoClient) return;

    setIsJoining(true);
    try {
      // Join the existing call (do not use create: true)
      const newCall = videoClient.call('default', 'live-class-main-1');
      await newCall.join(); // No create flag - only join existing call
      
      setCall(newCall);
      setIsInCall(true);
      onLiveClassStart(); // Notify parent that student joined live class
    } catch (error) {
      console.error('Failed to join class:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClass = async () => {
    if (!call) return;

    try {
      await call.leave();
      setCall(null);
      setIsInCall(false);
    } catch (error) {
      console.error('Failed to leave class:', error);
    }
  };

  if (isInCall && call) {
    // Add null checks and error boundary
    if (!call || !videoClient) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Initializing call...</p>
          </div>
        </div>
      );
    }
    
    return (
      <ErrorBoundary>
        <StreamVideo client={videoClient}>
          <StreamCall call={call}>
            <StreamTheme className="student-theme">
              <StudentLiveClassLayout 
                currentUser={currentUser} 
                onLeaveClass={() => {
                  handleLeaveClass();
                  onLiveClassEnd();
                }}
              />
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      </ErrorBoundary>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Live Class</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Welcome, {currentUser.name}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎓 Class Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Class Status: 
                <span className={`ml-2 ${isLive ? 'text-green-600' : 'text-gray-500'}`}>
                  {isLive ? '🟢 Live' : '⚫ Not Started'}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Class ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">live-class-main-1</code>
              </p>
            </div>
          </div>

          {!isLive ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                The class has not started yet.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please wait for your instructor to start the live session. Status updates automatically every 5 seconds.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  🎉 The class is now live!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {participantCount} participant{participantCount !== 1 ? 's' : ''} currently in class. Click below to join.
                </p>
              </div>

              <Button 
                onClick={handleJoinClass} 
                className="w-full"
                size="lg"
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining Class...
                  </>
                ) : (
                  <>
                    🚪 Join Class
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>• You can only join when the instructor has started the class</p>
            <p>• The class status updates automatically every 10 seconds</p>
            <p>• Use "Check Status" button for immediate updates</p>
            <p>• You'll have student-level controls once joined</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}