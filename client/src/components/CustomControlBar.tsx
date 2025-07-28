import React from 'react';
import {
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorStop, 
  Users, 
  Phone, 
  Settings,
  Square
} from 'lucide-react';
import { HiUsers } from 'react-icons/hi2';

interface CustomControlBarProps {
  onToggleParticipants: () => void;
  participantCount: number;
  onEndCall: () => void;
  showRecording?: boolean;
}

export function CustomControlBar({ 
  onToggleParticipants, 
  participantCount, 
  onEndCall,
  showRecording = false 
}: CustomControlBarProps) {
  const call = useCall();
  const { 
    useParticipants, 
    useMicrophoneState, 
    useCameraState,
    useIsCallRecordingInProgress 
  } = useCallStateHooks();
  
  const participants = useParticipants();
  const { microphone, isMute } = useMicrophoneState();
  const { camera, isMute: isCameraOff } = useCameraState();
  const isRecording = useIsCallRecordingInProgress();
  
  const handleMuteToggle = async () => {
    await microphone.toggle();
  };
  
  const handleVideoToggle = async () => {
    await camera.toggle();
  };
  
  const handleScreenShareToggle = async () => {
    // Screen share functionality - using call.camera for now as fallback
    // This will be handled by the StreamVideo SDK automatically
    console.log('Screen share toggle - functionality to be implemented');
  };
  
  const handleRecordingToggle = async () => {
    try {
      if (isRecording) {
        await call?.stopRecording();
      } else {
        await call?.startRecording();
      }
    } catch (error) {
      console.error('Recording toggle failed:', error);
    }
  };
  
  const handleEndCall = () => {
    if (call) {
      call.leave();
    }
    onEndCall();
  };

  return (
    <div className="custom-control-bar">
      {/* Primary Controls Group */}
      <div className="control-group primary-controls">
        {/* Mute Button */}
        <div className="control-button-wrapper">
          <button
            className={`control-button ${isMute ? 'muted' : 'unmuted'}`}
            onClick={handleMuteToggle}
            title={isMute ? 'Unmute microphone (Space)' : 'Mute microphone (Space)'}
            aria-label={isMute ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMute ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <div className="control-button-tooltip">
            {isMute ? 'Unmute' : 'Mute'} (Space)
          </div>
        </div>
        
        {/* Video Button */}
        <div className="control-button-wrapper">
          <button
            className={`control-button ${isCameraOff ? 'video-off' : 'video-on'}`}
            onClick={handleVideoToggle}
            title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
          >
            {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          <div className="control-button-tooltip">
            Camera {isCameraOff ? 'on' : 'off'}
          </div>
        </div>
        
        {/* Screen Share Button */}
        <div className="control-button-wrapper">
          <button
            className="control-button screen-not-sharing"
            onClick={handleScreenShareToggle}
            title="Share your screen"
            aria-label="Share your screen"
          >
            <Monitor size={20} />
          </button>
          <div className="control-button-tooltip">
            Share screen
          </div>
        </div>
      </div>
      
      {/* Separator */}
      <div className="control-separator"></div>
      
      {/* Secondary Controls Group */}
      <div className="control-group secondary-controls">
        {/* Participants Button */}
        <div className="control-button-wrapper participants-counter">
          <button 
            className="participants-btn"
            onClick={onToggleParticipants}
            aria-label={`Show participants panel (${participantCount} participants)`}
            title="Show participants panel"
          >
            <HiUsers className="w-5 h-5" />
            {participantCount > 1 && (
              <div 
                className="participant-count-badge"
                aria-label={`${participantCount} participants in call`}
              >
                {participantCount}
              </div>
            )}
          </button>
        </div>
        
        {/* Recording Button - only show for admin */}
        {showRecording && (
          <div className="control-button-wrapper">
            <button
              className={`control-button ${isRecording ? 'recording' : 'not-recording'}`}
              onClick={handleRecordingToggle}
              title={isRecording ? 'Stop recording' : 'Start recording'}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <Square size={20} /> : <Square size={20} />}
            </button>
            <div className="control-button-tooltip">
              {isRecording ? 'Stop recording' : 'Start recording'}
            </div>
          </div>
        )}
      </div>
      
      {/* Separator */}
      <div className="control-separator"></div>
      
      {/* Utility Controls Group */}
      <div className="control-group utility-controls">
        {/* End Call Button */}
        <div className="control-button-wrapper">
          <button
            className="control-button end-call"
            onClick={handleEndCall}
            title="End call"
            aria-label="End call"
          >
            <Phone size={20} className="rotate-135" />
          </button>
          <div className="control-button-tooltip">End call</div>
        </div>
      </div>
    </div>
  );
}