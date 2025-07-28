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
    useScreenShareState,
    useIsCallRecordingInProgress 
  } = useCallStateHooks();
  
  const participants = useParticipants();
  const { microphone, isMute } = useMicrophoneState();
  const { camera, isMute: isCameraOff } = useCameraState();
  const { screenShare, isScreenShareOn } = useScreenShareState();
  const isRecording = useIsCallRecordingInProgress();
  
  const handleMuteToggle = async () => {
    if (microphone.state === 'enabled') {
      await microphone.disable();
    } else {
      await microphone.enable();
    }
  };
  
  const handleVideoToggle = async () => {
    if (camera.state === 'enabled') {
      await camera.disable();
    } else {
      await camera.enable();
    }
  };
  
  const handleScreenShareToggle = async () => {
    if (screenShare.state === 'enabled') {
      await screenShare.disable();
    } else {
      await screenShare.enable();
    }
  };
  
  const handleRecordingToggle = async () => {
    if (isRecording) {
      await call?.stopRecording();
    } else {
      await call?.startRecording();
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
            className={`control-button ${microphone.state === 'disabled' ? 'muted' : 'unmuted'}`}
            onClick={handleMuteToggle}
            title={microphone.state === 'disabled' ? 'Unmute microphone (Space)' : 'Mute microphone (Space)'}
            aria-label={microphone.state === 'disabled' ? 'Unmute microphone' : 'Mute microphone'}
          >
            {microphone.state === 'disabled' ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <div className="control-button-tooltip">
            {microphone.state === 'disabled' ? 'Unmute' : 'Mute'} (Space)
          </div>
        </div>
        
        {/* Video Button */}
        <div className="control-button-wrapper">
          <button
            className={`control-button ${camera.state === 'disabled' ? 'video-off' : 'video-on'}`}
            onClick={handleVideoToggle}
            title={camera.state === 'disabled' ? 'Turn camera on' : 'Turn camera off'}
            aria-label={camera.state === 'disabled' ? 'Turn camera on' : 'Turn camera off'}
          >
            {camera.state === 'disabled' ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          <div className="control-button-tooltip">
            Camera {camera.state === 'disabled' ? 'on' : 'off'}
          </div>
        </div>
        
        {/* Screen Share Button */}
        <div className="control-button-wrapper">
          <button
            className={`control-button ${screenShare.state === 'enabled' ? 'screen-sharing' : 'screen-not-sharing'}`}
            onClick={handleScreenShareToggle}
            title={screenShare.state === 'enabled' ? 'Stop sharing screen' : 'Share your screen'}
            aria-label={screenShare.state === 'enabled' ? 'Stop sharing screen' : 'Share your screen'}
          >
            {screenShare.state === 'enabled' ? <MonitorStop size={20} /> : <Monitor size={20} />}
          </button>
          <div className="control-button-tooltip">
            {screenShare.state === 'enabled' ? 'Stop sharing' : 'Share screen'}
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
            <span>Participants ({participantCount})</span>
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