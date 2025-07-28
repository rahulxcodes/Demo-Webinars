'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, UsersIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import BasicWebinar from '@/components/webinar/BasicWebinar'

interface Webinar {
  id: string
  title: string
  description: string
  startTime: string
  duration: number
  status: string
}

export default function HostWebinarPage() {
  const params = useParams()
  const webinarId = params.id as string
  const [webinar, setWebinar] = useState<Webinar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  // Mock user data - in real app, get from auth
  const userId = 'host-' + webinarId
  const userName = 'Webinar Host'

  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        const response = await fetch(`/api/webinars/${webinarId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch webinar')
        }
        const data = await response.json()
        setWebinar(data.webinar)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load webinar')
      } finally {
        setLoading(false)
      }
    }

    if (webinarId) {
      fetchWebinar()
    }
  }, [webinarId])

  const handleStartWebinar = () => {
    setIsLive(true)
  }

  const handleEndWebinar = () => {
    setIsLive(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !webinar) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-8">
            <p className="text-red-600 mb-4">{error || 'Webinar not found'}</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{webinar.title}</h1>
                <p className="text-gray-600">Host Interface</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isLive ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">LIVE</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Not Live</span>
              )}
            </div>
          </div>
        </div>

        {/* Pre-webinar Controls */}
        {!isLive && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Ready to Start?</h2>
              <p className="text-gray-600">
                Click "Start Webinar" to begin the live session. Attendees will be able to join once you go live.
              </p>
            </CardHeader>
            <CardBody>
              <div className="flex items-center space-x-4">
                <Button onClick={handleStartWebinar} className="bg-red-600 hover:bg-red-700">
                  Start Webinar
                </Button>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UsersIcon className="h-4 w-4" />
                  <span>Registration Link: /register/{webinarId}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Live Webinar Interface */}
        {isLive && (
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold">Live Webinar</h2>
              <Button 
                onClick={handleEndWebinar}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                End Webinar
              </Button>
            </CardHeader>
            <CardBody className="flex-1 p-0">
              <BasicWebinar
                webinarId={webinarId}
                userRole="host"
                userId={userId}
                userName={userName}
              />
            </CardBody>
          </Card>
        )}

        {/* Webinar Info */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">Webinar Details</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="ml-2 text-gray-600">{webinar.duration} minutes</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-gray-600">{webinar.status}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Description:</span>
                <p className="mt-1 text-gray-600">{webinar.description}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}