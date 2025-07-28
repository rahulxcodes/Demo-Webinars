import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { FormField } from '@/lib/types/registration';

// POST registration submission
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webinarId } = await params;
    const body = await request.json();

    // Get registration form configuration
    const registrationForm = await prisma.registrationForm.findUnique({
      where: { webinarId },
      include: {
        webinar: {
          select: {
            title: true,
            startTime: true,
          },
        },
      },
    });

    if (!registrationForm) {
      return NextResponse.json(
        { error: 'Registration is not available for this webinar' },
        { status: 404 }
      );
    }

    if (!registrationForm.requireRegistration) {
      return NextResponse.json(
        { error: 'Registration is not required for this webinar' },
        { status: 400 }
      );
    }

    // Check registration deadline
    if (registrationForm.registrationDeadline) {
      const deadlineTime = new Date(registrationForm.webinar.startTime);
      deadlineTime.setHours(deadlineTime.getHours() - registrationForm.registrationDeadline);
      
      if (new Date() > deadlineTime) {
        return NextResponse.json(
          { error: 'Registration deadline has passed' },
          { status: 400 }
        );
      }
    }

    // Check capacity
    if (registrationForm.maxAttendees) {
      const approvedCount = await prisma.registration.count({
        where: {
          webinarId,
          status: 'approved',
        },
      });

      if (approvedCount >= registrationForm.maxAttendees) {
        return NextResponse.json(
          { error: 'This webinar has reached maximum capacity' },
          { status: 400 }
        );
      }
    }

    // Validate form data
    const formSchema = registrationForm.formSchema as { fields: FormField[] };
    const { userName, userEmail, mobileNumber, formResponses } = body;

    if (!userName || !userEmail) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check for duplicate registration
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        webinarId_userEmail: {
          webinarId,
          userEmail,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You have already registered for this webinar' },
        { status: 409 }
      );
    }

    // Validate required fields
    for (const field of formSchema.fields) {
      if (field.required && field.id !== 'name' && field.id !== 'email') {
        if (!formResponses[field.id] || formResponses[field.id].toString().trim() === '') {
          return NextResponse.json(
            { error: `${field.label} is required` },
            { status: 400 }
          );
        }
      }
    }

    // Create registration
    const status = registrationForm.autoApprove ? 'approved' : 'pending';
    const registration = await prisma.registration.create({
      data: {
        webinarId,
        formId: registrationForm.id,
        userName,
        userEmail,
        mobileNumber: mobileNumber || null,
        formResponses: formResponses || {},
        status,
        approvedAt: registrationForm.autoApprove ? new Date() : null,
        sourceData: {
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      registration: {
        id: registration.id,
        status: registration.status,
        joinToken: registration.joinToken,
        message: registrationForm.autoApprove 
          ? 'Registration successful! You will receive a confirmation email shortly.'
          : 'Registration submitted! Please wait for approval confirmation.',
      },
    });
  } catch (error) {
    console.error('Error processing registration:', error);
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    );
  }
}