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
    
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      user_id: userId,
      iss: 'https://pronto.getstream.io',
      sub: 'user/' + userId,
      iat: now - 60, // Start 1 minute ago to avoid timing issues
      exp: now + 3600, // Expire in 1 hour
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
    // Connect as the host user with proper role
    await streamServerClient.connectUser(
      { 
        id: createdByUserId, 
        name: 'Host',
        role: 'admin' // Give admin role for call management
      },
      await generateStreamToken(createdByUserId)
    )

    const call = streamServerClient.call('livestream', callId)
    
    const callData = {
      created_by_id: createdByUserId,
      scheduled_for: scheduledFor.toISOString(),
      custom: {
        webinar_title: webinarTitle,
        max_participants: maxParticipants,
        call_type: 'webinar'
      },
      members: [
        {
          user_id: createdByUserId,
          role: 'admin' // Host as admin
        }
      ]
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

export async function startWebinarCall(callId: string, hostUserId: string = 'default-host') {
  try {
    // Connect as the host user with admin role
    await streamServerClient.connectUser(
      { 
        id: hostUserId, 
        name: 'Webinar Host',
        role: 'admin' // Admin role for call management
      },
      await generateStreamToken(hostUserId)
    )

    const call = streamServerClient.call('livestream', callId)
    
    // Update call permissions before going live
    await call.update({
      settings_override: {
        backstage: {
          enabled: true,
        },
        broadcasting: {
          enabled: true,
        },
      }
    })
    
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