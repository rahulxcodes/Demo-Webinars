import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateWebinarStatus } from '@/lib/utils/webinar-status';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webinar = await prisma.webinar.findUnique({
      where: { id: params.id },
    });

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...webinar,
      status: calculateWebinarStatus(webinar.startTime, webinar.duration),
    });
  } catch (error) {
    console.error('Error fetching webinar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webinar' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, startTime, duration } = body;

    // Validate that webinar exists
    const existingWebinar = await prisma.webinar.findUnique({
      where: { id: params.id },
    });

    if (!existingWebinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration) updateData.duration = duration;
    
    if (startTime) {
      const newStartTime = new Date(startTime);
      if (newStartTime < new Date()) {
        return NextResponse.json(
          { error: 'Start time must be in the future' },
          { status: 400 }
        );
      }
      updateData.startTime = newStartTime;
      updateData.status = calculateWebinarStatus(newStartTime, duration || existingWebinar.duration);
    }

    // Update webinar
    const updatedWebinar = await prisma.webinar.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      webinar: {
        ...updatedWebinar,
        status: calculateWebinarStatus(updatedWebinar.startTime, updatedWebinar.duration),
      },
    });
  } catch (error) {
    console.error('Error updating webinar:', error);
    return NextResponse.json(
      { error: 'Failed to update webinar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if webinar exists
    const webinar = await prisma.webinar.findUnique({
      where: { id: params.id },
    });

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      );
    }

    // Delete webinar
    await prisma.webinar.delete({
      where: { id: params.id },
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