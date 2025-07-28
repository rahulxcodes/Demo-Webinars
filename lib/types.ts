export interface Webinar {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  duration: number;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  hostId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebinarRequest {
  title: string;
  description?: string;
  startTime: string;
  duration: number;
  autoRecord?: boolean;
  recordingQuality?: string;
  allowHostRecordingControl?: boolean;
}

export interface WebinarStats {
  total: number;
  upcoming: number;
  past: number;
  live: number;
}

export type WebinarStatus = 'upcoming' | 'live' | 'ended' | 'cancelled';