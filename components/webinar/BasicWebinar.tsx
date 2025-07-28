'use client'

import { useEffect, useState } from 'react'
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
} from '@stream-io/video-react-sdk'
import type { User } from '@stream-io/video-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import '@stream-io/video-react-sdk/dist/css/styles.css'

interface BasicWebinarProps {
  webinarId: string
  userRole: 'host' | 'attendee'
  userId: string
  userName: string
}

export default function BasicWebinar({ 
  webinarId, 
  userRole, 
  userId, 
  userName 
}: BasicWebinarProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null)
  const [call, setCall] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeStream = async () => {
      try {
        setLoading(true)
        
        // Get Stream token from API
        const response = await fetch(
          `/api/webinars/${webinarId}/stream-token?userId=${userId}&role=${userRole}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to get Stream token')
        }
        
        const { token, apiKey, callId } = await response.json()
        
        // Initialize Stream client
        const user: User = {
          id: userId,
          name: userName,
        }
        
        const streamClient = new StreamVideoClient({
          apiKey,
          user,
          token,
        })
        
        setClient(streamClient)
        
        // Join the call
        const streamCall = streamClient.call('default', callId)
        
        if (userRole === 'host') {
          // Host creates/joins the call
          await streamCall.getOrCreate({
            data: {
              created_by_id: userId,
              settings_override: {
                audio: {
                  mic_default_on: true,
                },
                video: {
                  camera_default_on: true,
                },
              },
            },
          })
        } else {
          // Attendee joins existing call
          await streamCall.get()
        }
        
        await streamCall.join()
        setCall(streamCall)
        
      } catch (err) {
        console.error('Error initializing Stream:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize video')
      } finally {
        setLoading(false)
      }
    }

    initializeStream()

    return () => {
      if (call) {
        call.leave()
      }
      if (client) {
        client.disconnectUser()
      }
    }
  }, [webinarId, userRole, userId, userName])

  if (loading) {
    return (
      <Card className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to webinar...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (!client || !call) {
    return (
      <Card className="flex items-center justify-center h-96">
        <p className="text-gray-600">Unable to connect to webinar</p>
      </Card>
    )
  }

  return (
    <div className="webinar-container h-full">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <StreamTheme>
            <div className="flex flex-col h-full">
              {/* Video Layout */}
              <div className="flex-1 relative">
                <SpeakerLayout />
              </div>
              
              {/* Call Controls */}
              <div className="p-4 bg-white border-t">
                <WebinarControls userRole={userRole} />
              </div>
            </div>
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  )
}

function WebinarControls({ userRole }: { userRole: 'host' | 'attendee' }) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks()
  const callingState = useCallCallingState()
  const participantCount = useParticipantCount()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {participantCount} participant{participantCount !== 1 ? 's' : ''}
        </span>
        <span className="text-sm text-gray-600">
          Role: {userRole === 'host' ? 'Host' : 'Attendee'}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {userRole === 'host' ? (
          <CallControls />
        ) : (
          <div className="text-sm text-gray-500">
            Viewing as attendee
          </div>
        )}
      </div>
    </div>
  )
}