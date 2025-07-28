import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { VideoCameraIcon, UserGroupIcon, ChartBarIcon, PlayIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Modern Webinar Platform
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Create Amazing
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
              Webinars
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Host professional webinars with crystal-clear video, interactive features, and powerful analytics. 
            Connect with your audience like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                <PlayIcon className="h-5 w-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/dashboard/new-webinar">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Create Your First Webinar
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-24 animate-slide-up">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need for successful webinars
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-large transition-all duration-300 group">
              <CardBody className="py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <VideoCameraIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">HD Video Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  Crystal clear video streaming with adaptive bitrate for smooth presentations across all devices
                </p>
              </CardBody>
            </Card>
            
            <Card className="text-center hover:shadow-large transition-all duration-300 group">
              <CardBody className="py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-success-100 to-success-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Features</h3>
                <p className="text-gray-600 leading-relaxed">
                  Engage your audience with real-time chat, polls, Q&A sessions, and screen sharing capabilities
                </p>
              </CardBody>
            </Card>
            
            <Card className="text-center hover:shadow-large transition-all duration-300 group">
              <CardBody className="py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-warning-100 to-warning-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="h-8 w-8 text-warning-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Powerful Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track attendance, engagement metrics, and performance insights to improve your webinars
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center animate-slide-up">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 border-0">
            <CardBody className="py-16">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to start hosting amazing webinars?
              </h2>
              <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of creators, educators, and businesses who trust our platform for their webinar needs.
              </p>
              <Link href="/dashboard/new-webinar">
                <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-50">
                  Create Your First Webinar Now
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}