'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import BasicWebinar from '@/components/webinar/BasicWebinar'

interface Registration {
  id: string
  webinarId: string
  userName: string
  userEmail: string
  webinar: {
    id: string
    title: string
    description: string
    startTime: string
    duration: number
  }
}

export default function JoinWebinarPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string
  
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasJoined, setHasJoined] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Mock token validation - in real app, validate with backend
        const webinarId = searchParams.get('webinar') || 'demo-webinar'
        const email = searchParams.get('email') || 'attendee@example.com'
        const name = searchParams.get('name') || 'Webinar Attendee'
        
        // Mock registration data
        const mockRegistration: Registration = {
          id: token,
          webinarId: webinarId,
          userName: name,
          userEmail: email,
          webinar: {
            id: webinarId,
            title: 'Demo Webinar', 
            description: 'Live webinar session',
            startTime: new Date().toISOString(),
            duration: 60
          }
        }
        
        setRegistration(mockRegistration)
        setUserName(name)
      } catch (err) {
        setError('Invalid or expired join link')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      validateToken()
    }
  }, [token, searchParams])

  const handleJoinWebinar = () => {
    if (userName.trim()) {
      setHasJoined(true)
    }
  }

  const handleLeaveWebinar = () => {
    setHasJoined(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardBody className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating join link...</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardBody className="text-center p-8">
            <p className="text-red-600 mb-4">{error || 'Invalid join link'}</p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Homepage
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Join Webinar</h1>
            <h2 className="text-lg text-gray-600 text-center">{registration.webinar.title}</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Email:</strong> {registration.userEmail}</p>
              <p><strong>Duration:</strong> {registration.webinar.duration} minutes</p>
            </div>
            
            <Button 
              onClick={handleJoinWebinar} 
              className="w-full"
              disabled={!userName.trim()}
            >
              Join Webinar
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              By joining, you agree to participate in this live webinar session.
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{registration.webinar.title}</h1>
              <p className="text-gray-600">Welcome, {userName}</p>
            </div>
            <Button 
              onClick={handleLeaveWebinar}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Leave Webinar
            </Button>
          </div>
        </div>

        {/* Webinar Stream */}
        <Card className="h-[calc(100vh-200px)]">
          <CardBody className="flex-1 p-0">
            <BasicWebinar
              webinarId={registration.webinarId}
              userRole="attendee"
              userId={`attendee-${token}`}
              userName={userName}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}