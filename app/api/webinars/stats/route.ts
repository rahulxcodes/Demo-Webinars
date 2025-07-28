import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateWebinarStatus } from '@/lib/utils/webinar-status';
import { WebinarStats } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Fetch all webinars
    const webinars = await prisma.webinar.findMany({
      select: {
        startTime: true,
        duration: true,
      },
    });

    // Calculate stats with real-time status
    const stats: WebinarStats = {
      total: webinars.length,
      upcoming: 0,
      past: 0,
      live: 0,
    };

    webinars.forEach((webinar: any) => {
      const status = calculateWebinarStatus(webinar.startTime, webinar.duration);
      switch (status) {
        case 'upcoming':
          stats.upcoming++;
          break;
        case 'live':
          stats.live++;
          break;
        case 'ended':
          stats.past++;
          break;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching webinar stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}