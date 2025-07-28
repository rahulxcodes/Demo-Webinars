'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { WebinarStats, Webinar } from '@/lib/types'
import { formatWebinarStatus } from '@/lib/utils/webinar-status'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { WebinarCard } from '@/components/ui/WebinarCard'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to access the dashboard.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [stats, setStats] = useState<WebinarStats>({ total: 0, upcoming: 0, past: 0, live: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Debounce search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    fetchWebinars()
    fetchStats()
  }, [])

  const fetchWebinars = useCallback(async () => {
    try {
      const response = await fetch('/api/webinars?limit=20')
      if (response.ok) {
        const data = await response.json()
        setWebinars(data.webinars)
      }
    } catch (error) {
      console.error('Error fetching webinars:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/webinars/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  const handleDeleteWebinar = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this webinar?')) {
      try {
        const response = await fetch(`/api/webinars/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setWebinars(prev => prev.filter(w => w.id !== id))
          fetchStats() // Refresh stats after deletion
        }
      } catch (error) {
        console.error('Error deleting webinar:', error)
      }
    }
  }, [fetchStats])

  // Memoized filtered webinars for better performance
  const filteredWebinars = useMemo(() => 
    webinars.filter(webinar =>
      webinar.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (webinar.description && webinar.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    ), [webinars, debouncedSearchTerm]
  )

  // Memoized stats data for performance
  const statsData = useMemo(() => [
    {
      id: 1,
      title: 'Total Webinars',
      value: stats.total.toString(),
      change: stats.total > 0 ? 'Active' : 'None',
      changeType: stats.total > 0 ? 'positive' : 'neutral',
      icon: VideoCameraIcon,
      color: 'bg-primary-50 text-primary-600',
    },
    {
      id: 2,
      title: 'Upcoming',
      value: stats.upcoming.toString(),
      change: stats.upcoming > 0 ? 'Scheduled' : 'None',
      changeType: stats.upcoming > 0 ? 'positive' : 'neutral',
      icon: ClockIcon,
      color: 'bg-warning-50 text-warning-600',
    },
    {
      id: 3,
      title: 'Live Now',
      value: stats.live.toString(),
      change: stats.live > 0 ? 'Broadcasting' : 'None',
      changeType: stats.live > 0 ? 'positive' : 'neutral',
      icon: ChartBarIcon,
      color: 'bg-success-50 text-success-600',
    },
  ], [stats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Let's create something amazing today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat) => (
            <Card key={stat.id} className="transition-all duration-200 hover:shadow-medium">
              <CardBody className="flex items-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'}`}>
                    {stat.change}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Action Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/dashboard/new-webinar">
              <Button size="lg" className="w-full sm:w-auto">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Webinar
              </Button>
            </Link>
            
            <div className="max-w-md w-full">
              <Input
                placeholder="Search webinars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>

        {/* Webinars Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Webinars
              </h2>
              <span className="text-sm text-gray-500">
                {filteredWebinars.length} webinars
              </span>
            </div>
          </CardHeader>
          <CardBody>
            {filteredWebinars.length === 0 ? (
              <div className="text-center py-12">
                <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No webinars yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first webinar.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/new-webinar">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Webinar
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWebinars.map((webinar) => (
                  <WebinarCard 
                    key={webinar.id} 
                    webinar={webinar} 
                    onDelete={handleDeleteWebinar}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}