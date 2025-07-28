import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Webinar Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Professional educational video calling platform with Stream.io. 
          Create, manage, and host webinars with ease.
        </p>
        <div className="space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-3">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/new-webinar">
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Create Webinar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}