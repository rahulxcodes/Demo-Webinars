import { useState, useEffect } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Recording {
  filename: string;
  start_time: string;
  end_time?: string;
  url: string;
  duration?: number;
  size?: number;
}

interface RecordingsViewProps {
  videoClient: StreamVideoClient;
}

export function RecordingsView({ videoClient }: RecordingsViewProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!videoClient) return;

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[RecordingsView] Fetching recordings for live-class-main-1');
        
        // Get the specific call we're using for live classes
        const call = videoClient.call('default', 'live-class-main-1');
        
        // Use the correct Stream API method: queryRecordings() on the call object
        const response = await call.queryRecordings();
        console.log('[RecordingsView] Recording query response:', response);
        
        if (response?.recordings && response.recordings.length > 0) {
          setRecordings(response.recordings);
          console.log(`[RecordingsView] Found ${response.recordings.length} recordings`);
        } else {
          console.log('[RecordingsView] No recordings found');
          setRecordings([]);
        }
      } catch (err) {
        console.error('Failed to fetch recordings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recordings');
        setRecordings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [videoClient]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Unknown';
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (size?: number) => {
    if (!size) return 'Unknown';
    
    const mb = size / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleWatchRecording = (recording: Recording) => {
    setSelectedRecording(recording);
  };

  const handleBackToList = () => {
    setSelectedRecording(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Class Recordings</h1>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading recordings...</p>
          </div>
        </div>
      </div>
    );
  }

  // If a recording is selected, show the video player
  if (selectedRecording) {
    return (
      <div className="space-y-6 max-w-none w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleBackToList} variant="outline">
              ← Back to Recordings
            </Button>
            <h1 className="text-2xl font-bold">
              Recording from {new Date(selectedRecording.start_time).toLocaleDateString()}
            </h1>
          </div>
        </div>

        <Card className="max-w-none">
          <CardContent className="p-6 w-full">
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4 min-h-[400px]">
              <video 
                controls 
                src={selectedRecording.url}
                preload="metadata"
                className="w-full max-h-[60vh] md:max-h-[70vh] lg:max-h-[80vh] object-cover"
                autoPlay
                playsInline={true}
                disablePictureInPicture={false}
                controlsList="nodownload"
              >
                Your browser doesn't support video playback.
              </video>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Started:</span>
                <br />
                {formatDate(selectedRecording.start_time)}
              </div>
              {selectedRecording.end_time && (
                <div>
                  <span className="font-medium">Ended:</span>
                  <br />
                  {formatDate(selectedRecording.end_time)}
                </div>
              )}
              <div>
                <span className="font-medium">Duration:</span>
                <br />
                {formatDuration(selectedRecording.duration)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-none w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Class Recordings</h1>
        <Badge variant="outline" className="text-sm">
          {recordings.length} Recording{recordings.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-medium">
                Unable to Load Recordings
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && recordings.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Recordings Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Recordings will appear here after instructors finish their recorded live classes. Make sure recording is enabled in the admin interface.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {recordings.length > 0 && (
        <div className="space-y-4 w-full">
          {recordings.map((recording, index) => (
            <Card key={`${recording.filename}-${index}`} className="hover:shadow-md transition-shadow max-w-none w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    {recording.filename || `Recording ${index + 1}`}
                  </CardTitle>
                  <Badge variant="secondary">
                    📹 Video
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Started:</span>
                    <br />
                    {formatDate(recording.start_time)}
                  </div>
                  {recording.end_time && (
                    <div>
                      <span className="font-medium">Ended:</span>
                      <br />
                      {formatDate(recording.end_time)}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Duration:</span>
                    <br />
                    {formatDuration(recording.duration)}
                  </div>
                  {recording.size && (
                    <div>
                      <span className="font-medium">File Size:</span>
                      <br />
                      {formatFileSize(recording.size)}
                    </div>
                  )}
                </div>
                
                {recording.url ? (
                  <Button
                    onClick={() => handleWatchRecording(recording)}
                    className="w-full md:w-auto"
                    variant="default"
                  >
                    🎬 Watch Recording
                  </Button>
                ) : (
                  <div className="text-sm text-gray-500">
                    Recording is still processing...
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ About Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>• Recordings are automatically created when instructors start live classes</p>
            <p>• All class participants can access recorded sessions</p>
            <p>• Recordings are available for replay at any time</p>
            <p>• Click "Watch Recording" to view videos in an embedded player</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}