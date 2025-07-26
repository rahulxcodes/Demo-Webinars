import { useState } from 'react';
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

interface AdminClassViewProps {
  videoClient: StreamVideoClient;
  currentUser: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
}

// Professional Live Class Layout Component
function LiveClassLayout({ 
  currentUser, 
  onEndClass, 
  isInstructor 
}: { 
  currentUser: any;
  onEndClass: () => void;
  isInstructor: boolean;
}) {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-white">Joining class...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-class-layout">
      {/* Header Bar */}
      <div className="class-header">
        <div className="flex items-center space-x-4">
          <Badge variant="default" className="bg-red-600">
            {isInstructor ? '🔴 LIVE CLASS' : '🟢 ATTENDING'}
          </Badge>
          <span className="text-white font-medium">
            {currentUser.name} ({isInstructor ? 'Instructor' : 'Student'})
          </span>
        </div>
        {isInstructor && (
          <Button
            onClick={onEndClass}
            variant="destructive"
            size="sm"
          >
            End Class
          </Button>
        )}
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

export function AdminClassView({ videoClient, currentUser }: AdminClassViewProps) {
  const [call, setCall] = useState<Call | null>(null);
  const [isClassStarted, setIsClassStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClass = async () => {
    if (!videoClient) return;

    setIsLoading(true);
    try {
      // Create a new Stream call object with a fixed ID
      const newCall = videoClient.call('default', 'live-class-main-1');
      
      // Join the call and create it if it doesn't exist
      await newCall.join({ create: true });
      
      // Start recording automatically
      try {
        await newCall.startRecording();
        console.log('Recording started successfully');
      } catch (recordingError) {
        console.warn('Failed to start recording:', recordingError);
        // Continue with the class even if recording fails
      }
      
      setCall(newCall);
      setIsClassStarted(true);
    } catch (error) {
      console.error('Failed to start class:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndClass = async () => {
    if (!call) return;

    try {
      // Stop recording before ending the call
      try {
        await call.stopRecording();
        console.log('Recording stopped successfully');
      } catch (recordingError) {
        console.warn('Failed to stop recording:', recordingError);
      }

      // Leave the call
      await call.leave();
      setCall(null);
      setIsClassStarted(false);
    } catch (error) {
      console.error('Failed to end class:', error);
    }
  };

  if (isClassStarted && call) {
    const { useCallCallingState } = useCallStateHooks();
    
    return (
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <StreamTheme className="instructor-theme">
            <LiveClassLayout 
              currentUser={currentUser} 
              onEndClass={handleEndClass}
              isInstructor={true}
            />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Live Class Control</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Welcome, {currentUser.name} {currentUser.isAdmin && '(Admin)'}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎓 Class Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-600 dark:text-gray-400">
            <p>Ready to start your live class session?</p>
            <p className="text-sm mt-1">
              Class ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">live-class-main-1</code>
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              What happens when you start the class:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Video call will be created and started</li>
              <li>• Recording will begin automatically</li>
              <li>• Students can join using the class ID</li>
              <li>• You'll have full instructor controls</li>
            </ul>
          </div>

          <Button 
            onClick={handleStartClass} 
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting Class...
              </>
            ) : (
              <>
                🚀 Start Live Class
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Class Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">0</div>
              <div className="text-sm text-gray-500">Students Joined</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">0</div>
              <div className="text-sm text-gray-500">Minutes Elapsed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">Ready</div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}