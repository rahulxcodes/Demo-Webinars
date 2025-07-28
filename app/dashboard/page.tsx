import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Webinar Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your webinars and create new ones
          </p>
        </div>
        
        <div className="mb-6">
          <Link href="/dashboard/new-webinar">
            <Button size="lg">
              New Webinar
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Webinars
            </h2>
          </div>
          <div className="px-6 py-8">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No webinars yet</p>
              <p className="text-sm text-gray-500 mb-4">Create your first webinar to get started</p>
              <Link href="/dashboard/new-webinar">
                <Button variant="outline">
                  Create Webinar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}