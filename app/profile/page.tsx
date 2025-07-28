'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { UserCircleIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
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
          <p className="text-gray-600 mb-8">You need to be logged in to access your profile.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {session.user?.image ? (
                  <img
                    className="h-20 w-20 rounded-full"
                    src={session.user.image}
                    alt=""
                  />
                ) : (
                  <UserCircleIcon className="h-20 w-20 text-gray-400" />
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.user?.name || 'User'}
                </h1>
                <p className="text-sm text-gray-600">
                  {session.user?.email}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {(session.user as any)?.role || 'ATTENDEE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {(session.user as any)?.role === 'HOST' || (session.user as any)?.role === 'ADMIN' ? (
                  <>
                    <Link href="/dashboard">
                      <Button className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        View Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/new-webinar">
                      <Button variant="outline" className="w-full justify-start">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Create New Webinar
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No webinars yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You'll see your registered webinars here once you join some.
                    </p>
                    <Button variant="outline">
                      Browse Available Webinars
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {session.user?.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {session.user?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {(session.user as any)?.role || 'ATTENDEE'}
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recent activity
              </h3>
              <p className="text-gray-600">
                Your webinar activity will appear here.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}