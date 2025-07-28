import { NextRequest, NextResponse } from 'next/server'
import { generateStreamToken } from '@/lib/stream/client'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webinarId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('role') || 'attendee'
    const joinToken = searchParams.get('joinToken')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify webinar exists and get Stream call ID
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
      select: {
        id: true,
        streamCallId: true,
        status: true,
        streamStatus: true,
      }
    })

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      )
    }

    // For attendees, validate join token
    if (userRole === 'attendee' && joinToken) {
      const registration = await prisma.registration.findUnique({
        where: { joinToken },
        select: { status: true, webinarId: true }
      })

      if (!registration || registration.webinarId !== webinarId || registration.status !== 'approved') {
        return NextResponse.json(
          { error: 'Invalid join token' },
          { status: 403 }
        )
      }
    }

    // Generate Stream token
    const token = await generateStreamToken(userId)

    return NextResponse.json({
      token,
      apiKey: process.env.STREAM_API_KEY,
      callId: webinar.streamCallId, // Use the streamCallId instead of webinar ID
      userId,
      userRole,
      webinarStatus: webinar.status,
      streamStatus: webinar.streamStatus,
    })
  } catch (error) {
    console.error('Error generating Stream token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}