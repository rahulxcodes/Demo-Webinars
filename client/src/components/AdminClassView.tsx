import { useState } from 'react';
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  CallControls,
  ParticipantView,
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

// Custom components for the comprehensive UI
function StreamCallContent() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  
  const speaker = participants.find(p => p.isDominantSpeaker) || participants[0];
  
  return (
    <div className="h-full flex items-center justify-center">
      {speaker ? (
        <ParticipantView
          participant={speaker}
          className="w-full h-full"
        />
      ) : (
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🎓</div>
          <div className="text-xl">Waiting for participants...</div>
        </div>
      )}
    </div>
  );
}

function ParticipantsSidebar() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  
  return (
    <div className="h-full p-4">
      <h3 className="text-white font-semibold mb-4">
        Participants ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.sessionId}
            className="flex items-center space-x-2 p-2 bg-gray-700 rounded"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {participant.name?.[0] || '?'}
            </div>
            <div className="flex-1 text-white text-sm">
              {participant.name || 'Anonymous'}
            </div>
            {participant.isDominantSpeaker && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        ))}
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
    return (
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <StreamTheme>
            <div className="h-full flex flex-col bg-gray-900">
              {/* Header */}
              <div className="bg-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="default" className="bg-red-600">
                    🔴 LIVE CLASS
                  </Badge>
                  <span className="text-white font-medium">
                    Live Class - {currentUser.name} (Instructor)
                  </span>
                </div>
                <Button
                  onClick={handleEndClass}
                  variant="destructive"
                  size="sm"
                >
                  End Class
                </Button>
              </div>

              {/* Main Video Area */}
              <div className="flex-1 flex">
                {/* Primary Video Container */}
                <div className="flex-1 relative bg-black">
                  <StreamCallContent />
                </div>
                
                {/* Sidebar for Participants */}
                <div className="w-64 bg-gray-800 border-l border-gray-700">
                  <ParticipantsSidebar />
                </div>
              </div>

              {/* Controls */}
              <div className="bg-gray-800 p-4 flex justify-center">
                <CallControls />
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