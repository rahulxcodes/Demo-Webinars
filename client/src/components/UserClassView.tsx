import { useState, useEffect } from 'react';
import { StreamVideo, StreamCall, StreamTheme, SpeakerLayout, CallControls, StreamVideoClient } from '@stream-io/video-react-sdk';
import type { Call } from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserClassViewProps {
  videoClient: StreamVideoClient;
  currentUser: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
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
    return (
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <StreamTheme>
            <div className="h-full flex flex-col">
              {/* Header with class info */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Live Class Session</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      🟢 JOINED
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Student: {currentUser.name}
                  </div>
                </div>
              </div>

              {/* Video area */}
              <div className="flex-1">
                <SpeakerLayout />
              </div>

              {/* Controls */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-center">
                  <CallControls onLeave={handleLeaveClass} />
                </div>
              </div>
            </div>
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
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