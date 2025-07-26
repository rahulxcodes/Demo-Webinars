import { User } from '@stream-io/video-react-sdk';
import { MicOff, VideoOff } from 'lucide-react';

interface ParticipantTileProps {
  participant: {
    userId: string;
    name?: string;
    videoMuted?: boolean;
    audioMuted?: boolean;
    isCurrentUser?: boolean;
  };
  children?: React.ReactNode;
}

export function ParticipantTile({ participant, children }: ParticipantTileProps) {
  return (
    <div className={`bg-gray-800 rounded-lg relative overflow-hidden group ${
      participant.isCurrentUser ? 'border-2 border-blue-600' : ''
    }`}>
      {children || (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-white text-4xl font-bold">
            {participant.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded">
        {participant.isCurrentUser ? 'You' : participant.name || 'Participant'}
      </div>
      
      {(participant.audioMuted || participant.videoMuted) && (
        <div className="absolute top-3 right-3 flex space-x-1">
          {participant.audioMuted && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {participant.videoMuted && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      )}
      
      {/* Connection indicator */}
      <div className="absolute top-3 left-3 flex space-x-1">
        <div className="w-1 h-3 bg-green-500 rounded-full"></div>
        <div className="w-1 h-3 bg-green-500 rounded-full"></div>
        <div className="w-1 h-3 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
}
