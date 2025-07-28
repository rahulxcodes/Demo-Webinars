'use client'

import { use, useEffect, useState } from 'react'
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
  webinar
}: {
  currentUser: any
  onEndWebinar: () => void
  webinar: any
}) {
  const [showSidebar, setShowSidebar] = useState(false)

  // Stream hooks for call state and participant management
  const { useCallCallingState, useParticipants } = useCallStateHooks()
  const callingState = useCallCallingState()
  const participants = useParticipants()

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
        {/* Webinar Header */}
        <div className="webinar-header">
          <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <h1 className="text-xl font-semibold">{webinar?.title}</h1>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm animate-pulse">
                LIVE
              </span>
              <span className="text-sm text-gray-300">
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

        <div className={`collapsible-sidebar ${showSidebar ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="sidebar-header">
            <h3>Attendees ({participants.length})</h3>
            <button 
              className="sidebar-close-btn"
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

        <div className="participants-bottom-strip">
          <div className="participants-preview">
            {participants.slice(0, 4).map((participant, index) => (
              <div key={participant.sessionId} className="participant-tile">
                <span>{participant.name?.charAt(0) || 'A'}</span>
              </div>
            ))}
            {participants.length > 4 && (
              <div className="participant-tile more-count">
                +{participants.length - 4}
              </div>
            )}
          </div>
        </div>

        <div className="floating-controls">
          <CustomControlBar
            onToggleParticipants={() => setShowSidebar(!showSidebar)}
            participantCount={participants.length}
            onEndCall={onEndWebinar}
            showRecording={true}
            webinarTitle={webinar?.title}
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

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/auth/signin')
      return
    }

    async function initializeWebinar() {
      try {
        // Fetch webinar details
        const webinarResponse = await fetch(`/api/webinars/${id}`)
        const webinarData = await webinarResponse.json()
        
        if (!webinarResponse.ok) {
          throw new Error(webinarData.error || 'Failed to fetch webinar')
        }

        setWebinar(webinarData)

        // Get Stream token for host
        const tokenResponse = await fetch(`/api/stream-token/${id}?userId=${session.user.id}&role=host`)
        const { token, apiKey } = await tokenResponse.json()

        // Initialize Stream client with getOrCreateInstance to prevent duplicates
        const client = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user: {
            id: session.user.id,
            name: session.user.name || 'Host',
            role: 'host'
          },
          token,
        })

        // Join the existing Stream call
        const streamCall = client.call('livestream', id)
        await streamCall.join({ create: false })

        setStreamClient(client)
        setCall(streamCall)
        
        // Check if webinar is already live
        if (webinarData.status === 'live') {
          setIsWebinarStarted(true)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize webinar:', error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    initializeWebinar()

    // Cleanup function to properly disconnect when component unmounts
    return () => {
      if (streamClient) {
        streamClient.disconnectUser()
      }
    }
  }, [id, session?.user?.id, router, streamClient])

  const handleStartWebinar = async () => {
    setIsLoading(true)
    try {
      // Start the webinar via API
      const response = await fetch(`/api/webinars/${id}/start`, {
        method: 'POST'
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to start webinar')
      }

      // Make the call go live
      if (call) {
        await call.goLive({
          start_hls: true,
          start_recording: true,
        })
      }

      setIsWebinarStarted(true)
      setWebinar(prev => ({ ...prev, status: 'live' }))
      
    } catch (error) {
      console.error('Failed to start webinar:', error)
      alert(`Failed to start webinar: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndWebinar = async () => {
    try {
      // Stop recording
      if (call) {
        await call.stopRecording()
        
        // Leave the call
        await call.leave()
      }
      
      // Update webinar status via API
      await fetch(`/api/webinars/${id}/end`, { method: 'POST' })
      
      setIsWebinarStarted(false)
      setCall(null)
      
      // Redirect back to dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Failed to end webinar:', error)
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