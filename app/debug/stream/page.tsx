'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'

export default function StreamDebugPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testStreamConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stream/validate')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Stream SDK Debug</h1>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Stream Connection Test</h2>
          </CardHeader>
          <CardBody>
            <Button
              onClick={testStreamConnection}
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Testing...' : 'Test Stream Connection'}
            </Button>

            {testResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Environment Check</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <p>
                <strong>STREAM_API_KEY:</strong> {process.env.NEXT_PUBLIC_STREAM_API_KEY ? 'Set' : 'Not publicly accessible'}
              </p>
              <p>
                <strong>Server-side credentials:</strong> Check server logs for STREAM_SECRET status
              </p>
              <p className="text-gray-600 mt-4">
                Note: API keys are only visible server-side for security. 
                Use the "Test Stream Connection" button above to verify credentials.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Troubleshooting Guide</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Check Credentials:</strong>
                <p className="text-gray-600">Verify your Stream API key and secret are correctly set in environment variables</p>
              </div>
              <div>
                <strong>2. Stream Dashboard:</strong>
                <p className="text-gray-600">Make sure your Stream app has Video Calling feature enabled</p>
              </div>
              <div>
                <strong>3. Account Status:</strong>
                <p className="text-gray-600">Check if your Stream trial/subscription is active</p>
              </div>
              <div>
                <strong>4. Network:</strong>
                <p className="text-gray-600">Ensure your server can reach Stream.io APIs</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}