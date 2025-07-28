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

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify webinar exists
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
    })

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      )
    }

    // Generate Stream token
    const token = await generateStreamToken(userId)

    return NextResponse.json({
      token,
      apiKey: process.env.STREAM_API_KEY,
      callId: webinarId,
      userId,
      userRole,
    })
  } catch (error) {
    console.error('Error generating Stream token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}