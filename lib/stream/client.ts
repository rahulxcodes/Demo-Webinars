import { StreamVideoClient } from '@stream-io/video-client'

const apiKey = process.env.STREAM_API_KEY
const secret = process.env.STREAM_SECRET

if (!apiKey || !secret) {
  throw new Error('Stream API credentials are not configured. Please check your environment variables.')
}

export const streamServerClient = new StreamVideoClient({
  apiKey,
  secret,
})

export async function generateStreamToken(userId: string) {
  try {
    // Import jwt dynamically
    const jwt = await import('jsonwebtoken')
    
    const payload = {
      user_id: userId,
      iss: 'https://pronto.getstream.io',
      sub: 'user/' + userId,
      iat: Math.round(new Date().getTime() / 1000),
      exp: Math.round(new Date().getTime() / 1000) + 3600, // 1 hour
    }
    
    const token = jwt.sign(payload, secret!, { algorithm: 'HS256' })
    return token
  } catch (error) {
    console.error('Failed to generate Stream token:', error)
    throw new Error('Failed to generate Stream token')
  }
}

export async function createWebinarCall(
  callId: string, 
  createdByUserId: string, 
  webinarTitle: string,
  scheduledFor: Date,
  maxParticipants: number = 1000
) {
  try {
    // Connect as a server user first
    await streamServerClient.connectUser(
      { id: createdByUserId, name: 'Host' },
      await generateStreamToken(createdByUserId)
    )

    const call = streamServerClient.call('default', callId)
    
    const callData = {
      created_by_id: createdByUserId,
      scheduled_for: scheduledFor.toISOString(),
      custom: {
        webinar_title: webinarTitle,
        max_participants: maxParticipants,
        call_type: 'webinar'
      }
    }

    console.log('Creating Stream call with data:', callData)
    const callResponse = await call.getOrCreate({ data: callData })
    console.log('Stream call created successfully:', callResponse)
    
    // Disconnect after creating the call
    await streamServerClient.disconnectUser()
    
    return call
  } catch (error) {
    console.error('Stream API Error:', error)
    console.error('Stream Error Details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details
    })
    throw new Error(`Failed to create webinar call: ${error.message}`)
  }
}

export async function startWebinarCall(callId: string) {
  try {
    // Connect as a server user first
    await streamServerClient.connectUser(
      { id: 'host-system', name: 'System Host' },
      await generateStreamToken('host-system')
    )

    const call = streamServerClient.call('default', callId)
    await call.goLive()
    
    // Disconnect after starting the call
    await streamServerClient.disconnectUser()
    
    return call
  } catch (error) {
    console.error('Error starting webinar call:', error)
    throw new Error('Failed to start webinar call')
  }
}

export function generateUniqueSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  return `${baseSlug}-${Date.now()}`
}