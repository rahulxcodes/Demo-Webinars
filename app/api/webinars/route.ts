import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { CreateWebinarRequest } from '@/lib/types';
import { calculateWebinarStatus } from '@/lib/utils/webinar-status';
import { createWebinarCall, generateUniqueSlug } from '@/lib/stream/client';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create webinars
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || (user.role !== 'HOST' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create webinars' },
        { status: 403 }
      );
    }

    const body: CreateWebinarRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.startTime || !body.duration) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startTime, duration' },
        { status: 400 }
      );
    }

    // Convert startTime to Date object
    const startTime = new Date(body.startTime);
    
    // Validate that startTime is in the future
    if (startTime < new Date()) {
      return NextResponse.json(
        { error: 'Start time must be in the future' },
        { status: 400 }
      );
    }

    // Calculate initial status
    const status = calculateWebinarStatus(startTime, body.duration);

    // Generate unique slug and Stream call ID
    const slug = generateUniqueSlug(body.title);
    const streamCallId = `webinar-${slug}`;

    // Create Stream call first with authenticated user
    try {
      await createWebinarCall(
        streamCallId,
        session.user.id,
        body.title,
        startTime,
        1000
      );
    } catch (streamError) {
      console.error('Failed to create Stream call:', streamError);
      return NextResponse.json(
        { error: 'Failed to create video call' },
        { status: 500 }
      );
    }

    // Create webinar in database with Stream integration
    const webinar = await prisma.webinar.create({
      data: {
        title: body.title,
        slug,
        streamCallId,
        description: body.description || null,
        startTime,
        duration: body.duration,
        status,
        streamStatus: 'created',
        maxAttendees: 1000,
        hostId: session.user.id,
        registrationForm: {
          create: {
            requireRegistration: true,
            autoApprove: true,
            formSchema: {
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
        },
      },
      include: {
        registrationForm: true,
      },
    });

    return NextResponse.json({
      success: true,
      webinar: {
        ...webinar,
        status: calculateWebinarStatus(webinar.startTime, webinar.duration),
      },
    });
  } catch (error) {
    console.error('Error creating webinar:', error);
    return NextResponse.json(
      { error: 'Failed to create webinar' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication for GET requests too
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get webinars for the authenticated user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    // Optimized database queries with selected fields only
    const [webinars, total] = await Promise.all([
      prisma.webinar.findMany({
        where: user?.role === 'ADMIN' ? {} : { hostId: session.user.id }, // Admins see all, others see only their own
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          duration: true,
          status: true,
          createdAt: true,
          host: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.webinar.count({
        where: user?.role === 'ADMIN' ? {} : { hostId: session.user.id }
      }),
    ]);

    // Calculate real-time status for each webinar
    const webinarsWithStatus = webinars.map((webinar: any) => ({
      ...webinar,
      status: calculateWebinarStatus(webinar.startTime, webinar.duration),
    }));

    return NextResponse.json({
      webinars: webinarsWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching webinars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webinars' },
      { status: 500 }
    );
  }
}