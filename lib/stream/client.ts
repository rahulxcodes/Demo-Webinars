import { StreamVideoClient } from '@stream-io/video-client'
import jwt from 'jsonwebtoken'

const apiKey = process.env.STREAM_API_KEY!
const secret = process.env.STREAM_SECRET!

export const streamServerClient = new StreamVideoClient(apiKey)

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

export async function createCall(callId: string, createdByUserId: string) {
  try {
    const call = streamServerClient.call('default', callId)
    await call.getOrCreate({
      data: {
        created_by_id: createdByUserId,
        settings_override: {
          audio: {
            mic_default_on: true,
          },
          video: {
            camera_default_on: true,
          },
        },
      },
    })
    return call
  } catch (error) {
    console.error('Error creating call:', error)
    throw new Error('Failed to create call')
  }
}