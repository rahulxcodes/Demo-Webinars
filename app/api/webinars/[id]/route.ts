import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET single webinar with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webinarId } = await params;

    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
      include: {
        registrationForm: true,
        registrations: {
          select: {
            id: true,
            status: true,
            registeredAt: true,
            approvedAt: true,
          },
        },
      },
    });

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      webinar,
    });
  } catch (error) {
    console.error('Error fetching webinar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webinar' },
      { status: 500 }
    );
  }
}

// PATCH update webinar details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webinarId } = await params;
    const body = await request.json();

    const {
      title,
      description,
      startTime,
      duration,
      status,
    } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!startTime) {
      return NextResponse.json(
        { error: 'Start time is required' },
        { status: 400 }
      );
    }

    if (!duration || duration < 1) {
      return NextResponse.json(
        { error: 'Duration must be at least 1 minute' },
        { status: 400 }
      );
    }

    // Update webinar
    const updatedWebinar = await prisma.webinar.update({
      where: { id: webinarId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startTime: new Date(startTime),
        duration: parseInt(duration),
        status: status || 'upcoming',
      },
      include: {
        registrationForm: true,
        registrations: {
          select: {
            id: true,
            status: true,
            registeredAt: true,
            approvedAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      webinar: updatedWebinar,
    });
  } catch (error) {
    console.error('Error updating webinar:', error);
    return NextResponse.json(
      { error: 'Failed to update webinar' },
      { status: 500 }
    );
  }
}

// DELETE webinar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webinarId } = await params;

    // Check if webinar exists
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
    });

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      );
    }

    // Delete webinar (cascade will handle related records)
    await prisma.webinar.delete({
      where: { id: webinarId },
    });

    return NextResponse.json({
      success: true,
      message: 'Webinar deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting webinar:', error);
    return NextResponse.json(
      { error: 'Failed to delete webinar' },
      { status: 500 }
    );
  }
}