import { useState, useEffect } from 'react';
import { 
  Call, 
  StreamVideoClient, 
  StreamVideo, 
  StreamCall, 
  StreamTheme,
  SpeakerLayout,
  CallControls,
  CallParticipantsList,
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorBoundary } from './ErrorBoundary';

interface AdminClassViewProps {
  videoClient: StreamVideoClient;
  currentUser: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
}

// Professional Live Class Layout Component - Following Stream SDK best practices
function LiveClassLayout({ 
  currentUser, 
  onEndClass, 
  isInstructor,
  videoClient
}: { 
  currentUser: any;
  onEndClass: () => void;
  isInstructor: boolean;
  videoClient: StreamVideoClient;
}) {
  const call = useCallStateHooks().useCall();
  const { useParticipants, useCallCallingState } = useCallStateHooks();
  const participants = useParticipants();
  const callingState = useCallCallingState();

  console.log('[LiveClassLayout] Call object:', !!call, 'CID:', call?.cid);
  console.log('[LiveClassLayout] Calling state:', callingState);
  console.log('[LiveClassLayout] Raw participants:', participants.length);

  useEffect(() => {
    // The videoClient object is passed as a prop, not derived from the call.
    // We will use it directly.

    // First, check if the videoClient and its user object exist.
    if (videoClient && videoClient.user) {
      const currentUserId = videoClient.user.id;
      console.log("[LiveClassView] Current videoClient user ID:", currentUserId);

      // Now, check if the call object also exists.
      if (call) {
        console.log("[LiveClassView] Call object is present. State:", call.state.callingState);
        
        // Check if the current user is in the participants list
        const userInCall = call.state.participants.some(p => p.userId === currentUserId);
        console.log("[LiveClassView] Is current user in participants list:", userInCall);
        console.log("[LiveClassView] Total participants:", call.state.participants.length);
      }
    }
  }, [call, videoClient]); // The dependency array is correct

  if (!call) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing call...</p>
        </div>
      </div>
    );
  }

  // Filter out potential system/recording bots if needed for display count
  // Note: Stream SDK doesn't have a 'type' property, so we'll use all participants
  const displayParticipants = participants;
  console.log('[LiveClassLayout] Display participants:', displayParticipants.length);

  return (
    <div className="live-class-container">
      {/* Header */}
      <div className="live-class-header">
        <div className="flex items-center space-x-4">
          <Badge variant="destructive" className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            ● LIVE
          </Badge>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {currentUser.name[0]?.toUpperCase()}
            </div>
            <span className="text-white font-medium">
              {currentUser.name} · {isInstructor ? 'Instructor' : 'Student'}
            </span>
          </div>
        </div>
        {isInstructor && (
          <Button
            onClick={onEndClass}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-4 py-2 rounded-lg border-none shadow-lg hover:shadow-xl transition-all duration-200"
            size="sm"
          >
            End Class
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-video-area">
        <SpeakerLayout 
          participantsBarPosition="bottom"
          participantsBarLimit={6}
        />
        <div className="call-controls-overlay">
          <CallControls />
        </div>
      </div>
      
      <div className="participants-sidebar">
        <div className="participants-header">
          <h3>Participants ({displayParticipants.length})</h3>
          <button 
            onClick={() => {
              console.log('[Debug] Manual participant check:');
              console.log('- Raw participants:', participants.length);
              console.log('- Display participants:', displayParticipants.length);
              console.log('- Call CID:', call?.cid);
              console.log('- Calling state:', callingState);
              console.log('- Participants details:', participants.map(p => ({ 
                sessionId: p.sessionId, 
                userId: p.userId, 
                name: p.name,
                isLocalParticipant: p.isLocalParticipant
              })));
            }}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded mt-2"
          >
            Debug Participants
          </button>
        </div>
        <CallParticipantsList onClose={() => {}} />
      </div>
    </div>
  );
}

export function AdminClassView({ 
  videoClient, 
  currentUser
}: AdminClassViewProps) {
  const [call, setCall] = useState<Call | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartClass = async () => {
    if (isStarting || call) return; // Prevent re-starting

    setIsStarting(true);
    try {
      console.log('[AdminClassView] Starting class...');
      
      // Create a new call instance using the passed-in videoClient
      const newCall = videoClient.call('default', 'live-class-main-1');
      
      // Configure the call to enable recording BEFORE joining
      await newCall.getOrCreate({
        data: {
          settings_override: {
            recording: {
              mode: 'available',
              quality: '720p'
            }
          }
        }
      });
      console.log('[AdminClassView] Call configured with recording enabled, CID:', newCall.cid);
      
      // Join the call
      await newCall.join();
      console.log('[AdminClassView] Successfully joined call, CID:', newCall.cid);

      setCall(newCall); // Set the created call into our state
      
      // Start recording after a brief delay
      setTimeout(async () => {
        try {
          await newCall.startRecording();
          console.log('[AdminClassView] Recording started successfully');
        } catch (recordingError) {
          console.warn('[AdminClassView] Recording failed to start:', recordingError);
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to start class:", error);
      alert("Could not start the class. Please check the console.");
    } finally {
      setIsStarting(false);
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
    } catch (error) {
      console.error('Failed to end class:', error);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (call) {
        console.log('[AdminClassView] Component unmounting, leaving call');
        call.leave().catch(console.error);
      }
    };
  }, [call]);

  // Render the "Start Class" button if the call hasn't been created yet
  if (!call) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Live Class Control</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Logged in as {currentUser.name}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Class Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Main Live Class</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Class ID: live-class-main-1
                </p>
              </div>
              <Button 
                onClick={handleStartClass}
                disabled={isStarting}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isStarting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>🚀 Start Live Class</>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>• Recording will start automatically when class begins</p>
              <p>• Students will be notified when the class is live</p>
              <p>• Use the class controls to manage participants</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If the call exists, render the full video UI
  return (
    <ErrorBoundary>
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <StreamTheme className="str-video__theme-default">
            <LiveClassLayout 
              currentUser={currentUser} 
              onEndClass={handleEndClass}
              isInstructor={true}
              videoClient={videoClient}
            />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </ErrorBoundary>
  );
}