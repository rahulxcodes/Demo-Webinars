import StreamTest from '@/components/webinar/StreamTest'

export default function TestStreamPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stream Video SDK Test Page
          </h1>
          <p className="text-gray-600">
            Test the live webinar functionality and Stream.io integration
          </p>
        </div>
        <StreamTest />
      </div>
    </div>
  )
}