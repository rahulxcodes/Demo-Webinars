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

// Host Video Interface Component
function HostVideoInterface({ callId }: { callId: string }) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks()
  const callingState = useCallCallingState()
  const participantCount = useParticipantCount()

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-semibold">Host Interface</h1>
            <p className="text-gray-400">Call ID: {callId}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white">{participantCount} participants</span>
            </div>
            <div className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">
              {callingState}
            </div>
          </div>
        </div>
      </div>

      {/* Video Layout */}
      <div className="flex-1 relative">
        <SpeakerLayout />
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
        <CallControls />
      </div>

      {/* Participants Sidebar */}
      <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-white font-semibold mb-4">Participants</h3>
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

        // Initialize Stream client
        const streamClient = new StreamVideoClient({
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
        await streamCall.join()
        setCall(streamCall)

        setLoading(false)
      } catch (err) {
        console.error('Failed to initialize call:', err)
        setError(err.message || 'Failed to join webinar')
        setLoading(false)
      }
    }

    initializeCall()
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