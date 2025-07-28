import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { FormSchema } from '@/lib/types/registration';

// GET registration form configuration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webinarId } = await params;

    const registrationForm = await prisma.registrationForm.findUnique({
      where: { webinarId },
      include: {
        webinar: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            duration: true,
          },
        },
      },
    });

    if (!registrationForm) {
      return NextResponse.json(
        { error: 'Registration form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      registrationForm,
    });
  } catch (error) {
    console.error('Error fetching registration form:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration form' },
      { status: 500 }
    );
  }
}

// POST or PUT registration form configuration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webinarId } = await params;
    const body = await request.json();

    const {
      requireRegistration,
      autoApprove,
      maxAttendees,
      registrationDeadline,
      formSchema,
    } = body;

    // Validate webinar exists
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
    });

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      );
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
          ],
          version: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      registrationForm,
    });
  } catch (error) {
    console.error('Error saving registration form:', error);
    return NextResponse.json(
      { error: 'Failed to save registration form' },
      { status: 500 }
    );
  }
}