'use client'

import { use, useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  StreamVideo, 
  StreamVideoClient, 
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  CallingState,
  type Call
} from '@stream-io/video-react-sdk'
import { CustomControlBar } from '@/components/webinar/CustomControlBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import '@stream-io/video-react-sdk/dist/css/styles.css'

interface HostInterfaceProps {
  params: Promise<{
    id: string
  }>
}

// Professional Live Webinar Layout Component
function LiveWebinarLayout({
  currentUser,
  onEndWebinar,
  webinar,
  call
}: {
  currentUser: any
  onEndWebinar: () => void
  webinar: any
  call?: any
}) {
  const [showSidebar, setShowSidebar] = useState(false)

  // Stream hooks for call state and participant management
  const { useCallCallingState, useParticipants, useIsCallRecordingInProgress } = useCallStateHooks()
  const callingState = useCallCallingState()
  const participants = useParticipants()
  const isRecordingActive = useIsCallRecordingInProgress()

  // ADD THE MISSING FUNCTION: handleToggleRecording
  const handleToggleRecording = async () => {
    if (!call) {
      console.error('No call available for recording toggle')
      return
    }

    // Check if host recording control is allowed
    if (!webinar?.allowHostRecordingControl) {
      alert('Recording controls are disabled for this webinar')
      return
    }

    try {
      if (isRecordingActive) {
        // Stop recording
        console.log('🛑 Host stopping recording...')
        await call.stopRecording()
        console.log('✅ Recording stopped by host')
      } else {
        // Start recording
        console.log('🔴 Host starting recording...')
        await call.startRecording()
        console.log('✅ Recording started by host')
      }
    } catch (error) {
      console.error('❌ Recording toggle failed:', error)
      
      // Handle specific errors gracefully
      if (error.message.includes('not running') || error.message.includes('egress')) {
        console.warn('Recording state mismatch, ignoring error')
      } else {
        alert(`Recording control failed: ${error.message}`)
      }
    }
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Joining webinar...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we connect you</p>
        </div>
      </div>
    )
  }

  return (
    <StreamTheme className="custom-dark-theme">
      <div className="zoom-layout-container" data-sidebar={showSidebar ? 'open' : 'closed'}>
        {/* Compact Header */}
        <div className="webinar-header">
          <div className="flex justify-between items-center p-3 bg-gray-800 text-white">
            <h1 className="text-xl font-semibold text-white">{webinar?.title}</h1>
            <div className="flex items-center space-x-4">
              {/* Recording Status Indicator */}
              {isRecordingActive && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white">Recording</span>
                </div>
              )}
              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm animate-pulse">
                🔴 LIVE
              </span>
              <span className="text-sm text-white">
                {participants.length} attendees
              </span>
            </div>
          </div>
        </div>

        <div className="main-video-area">
          <SpeakerLayout 
            participantsBarLimit={0}
          />
        </div>

        {/* Collapsible Sidebar */}
        <div className={`collapsible-sidebar ${showSidebar ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="sidebar-header">
            <h3 className="text-white">Attendees ({participants.length})</h3>
            <button 
              className="sidebar-close-btn text-white hover:text-gray-300"
              onClick={() => setShowSidebar(false)}
            >
              ✕
            </button>
          </div>
          <div className="sidebar-content">
            <CallParticipantsList 
              onClose={() => setShowSidebar(false)}
            />
          </div>
        </div>



        <div className="floating-controls">
          <CustomControlBar
            onToggleParticipants={() => setShowSidebar(!showSidebar)}
            participantCount={participants.length}
            onEndCall={onEndWebinar}
            showRecording={true}
            isRecording={isRecordingActive}
            onToggleRecording={handleToggleRecording}
          />
        </div>
      </div>
    </StreamTheme>
  )
}

export default function HostWebinarPage({ params }: HostInterfaceProps) {
  const { id } = use(params) // Unwrap params using React.use() for Next.js 15
  const { data: session } = useSession()  
  const router = useRouter()
  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(null)
  const [call, setCall] = useState<Call | null>(null)
  const [webinar, setWebinar] = useState(null)
  const [isWebinarStarted, setIsWebinarStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRecordingActive, setIsRecordingActive] = useState(false)
  const initializationRef = useRef(false) // Track initialization to prevent duplicates

  const initializeWebinar = useCallback(async () => {
    if (initializationRef.current) {
      console.log('🚫 DUPLICATE PREVENTION: Already initialized, skipping')
      return
    }
    
    if (!session?.user?.id) {
      router.push('/auth/signin')
      return
    }

    initializationRef.current = true
    console.log('🔍 DUPLICATE FIX: Starting single initialization for webinar:', id)
    console.log('👤 DUPLICATE FIX: Session user ID:', session.user.id)

    try {
      // Fetch webinar details using webinar ID
      const webinarResponse = await fetch(`/api/webinars/${id}`)
      const webinarData = await webinarResponse.json()
      
      if (!webinarResponse.ok) {
        throw new Error(webinarData.error || 'Failed to fetch webinar')
      }

      // Extract webinar from response structure
      const webinar = webinarData.webinar || webinarData
      setWebinar(webinar)
      
      console.log('✅ DUPLICATE FIX: Webinar loaded:', webinar?.title)

      // Get Stream token for host using streamCallId
      const streamCallId = webinar.streamCallId || id
      console.log('🎥 DUPLICATE FIX: Stream Call ID:', streamCallId)
      
      const tokenResponse = await fetch(`/api/stream-token/${streamCallId}?userId=${session.user.id}&role=host`)
      const { token, apiKey } = await tokenResponse.json()

      console.log('🔑 DUPLICATE FIX: Token generated for user:', session.user.id)
      
      // Initialize Stream client with getOrCreateInstance to prevent duplicates
      const client = StreamVideoClient.getOrCreateInstance({
        apiKey,
        user: {
          id: session.user.id, // Use actual user ID
          name: session.user.name || 'Host',
          role: 'host'
        },
        token,
      })

      console.log('🌊 DUPLICATE FIX: Stream client created for user:', session.user.id)

      // Join the existing Stream call using streamCallId
      const streamCall = client.call('livestream', streamCallId)
      
      console.log('📞 DUPLICATE FIX: Attempting to join call:', streamCallId)
      await streamCall.join({ create: false })
      console.log('✅ DUPLICATE FIX: Successfully joined call')

      setStreamClient(client)
      setCall(streamCall)
      
      // Check if webinar is already live
      if (webinar.status === 'live') {
        setIsWebinarStarted(true)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('❌ DUPLICATE FIX: Failed to initialize webinar:', error)
      setError(error.message)
      setIsLoading(false)
      initializationRef.current = false // Reset on error
    }
  }, [id, session?.user?.id, router])

  useEffect(() => {
    initializeWebinar()

    // Cleanup function to properly disconnect when component unmounts
    return () => {
      if (streamClient) {
        console.log('🧹 DUPLICATE FIX: Cleaning up Stream client')
        streamClient.disconnectUser()
        initializationRef.current = false // Reset initialization flag
      }
    }
  }, [initializeWebinar, streamClient])

  const handleStartWebinar = async () => {
    if (!call) return
    
    setIsLoading(true)
    try {
      console.log('🎬 RECORDING FIX: Starting webinar with auto-record settings...')
      
      // Configure call settings including recording
      await call.update({
        settings_override: {
          recording: {
            mode: webinar?.autoRecord ? 'auto-on' : 'available',
            quality: webinar?.recordingQuality || '720p'
          },
          screensharing: {
            enabled: true,
            access_request_enabled: true
          }
        }
      })
      
      // Start the webinar via API
      const response = await fetch(`/api/webinars/${id}/start`, {
        method: 'POST'
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to start webinar')
      }

      // Make the call go live
      console.log('📺 RECORDING FIX: Making call go live...')
      await call.goLive({
        start_hls: true,
        start_recording: webinar?.autoRecord, // Auto-start recording if enabled
      })
      
      // If auto-record is enabled, ensure recording starts
      if (webinar?.autoRecord) {
        try {
          console.log('🔴 RECORDING FIX: Starting auto-recording...')
          await call.startRecording()
          setIsRecordingActive(true)
          console.log('✅ RECORDING FIX: Auto-recording started successfully')
        } catch (recordingError) {
          console.warn('⚠️ RECORDING FIX: Auto-recording failed to start:', recordingError)
          // Don't fail the webinar start if recording fails
          setIsRecordingActive(false)
        }
      }

      setIsWebinarStarted(true)
      setWebinar(prev => ({ ...prev, status: 'live' }))
      
    } catch (error) {
      console.error('❌ RECORDING FIX: Failed to start webinar:', error)
      alert(`Failed to start webinar: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndWebinar = async () => {
    if (!call) return
    
    try {
      console.log('🛑 RECORDING FIX: Ending webinar...')
      
      // Check recording status before stopping
      try {
        const callState = await call.queryCall()
        const isActuallyRecording = callState.call.egress?.recording
        
        if (isActuallyRecording || isRecordingActive) {
          console.log('⏹️ RECORDING FIX: Stopping recording before ending webinar...')
          await call.stopRecording()
          setIsRecordingActive(false)
          console.log('✅ RECORDING FIX: Recording stopped successfully')
        } else {
          console.log('ℹ️ RECORDING FIX: No active recording to stop')
        }
      } catch (recordingError) {
        console.warn('⚠️ RECORDING FIX: Recording stop failed (continuing with webinar end):', recordingError)
        // Don't fail webinar end if recording stop fails
      }
      
      // Leave the call
      console.log('👋 RECORDING FIX: Leaving webinar call...')
      await call.leave()
      
      // Update webinar status via API
      console.log('💾 RECORDING FIX: Updating webinar status...')
      await fetch(`/api/webinars/${id}/end`, { method: 'POST' })
      
      setIsWebinarStarted(false)
      setCall(null)
      console.log('✅ RECORDING FIX: Webinar ended successfully')
      
      // Redirect back to dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('❌ RECORDING FIX: Error ending webinar:', error)
      // Always clean up local state even if API calls fail
      setIsWebinarStarted(false)
      setCall(null)
      router.push('/dashboard')
    }
  }



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-white text-lg">Loading webinar...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  // Show professional webinar interface when started
  if (isWebinarStarted && call && streamClient) {
    return (
      <ErrorBoundary>
        <StreamVideo client={streamClient}>
          <StreamCall call={call}>
            <LiveWebinarLayout 
              currentUser={session?.user} 
              onEndWebinar={handleEndWebinar} 
              webinar={webinar}
              call={call}
            />
          </StreamCall>
        </StreamVideo>
      </ErrorBoundary>
    )
  }

  // Show webinar start interface
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Webinar Host Control</h1>
          <div className="text-sm text-gray-600">
            Welcome, {session?.user?.name}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎥 {webinar?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-600">
              <p>Ready to start your webinar?</p>
              <p className="text-sm mt-1">
                Stream ID: <code className="bg-gray-100 px-2 py-1 rounded">{webinar?.streamCallId}</code>
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                What happens when you start:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Professional video interface will launch</li>
                <li>• Recording will begin automatically</li>
                <li>• Registered attendees can join immediately</li>
                <li>• You'll have full host controls</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleStartWebinar} 
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Webinar...
                </>
              ) : (
                <>
                  🚀 Start Webinar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}