import { useState, useEffect } from 'react';
import { 
  StreamVideo,
  StreamCall,
  useCallStateHooks,
  ParticipantView,
  SpeakerLayout,
  CallControls as StreamCallControls,
} from '@stream-io/video-react-sdk';
import { CallControls } from './call-controls';
import { ParticipantTile } from './participant-tile';
import { SettingsModal } from './settings-modal';
import { Users } from 'lucide-react';

interface VideoCallScreenProps {
  client: any;
  callId: string;
  onLeaveCall: () => void;
}

export function VideoCallScreen({ client, callId, onLeaveCall }: VideoCallScreenProps) {
  const [call, setCall] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!client || !callId) return;

    const videoCall = client.call('default', callId);
    videoCall.join({ create: true });
    setCall(videoCall);

    return () => {
      videoCall.leave();
    };
  }, [client, callId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleCamera = () => {
    if (call) {
      if (isCameraOn) {
        call.camera.disable();
      } else {
        call.camera.enable();
      }
      setIsCameraOn(!isCameraOn);
    }
  };

  const handleToggleMic = () => {
    if (call) {
      if (isMicOn) {
        call.microphone.disable();
      } else {
        call.microphone.enable();
      }
      setIsMicOn(!isMicOn);
    }
  };

  const handleToggleScreenShare = () => {
    if (call) {
      if (isScreenSharing) {
        call.screenShare.disable();
      } else {
        call.screenShare.enable();
      }
      setIsScreenSharing(!isScreenSharing);
    }
  };

  if (!call || !client) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Connecting to call...</div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div className="min-h-screen bg-gray-900 relative">
          {/* Call Info */}
          <div className="absolute top-6 left-6 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-10">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Call ID: {callId}</span>
              <span className="text-sm text-gray-300">•</span>
              <span className="text-sm">{formatDuration(callDuration)}</span>
            </div>
          </div>

          {/* Participants count */}
          <div className="absolute top-6 right-6 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-10">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">1</span>
            </div>
          </div>

          {/* Video Layout */}
          <div className="h-screen p-4">
            <SpeakerLayout />
          </div>

          {/* Custom Call Controls */}
          <CallControls
            isCameraOn={isCameraOn}
            isMicOn={isMicOn}
            isScreenSharing={isScreenSharing}
            onToggleCamera={handleToggleCamera}
            onToggleMic={handleToggleMic}
            onToggleScreenShare={handleToggleScreenShare}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLeaveCall={onLeaveCall}
          />

          {/* Settings Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      </StreamCall>
    </StreamVideo>
  );
}
