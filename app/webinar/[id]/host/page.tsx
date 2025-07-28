'use client'

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  StreamVideo, 
  StreamVideoClient, 
  StreamCall,
  useCallStateHooks,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'

interface HostInterfaceProps {
  params: Promise<{
    id: string
  }>
}

// Enhanced Host Video Interface Component
function HostVideoInterface({ callId }: { callId: string }) {
  const { 
    useCallCallingState, 
    useParticipantCount,
    useCallEndedAt,
    useCallStartsAt,
    useCallCreatedAt,
    useParticipants
  } = useCallStateHooks()
  
  const callingState = useCallCallingState()
  const participantCount = useParticipantCount()
  const callEndedAt = useCallEndedAt()
  const callStartsAt = useCallStartsAt()
  const callCreatedAt = useCallCreatedAt()
  const participants = useParticipants()

  // Calculate call duration
  const [duration, setDuration] = useState(0)
  useEffect(() => {
    if (callingState === 'joined') {
      const interval = setInterval(() => {
        const startTime = callStartsAt || callCreatedAt || new Date()
        const now = new Date()
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setDuration(diff)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [callingState, callStartsAt, callCreatedAt])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-black/30 backdrop-blur-sm px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">LIVE</span>
            </div>
            <div className="text-gray-300">|</div>
            <div>
              <h1 className="text-white text-xl font-semibold">Host Dashboard</h1>
              <p className="text-gray-400 text-sm">Stream ID: {callId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Call Duration */}
            <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white text-sm font-mono">{formatDuration(duration)}</span>
            </div>
            
            {/* Participant Count */}
            <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-white font-medium">{participantCount}</span>
              <span className="text-gray-400 text-sm">viewers</span>
            </div>
            
            {/* Call Status */}
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
              callingState === 'joined' ? 'bg-green-600 text-white' :
              callingState === 'connecting' ? 'bg-yellow-600 text-white' :
              'bg-red-600 text-white'
            }`}>
              {callingState === 'joined' ? 'Connected' : 
               callingState === 'connecting' ? 'Connecting...' : 
               callingState}
            </div>
          </div>
        </div>
      </div>

      {/* Video Layout with improved styling */}
      <div className="flex-1 relative bg-black">
        <SpeakerLayout 
          participantsBarPosition="bottom" 
          ParticipantViewUISpotlight={{
            muteButton: true,
            videoMuteButton: true,
            screenShareButton: true,
          }}
        />
        
        {/* Overlay for empty state */}
        {participantCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-medium mb-2">Waiting for participants</h3>
              <p className="text-gray-400">Share your webinar link to invite attendees</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Control Bar */}
      <div className="bg-black/40 backdrop-blur-sm px-6 py-4 border-t border-gray-700/50">
        <div className="flex items-center justify-center">
          <div className="bg-gray-800/80 rounded-xl p-2">
            <CallControls />
          </div>
        </div>
      </div>

      {/* Enhanced Participants Sidebar */}
      <div className="absolute right-4 top-20 bottom-20 w-80 bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-white font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Participants ({participantCount})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <CallParticipantsList />
        </div>
      </div>
    </div>
  )
}

export default function HostInterface({ params }: HostInterfaceProps) {
  const { id } = use(params) // Unwrap params using React.use() for Next.js 15
  const { data: session } = useSession()  
  const router = useRouter()
  const [client, setClient] = useState<StreamVideoClient | null>(null)
  const [call, setCall] = useState(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/auth/signin')
      return
    }

    async function initializeCall() {
      try {
        // Get Stream token for this user
        const tokenResponse = await fetch(`/api/stream-token/${id}?userId=${session.user.id}&role=host`)
        
        if (!tokenResponse.ok) {
          throw new Error('Failed to get Stream token')
        }

        const { token: streamToken, apiKey } = await tokenResponse.json()
        setToken(streamToken)

        // Initialize Stream client with getOrCreateInstance to prevent duplicates
        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user: {
            id: session.user.id,
            name: session.user.name || 'Host',
          },
          token: streamToken,
        })

        setClient(streamClient)

        // Join the call
        const streamCall = streamClient.call('livestream', id)
        await streamCall.join({ create: false, data: { custom: { isHost: true } } })
        setCall(streamCall)

        setLoading(false)
      } catch (err) {
        console.error('Failed to initialize call:', err)
        setError(err.message || 'Failed to join webinar')
        setLoading(false)
      }
    }

    initializeCall()

    // Cleanup function to properly disconnect when component unmounts
    return () => {
      if (client) {
        client.disconnectUser()
      }
    }
  }, [session, id, router])

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white">Connecting to webinar...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Failed to Join Webinar</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Show video interface
  if (client && call) {
    return (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <HostVideoInterface callId={id} />
        </StreamCall>
      </StreamVideo>
    )
  }

  return null
}