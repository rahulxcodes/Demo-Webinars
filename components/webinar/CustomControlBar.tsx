'use client'

import { useState, useEffect } from 'react'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Users,
  Settings,
  Phone,
  Circle,
  Square
} from 'lucide-react'
import { useCallStateHooks, CallingState } from '@stream-io/video-react-sdk'
import { Button } from '@/components/ui/button'

interface CustomControlBarProps {
  onToggleParticipants: () => void
  participantCount: number
  onEndCall: () => void
  showRecording?: boolean
  isRecording?: boolean
  onToggleRecording?: () => void
}

export function CustomControlBar({
  onToggleParticipants,
  participantCount,
  onEndCall,
  showRecording = true,
  isRecording = false,
  onToggleRecording
}: CustomControlBarProps) {
  const {
    useCameraState,
    useMicrophoneState,
    useScreenShareState,
    useCallCallingState
  } = useCallStateHooks()

  const { camera, isMute: isCameraMuted } = useCameraState()
  const { microphone, isMute: isMicMuted } = useMicrophoneState()
  const { screenShare, isMute: isScreenShareMuted } = useScreenShareState()
  const callingState = useCallCallingState()

  // Use recording state passed from parent component
  const isCallRecordingInProgress = isRecording

  const [duration, setDuration] = useState(0)

  // Call duration timer
  useEffect(() => {
    if (callingState === 'joined') {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [callingState])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggleCamera = async () => {
    try {
      await camera.toggle()
    } catch (error) {
      console.error('Failed to toggle camera:', error)
    }
  }

  const handleToggleMicrophone = async () => {
    try {
      await microphone.toggle()
    } catch (error) {
      console.error('Failed to toggle microphone:', error)
    }
  }

  const handleToggleScreenShare = async () => {
    try {
      await screenShare.toggle()
    } catch (error) {
      console.error('Failed to toggle screen share:', error)
    }
  }

  const handleToggleRecording = async () => {
    if (onToggleRecording) {
      onToggleRecording()
    }
    console.log('Recording toggled:', !isRecording)
  }

  return (
    <div className="webinar-control-bar">
      {/* Left section - Webinar info */}
      <div className="control-section-left">
        <div className="webinar-info">
          <div className="live-indicator">
            <Circle className="w-3 h-3 fill-current text-red-500 animate-pulse" />
            <span className="text-sm font-medium text-white">LIVE</span>
          </div>
          <div className="call-duration">
            <span className="text-sm text-gray-300">{formatDuration(duration)}</span>
          </div>
        </div>
      </div>

      {/* Center section - Main controls */}
      <div className="control-section-center">
        <div className="main-controls">
          {/* Microphone */}
          <Button
            variant={isMicMuted ? "outline" : "secondary"}
            size="sm"
            className={`control-button ${isMicMuted ? 'muted' : 'active'}`}
            onClick={handleToggleMicrophone}
          >
            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          {/* Camera */}
          <Button
            variant={isCameraMuted ? "outline" : "secondary"}
            size="sm"
            className={`control-button ${isCameraMuted ? 'muted' : 'active'}`}
            onClick={handleToggleCamera}
          >
            {isCameraMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </Button>

          {/* Screen Share */}
          <Button
            variant={isScreenShareMuted ? "secondary" : "primary"}
            size="sm"
            className={`control-button ${!isScreenShareMuted ? 'sharing' : ''}`}
            onClick={handleToggleScreenShare}
          >
            {isScreenShareMuted ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
          </Button>

          {/* Recording */}
          {showRecording && (
            <div className="control-button-wrapper">
              <Button
                variant={isCallRecordingInProgress ? "outline" : "secondary"}
                size="sm"
                className={`control-button recording ${isCallRecordingInProgress ? 'recording-active' : ''}`}
                onClick={handleToggleRecording}
                title={isCallRecordingInProgress ? 'Stop recording' : 'Start recording'}
                aria-label={isCallRecordingInProgress ? 'Stop recording' : 'Start recording'}
              >
                {isCallRecordingInProgress ? (
                  <Square className="w-4 h-4 fill-current animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}

          {/* Participants */}
          <Button
            variant="secondary"
            size="sm"
            className="control-button participants"
            onClick={onToggleParticipants}
          >
            <Users className="w-4 h-4" />
            <span className="ml-1 text-xs">{participantCount}</span>
          </Button>
        </div>
      </div>

      {/* Right section - End call (Icon only) */}
      <div className="control-section-right">
        <div className="control-button-wrapper">
          <Button
            variant="outline"
            size="sm"
            className="control-button end-call bg-red-600 hover:bg-red-700 text-white border-red-600"
            onClick={onEndCall}
            title="End webinar"
            aria-label="End webinar"
          >
            <Phone className="w-4 h-4 rotate-[135deg]" />
          </Button>
        </div>
      </div>
    </div>
  )
}