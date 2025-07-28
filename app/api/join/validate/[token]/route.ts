import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Validate join token and get registration details
    const registration = await prisma.registration.findUnique({
      where: { joinToken: token },
      include: {
        webinar: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            duration: true,
            streamCallId: true,
            status: true,
            streamStatus: true,
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Invalid or expired join token' },
        { status: 404 }
      )
    }

    if (registration.status !== 'approved') {
      return NextResponse.json(
        { error: 'Registration not approved' },
        { status: 403 }
      )
    }

    // Check if webinar is live or scheduled
    const now = new Date()
    const webinarStart = new Date(registration.webinar.startTime)
    const webinarEnd = new Date(webinarStart.getTime() + registration.webinar.duration * 60000)

    if (now < webinarStart) {
      return NextResponse.json(
        { 
          error: 'Webinar has not started yet',
          startsAt: webinarStart.toISOString()
        },
        { status: 400 }
      )
    }

    if (now > webinarEnd) {
      return NextResponse.json(
        { error: 'Webinar has ended' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      registration: {
        id: registration.id,
        userName: registration.userName,
        userEmail: registration.userEmail,
      },
      webinar: registration.webinar
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}