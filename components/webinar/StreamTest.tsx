'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function StreamTest() {
  const [testData, setTestData] = useState({
    webinarId: 'demo-webinar-' + Date.now(),
    hostName: 'Test Host',
    attendeeName: 'Test Attendee',
  })
  const [tokenResult, setTokenResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testTokenGeneration = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/webinars/${testData.webinarId}/stream-token?userId=host-123&role=host`
      )
      
      if (response.ok) {
        const data = await response.json()
        setTokenResult(data)
      } else {
        const error = await response.json()
        setTokenResult({ error: error.error || 'Failed to generate token' })
      }
    } catch (error) {
      setTokenResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Stream Video SDK Test</h2>
          <p className="text-gray-600">Test the Stream.io integration and token generation</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="webinarId">Test Webinar ID</Label>
            <Input
              id="webinarId"
              value={testData.webinarId}
              onChange={(e) => setTestData(prev => ({ ...prev, webinarId: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="hostName">Host Name</Label>
            <Input
              id="hostName"
              value={testData.hostName}
              onChange={(e) => setTestData(prev => ({ ...prev, hostName: e.target.value }))}
            />
          </div>

          <Button 
            onClick={testTokenGeneration} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Token Generation'}
          </Button>

          {tokenResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(tokenResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Quick Links:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Host Interface:</strong> 
                <a 
                  href={`/webinar/${testData.webinarId}/host`}
                  target="_blank"
                  className="text-blue-600 hover:underline ml-2"
                >
                  /webinar/{testData.webinarId}/host
                </a>
              </div>
              <div>
                <strong>Attendee Interface:</strong> 
                <a 
                  href={`/join/demo-token?webinar=${testData.webinarId}&name=${testData.attendeeName}`}
                  target="_blank"
                  className="text-blue-600 hover:underline ml-2"
                >
                  /join/demo-token?webinar={testData.webinarId}&name={testData.attendeeName}
                </a>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}