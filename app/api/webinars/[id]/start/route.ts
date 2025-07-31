import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startWebinarCall } from '@/lib/stream/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check authentication first
    const session = await getServerSession(authOptions)
    console.log('Session check:', { session: !!session, userId: session?.user?.id })
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get webinar with Stream call ID
    const webinar = await prisma.webinar.findUnique({
      where: { id },
      include: { 
        registrations: {
          where: { status: 'approved' }
        }
      }
    })

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      )
    }

    // Check if the authenticated user is the host of this webinar
    if (webinar.hostId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the webinar host can start this webinar' },
        { status: 403 }
      )
    }

    if (webinar.status === 'live') {
      return NextResponse.json(
        { error: 'Webinar is already live' },
        { status: 400 }
      )
    }

    try {
      // Start the Stream call (make it live) with the actual host user ID
      console.log('Starting Stream call:', webinar.streamCallId, 'for host:', webinar.hostId)
      await startWebinarCall(webinar.streamCallId, webinar.hostId)

      // Update webinar status
      const updatedWebinar = await prisma.webinar.update({
        where: { id },
        data: { 
          status: 'live',
          streamStatus: 'live'
        }
      })

      console.log('Webinar started successfully:', updatedWebinar.id)

      return NextResponse.json({ 
        success: true, 
        streamCallId: webinar.streamCallId,
        webinar: updatedWebinar,
        message: 'Webinar started successfully'
      })
    } catch (streamError) {
      console.error('Failed to start Stream call:', streamError)
      console.error('Stream Error Details:', {
        message: streamError.message,
        status: streamError.status,
        code: streamError.code,
        details: streamError.details
      })
      return NextResponse.json(
        { error: `Failed to start video stream: ${streamError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Start webinar error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}