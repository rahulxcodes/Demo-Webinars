import React from 'react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Webinar Dashboard
          </h1>
        </div>
      </div>
      
      <div className="px-6 py-8">
        <div className="mb-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            New Webinar
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Webinars
            </h2>
          </div>
          <div className="px-6 py-8">
            <div className="text-center text-gray-500">
              <p>No webinars yet</p>
              <p className="text-sm mt-2">Create your first webinar to get started</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}