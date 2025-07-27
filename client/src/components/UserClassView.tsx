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

interface UserClassViewProps {
  videoClient: StreamVideoClient;
  currentUser: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
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
      {/* Header Bar */}
      <div className="class-header">
        <div className="flex items-center space-x-4">
          <div className="attending-status-badge">
            🟢 ATTENDING
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {currentUser.name[0]?.toUpperCase()}
            </div>
            <span className="text-white font-medium">
              {currentUser.name} · Student
            </span>
          </div>
        </div>
        <Button
          onClick={onLeaveClass}
          className="bg-transparent border border-gray-400 text-white hover:bg-gray-700 hover:border-gray-300 font-medium px-4 py-2 rounded-lg transition-all duration-200"
          size="sm"
        >
          Leave Class
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="main-panel">
          <SpeakerLayout participantsBarPosition="bottom" />
          <div className="controls-container">
            <CallControls />
          </div>
        </div>
        
        <div className="sidebar-panel">
          <CallParticipantsList onClose={() => {}} />
        </div>
      </div>
    </div>
  );
}

export function UserClassView({ videoClient, currentUser }: UserClassViewProps) {
  const [isClassLive, setIsClassLive] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [call, setCall] = useState<Call | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  const checkClassStatus = async () => {
    if (!videoClient) return;

    setIsCheckingStatus(true);
    try {
      // Query the Stream API to see if the call is active
      const result = await videoClient.queryCalls({
        filter_conditions: { id: 'live-class-main-1' },
      });

      // Check if call exists and has members
      if (result.calls && result.calls.length > 0) {
        const classCall = result.calls[0];
        // Check if call has active participants by looking at the call state
        const hasMembers = classCall.state?.members && Object.keys(classCall.state.members).length > 0;
        setIsClassLive(hasMembers);
      } else {
        setIsClassLive(false);
      }
    } catch (error) {
      console.error('Failed to check class status:', error);
      setIsClassLive(false);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Check status periodically
  useEffect(() => {
    checkClassStatus();
    
    const interval = setInterval(checkClassStatus, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [videoClient]);

  const handleJoinClass = async () => {
    if (!videoClient) return;

    setIsJoining(true);
    try {
      // Join the existing call (do not use create: true)
      const newCall = videoClient.call('default', 'live-class-main-1');
      await newCall.join(); // No create flag - only join existing call
      
      setCall(newCall);
      setIsInCall(true);
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
                onLeaveClass={handleLeaveClass}
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
                <span className={`ml-2 ${isClassLive ? 'text-green-600' : 'text-gray-500'}`}>
                  {isClassLive ? '🟢 Live' : '⚫ Not Started'}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Class ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">live-class-main-1</code>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkClassStatus}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                  Checking...
                </>
              ) : (
                'Check Status'
              )}
            </Button>
          </div>

          {!isClassLive ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                The class has not started yet.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please wait for your instructor to start the live session. The status will update automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  🎉 The class is now live!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Click the button below to join your instructor and classmates.
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