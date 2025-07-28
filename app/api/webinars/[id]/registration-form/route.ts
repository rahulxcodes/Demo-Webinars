import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST/PUT create or update registration form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webinarId } = await params
    const body = await request.json()

    const {
      requireRegistration,
      formSchema,
      autoApprove,
      maxAttendees,
      registrationDeadline,
    } = body

    // Validate webinar exists
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
    })

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      )
    }

    // Upsert registration form
    const registrationForm = await prisma.registrationForm.upsert({
      where: { webinarId },
      update: {
        requireRegistration: requireRegistration ?? true,
        autoApprove: autoApprove ?? true,
        maxAttendees: maxAttendees || null,
        registrationDeadline: registrationDeadline || null,
        formSchema: formSchema || {
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Full Name',
              placeholder: 'Enter your full name',
              required: true,
              order: 0,
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email address',
              required: true,
              order: 1,
            },
            {
              id: 'phone',
              type: 'phone',
              label: 'Mobile Number',
              placeholder: 'Enter your mobile number',
              required: false,
              order: 2,
            },
          ],
          version: 1,
        },
      },
      create: {
        webinarId,
        requireRegistration: requireRegistration ?? true,
        autoApprove: autoApprove ?? true,
        maxAttendees: maxAttendees || null,
        registrationDeadline: registrationDeadline || null,
        formSchema: formSchema || {
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Full Name',
              placeholder: 'Enter your full name',
              required: true,
              order: 0,
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email address',
              required: true,
              order: 1,
            },
            {
              id: 'phone',
              type: 'phone',
              label: 'Mobile Number',
              placeholder: 'Enter your mobile number',
              required: false,
              order: 2,
            },
          ],
          version: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      registrationForm,
    })
  } catch (error) {
    console.error('Error saving registration form:', error)
    return NextResponse.json(
      { error: 'Failed to save registration form' },
      { status: 500 }
    )
  }
}