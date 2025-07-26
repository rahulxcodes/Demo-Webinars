import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Monitor, Settings, Phone } from 'lucide-react';

interface CallControlsProps {
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleScreenShare: () => void;
  onOpenSettings: () => void;
  onLeaveCall: () => void;
}

export function CallControls({
  isCameraOn,
  isMicOn,
  isScreenSharing,
  onToggleCamera,
  onToggleMic,
  onToggleScreenShare,
  onOpenSettings,
  onLeaveCall,
}: CallControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <div className="bg-white rounded-full shadow-2xl px-6 py-4 flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className={`w-12 h-12 rounded-full ${
            !isMicOn ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={onToggleMic}
          title="Toggle microphone"
        >
          {isMicOn ? (
            <Mic className="w-5 h-5 text-gray-700" />
          ) : (
            <MicOff className="w-5 h-5 text-red-500" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`w-12 h-12 rounded-full ${
            !isCameraOn ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={onToggleCamera}
          title="Toggle camera"
        >
          {isCameraOn ? (
            <Video className="w-5 h-5 text-gray-700" />
          ) : (
            <VideoOff className="w-5 h-5 text-red-500" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`w-12 h-12 rounded-full ${
            isScreenSharing ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={onToggleScreenShare}
          title="Share screen"
        >
          <Monitor className={`w-5 h-5 ${isScreenSharing ? 'text-blue-600' : 'text-gray-700'}`} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200"
          onClick={onOpenSettings}
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-700" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600"
          onClick={onLeaveCall}
          title="Leave call"
        >
          <Phone className="w-5 h-5 text-white" />
        </Button>
      </div>
    </div>
  );
}
