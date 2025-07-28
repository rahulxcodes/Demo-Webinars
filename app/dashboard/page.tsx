import React from 'react'
import Link from 'next/link'
import { PlusIcon, VideoCameraIcon, CalendarIcon, UsersIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardBody } from '@/components/ui/card'

const stats = [
  {
    name: 'Total Webinars',
    value: '0',
    icon: VideoCameraIcon,
    color: 'bg-primary-50 text-primary-600',
  },
  {
    name: 'Upcoming',
    value: '0',
    icon: CalendarIcon,
    color: 'bg-warning-50 text-warning-600',
  },
  {
    name: 'Total Attendees',
    value: '0',
    icon: UsersIcon,
    color: 'bg-success-50 text-success-600',
  },
]

export default function DashboardPage() {
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
          {stats.map((stat) => (
            <Card key={stat.name} className="transition-all duration-200 hover:shadow-medium">
              <CardBody className="flex items-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
              <span className="text-sm text-gray-500">0 webinars</span>
            </div>
          </CardHeader>
          <CardBody className="py-12">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center mb-6">
                <VideoCameraIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No webinars yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Start by creating your first webinar. Share your knowledge with the world!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/new-webinar">
                  <Button size="lg">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Your First Webinar
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  View Templates
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}