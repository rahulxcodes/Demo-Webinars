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

interface AdminClassViewProps {
  videoClient: StreamVideoClient;
  currentUser: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
  onLiveClassStart?: () => void;
  onLiveClassEnd?: () => void;
  isFullScreen?: boolean;
}

// Professional Live Class Layout Component - Hooks must be inside StreamCall
function LiveClassLayout({ 
  currentUser, 
  onEndClass, 
  isInstructor,
  isFullScreen = false
}: { 
  currentUser: any;
  onEndClass: () => void;
  isInstructor: boolean;
  isFullScreen?: boolean;
}) {
  // Move hooks inside the component that's wrapped by StreamCall
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  console.log('[LiveClassLayout] Calling state:', callingState);

  // Allow both JOINED and IDLE states to show the interface
  // IDLE is acceptable for the instructor who created the call
  if (callingState !== CallingState.JOINED && callingState !== CallingState.IDLE) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Joining class...</p>
          <p className="text-gray-400 text-sm mt-2">State: {callingState}</p>
        </div>
      </div>
    );
  }

  // Use the correct hooks according to Stream.io documentation
  const { useParticipants, useParticipantCount, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const participantCount = useParticipantCount();
  const localParticipant = useLocalParticipant();

  console.log('[LiveClassLayout] Participants:', participants.length);
  console.log('[LiveClassLayout] ParticipantCount:', participantCount);
  console.log('[LiveClassLayout] LocalParticipant:', localParticipant?.sessionId);

  return (
    <div className="live-class-container">
      {/* Header Bar */}
      <div className="class-header">
        <div className="flex items-center space-x-4">
          <div className={isInstructor ? 'live-status-badge' : 'attending-status-badge'}>
            {isInstructor ? '🔴 LIVE CLASS' : '🟢 ATTENDING'}
          </div>
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
          <h3>Participants ({participantCount || participants.length})</h3>
          <button 
            onClick={() => {
              console.log('[Debug] Manual participant check:');
              console.log('- Hook participants:', participants.length);
              console.log('- Hook participantCount:', participantCount);
              console.log('- Hook localParticipant:', localParticipant);
              console.log('- Participants details:', participants.map(p => ({ 
                sessionId: p.sessionId, 
                userId: p.userId, 
                name: p.name 
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
  currentUser, 
  onLiveClassStart, 
  onLiveClassEnd, 
  isFullScreen = false 
}: AdminClassViewProps) {
  const [call, setCall] = useState<Call | null>(null);
  const [isClassStarted, setIsClassStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use useEffect to detect when we're in full-screen but don't have a call
  // This indicates the component was re-mounted, so we need to recreate the call
  useEffect(() => {
    console.log('[AdminClassView] useEffect - isFullScreen:', isFullScreen, 'call:', !!call, 'isClassStarted:', isClassStarted);
    
    if (isFullScreen && !call && !isClassStarted && videoClient) {
      console.log('[AdminClassView] Full-screen mode detected but no call - recreating call');
      
      // Recreate the call that should exist in full-screen mode
      const existingCall = videoClient.call('default', 'live-class-main-1');
      setCall(existingCall);
      setIsClassStarted(true);
    }
  }, [isFullScreen, call, isClassStarted, videoClient]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (call && !isFullScreen) {
        console.log('[AdminClassView] Component unmounting, leaving call');
        call.leave().catch(console.error);
      }
    };
  }, [call, isFullScreen]);

  // Enhanced participant debugging with proper Stream state
  useEffect(() => {
    if (call) {
      const handleParticipantsChanged = () => {
        console.log('[AdminClassView] ==================');
        console.log('[AdminClassView] Call state participants:', call.state.participants.length);
        console.log('[AdminClassView] Call state members:', call.state.members.length);
        console.log('[AdminClassView] Call CID:', call.cid);
        
        // Log all participants from call state
        call.state.participants.forEach((p, index) => {
          console.log(`  - Participant ${index + 1}:`, p.userId, p.name, 'sessionId:', p.sessionId);
        });
        
        // Log all members from call state  
        call.state.members.forEach((m, index) => {
          console.log(`  - Member ${index + 1}:`, m.user.id, m.user.name, 'role:', m.role);
        });
        console.log('[AdminClassView] ==================');
      };
      
      // Listen to multiple participant events
      call.on('call.session_participant_joined', handleParticipantsChanged);
      call.on('call.session_participant_left', handleParticipantsChanged);
      call.on('call.member_added', handleParticipantsChanged);
      call.on('call.member_removed', handleParticipantsChanged);
      
      // Log initial state
      handleParticipantsChanged();
      
      return () => {
        call.off('call.session_participant_joined', handleParticipantsChanged);
        call.off('call.session_participant_left', handleParticipantsChanged);
        call.off('call.member_added', handleParticipantsChanged);
        call.off('call.member_removed', handleParticipantsChanged);
      };
    }
  }, [call]);

  const handleStartClass = async () => {
    if (!videoClient || isLoading || isClassStarted) return;

    setIsLoading(true);
    try {
      console.log('[AdminClassView] Starting class...');
      
      // Create a new Stream call object with a fixed ID
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
      
      // Join the call with create: true to ensure it exists
      await newCall.join({ create: true });
      console.log('[AdminClassView] Successfully joined call, CID:', newCall.cid);
      console.log('[AdminClassView] Call state after join:', {
        participants: newCall.state.participants.length,
        members: newCall.state.members.length,
        isJoined: newCall.state.callingState
      });
      
      // Set the call and class state immediately after successful join
      setCall(newCall);
      setIsClassStarted(true);
      console.log('[AdminClassView] State set - call:', !!newCall, 'isClassStarted:', true);
      console.log('[AdminClassView] About to call onLiveClassStart');
      onLiveClassStart?.(); // Trigger full-screen mode
      console.log('[AdminClassView] onLiveClassStart called');
      
      // Wait for call to fully establish before starting recording
      setTimeout(async () => {
        try {
          await newCall.startRecording();
          console.log('[AdminClassView] Recording started successfully');
        } catch (recordingError) {
          console.warn('[AdminClassView] Recording failed to start:', recordingError);
          // Continue with the class even if recording fails
        }
      }, 2000);
    } catch (error) {
      console.error('[AdminClassView] Failed to start class:', error);
      // Reset states on error
      setCall(null);
      setIsClassStarted(false);
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
      onLiveClassEnd?.(); // Exit full-screen mode
    } catch (error) {
      console.error('Failed to end class:', error);
    }
  };

  console.log('[AdminClassView] RENDER CHECK - call:', !!call, 'isClassStarted:', isClassStarted, 'isLoading:', isLoading);
  
  // Show the live class interface if we have both call and class started
  if (call && isClassStarted) {
    console.log('[AdminClassView] ✅ Rendering live class interface');
    
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
            <StreamTheme className="instructor-theme">
              <LiveClassLayout 
                currentUser={currentUser} 
                onEndClass={handleEndClass}
                isInstructor={true}
                isFullScreen={isFullScreen}
              />
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      </ErrorBoundary>
    );
  }

  console.log('[AdminClassView] ❌ Rendering start interface instead');
  
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