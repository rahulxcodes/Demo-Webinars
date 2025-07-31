import { NextResponse } from 'next/server'
import { StreamVideoClient } from '@stream-io/video-client'

export async function GET() {
  try {
    const apiKey = process.env.STREAM_API_KEY
    const secret = process.env.STREAM_SECRET

    if (!apiKey || !secret) {
      return NextResponse.json({
        valid: false,
        error: 'Stream credentials not configured',
        apiKey: apiKey ? 'Set' : 'Missing',
        secret: secret ? 'Set' : 'Missing'
      })
    }

    // Test Stream client initialization
    const streamClient = new StreamVideoClient({
      apiKey
    })

    // Test basic client functionality
    const testCall = streamClient.call('default', 'test-call-id')
    console.log('Stream client initialized successfully')

    return NextResponse.json({
      valid: true,
      message: 'Stream credentials are valid',
      apiKey: apiKey.substring(0, 8) + '...',
      clientInitialized: !!testCall
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "No stack trace available";
    
    return NextResponse.json({
      valid: false,
      error: errorMsg,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    })
  }
}