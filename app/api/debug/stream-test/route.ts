import { NextRequest, NextResponse } from 'next/server'
import { StreamVideoClient } from '@stream-io/video-client'

export async function GET() {
  console.log('=== Stream Video SDK Debug Test Starting ===')
  
  try {
    // Step 1: Check environment variables
    console.log('Step 1: Checking environment variables...')
    const apiKey = process.env.STREAM_API_KEY
    const secret = process.env.STREAM_SECRET
    
    console.log('STREAM_API_KEY exists:', !!apiKey)
    console.log('STREAM_SECRET exists:', !!secret)
    console.log('STREAM_API_KEY length:', apiKey?.length || 0)
    console.log('STREAM_SECRET length:', secret?.length || 0)
    
    if (!apiKey || !secret) {
      return NextResponse.json({
        success: false,
        error: 'Missing Stream environment variables',
        details: {
          hasApiKey: !!apiKey,
          hasSecret: !!secret
        }
      })
    }

    // Step 2: Initialize Stream client
    console.log('Step 2: Initializing Stream client...')
    const streamClient = new StreamVideoClient({
      apiKey,
      secret
    })
    console.log('Stream client initialized successfully')

    // Step 3: Test call creation
    console.log('Step 3: Testing call creation...')
    const testCallId = `debug-test-${Date.now()}`
    const testUserId = 'debug-test-user'
    
    const call = streamClient.call('livestream', testCallId)
    console.log('Call object created:', call.cid)

    // Step 3.5: Generate token and connect user first before creating call
    console.log('Step 3.5: Generating token and connecting user...')
    const jwt = await import('jsonwebtoken')
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      user_id: testUserId,
      iss: 'https://pronto.getstream.io',
      sub: 'user/' + testUserId,
      iat: now - 60,
      exp: now + 3600,
    }
    const token = jwt.sign(payload, secret!, { algorithm: 'HS256' })
    
    await streamClient.connectUser(
      { 
        id: testUserId, 
        name: 'Debug Test User',
      },
      token
    )
    console.log('User connected successfully')

    // Step 4: Create call with user
    console.log('Step 4: Creating call with member...')
    const createResult = await call.getOrCreate({
      data: {
        created_by_id: testUserId,
        custom: {
          call_type: 'debug_test',
          title: 'Debug Test Call'
        }
      },
      members: [
        {
          user_id: testUserId,
          role: 'admin'
        }
      ]
    })
    console.log('Call created successfully:', createResult.call.id)

    // Step 5: Test going live
    console.log('Step 5: Testing go live functionality...')
    try {
      await call.goLive()
      console.log('Call went live successfully')
      
      // Step 6: End the test call
      console.log('Step 6: Ending test call...')
      await call.endCall()
      console.log('Test call ended successfully')
      
      return NextResponse.json({
        success: true,
        message: 'All Stream Video SDK tests passed',
        details: {
          environmentCheck: 'PASS',
          clientInit: 'PASS',
          callCreation: 'PASS',
          goLive: 'PASS',
          callEnd: 'PASS',
          callId: testCallId
        }
      })
    } catch (liveError) {
      console.error('Go live failed:', liveError)
      
      // Try to clean up
      try {
        await call.endCall()
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError)
      }
      
      return NextResponse.json({
        success: false,
        error: 'Go live test failed',
        details: {
          environmentCheck: 'PASS',
          clientInit: 'PASS',
          callCreation: 'PASS',
          goLive: 'FAIL',
          error: liveError.message,
          callId: testCallId
        }
      })
    }
  } catch (error) {
    console.error('Stream test failed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json({
      success: false,
      error: 'Stream test failed',
      details: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    })
  }
}