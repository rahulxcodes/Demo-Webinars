import { StreamVideoClient } from '@stream-io/video-client'
import jwt from 'jsonwebtoken'

const apiKey = process.env.STREAM_API_KEY!
const secret = process.env.STREAM_SECRET!

export const streamServerClient = new StreamVideoClient(apiKey, {
  secret,
})

export async function generateStreamToken(userId: string) {
  try {
    // Generate JWT token for Stream
    const payload = {
      user_id: userId,
      iss: 'https://pronto.getstream.io',
      sub: 'user/' + userId,
      iat: Math.round(new Date().getTime() / 1000),
      exp: Math.round(new Date().getTime() / 1000) + 3600, // 1 hour
    }
    
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' })
    return token
  } catch (error) {
    console.error('Error generating Stream token:', error)
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
    const call = streamServerClient.call('webinar', callId)
    await call.getOrCreate({
      data: {
        created_by_id: createdByUserId,
        scheduled_for: scheduledFor.toISOString(),
        custom: {
          webinar_title: webinarTitle,
          max_participants: maxParticipants,
          call_type: 'webinar'
        },
        settings_override: {
          audio: {
            mic_default_on: true,
            default_device: 'earpiece',
          },
          video: {
            camera_default_on: true,
          },
        },
      },
    })
    return call
  } catch (error) {
    console.error('Error creating webinar call:', error)
    throw new Error('Failed to create webinar call')
  }
}

export async function startWebinarCall(callId: string) {
  try {
    const call = streamServerClient.call('webinar', callId)
    await call.goLive()
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