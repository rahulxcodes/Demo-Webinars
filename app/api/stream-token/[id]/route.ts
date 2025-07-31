import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateStreamToken } from '@/lib/stream/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') || 'attendee'

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate userId matches session (security check)
    if (userId && userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 403 }
      )
    }

    const userIdToUse = userId || session.user.id

    // Generate Stream token
    const token = await generateStreamToken(userIdToUse)

    return NextResponse.json({
      token,
      apiKey: process.env.STREAM_API_KEY,
      userId: userIdToUse,
      callId,
      role
    })
  } catch (error) {
    console.error('Stream token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Stream token' },
      { status: 500 }
    )
  }
}