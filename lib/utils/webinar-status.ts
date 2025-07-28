import { WebinarStatus } from '@/lib/types';

export function calculateWebinarStatus(startTime: Date, duration: number): WebinarStatus {
  const now = new Date();
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

  if (now < startTime) {
    return 'upcoming';
  } else if (now >= startTime && now <= endTime) {
    return 'live';
  } else {
    return 'ended';
  }
}

export function formatWebinarStatus(status: WebinarStatus): { label: string; className: string } {
  switch (status) {
    case 'upcoming':
      return { label: 'Upcoming', className: 'bg-primary-100 text-primary-700' };
    case 'live':
      return { label: 'Live', className: 'bg-success-100 text-success-700' };
    case 'ended':
      return { label: 'Ended', className: 'bg-gray-100 text-gray-700' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-error-100 text-error-700' };
    default:
      return { label: 'Unknown', className: 'bg-gray-100 text-gray-700' };
  }
}