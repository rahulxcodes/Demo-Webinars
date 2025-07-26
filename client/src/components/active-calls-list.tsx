import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Users, Clock } from 'lucide-react';
import { useLocation } from 'wouter';

interface Call {
  id: number;
  callId: string;
  title: string;
  createdById: number;
  isActive: boolean;
  createdAt: string;
  endedAt: string | null;
}

export function ActiveCallsList() {
  const [, setLocation] = useLocation();

  const { data: calls, isLoading, error } = useQuery({
    queryKey: ['active-calls'],
    queryFn: async (): Promise<Call[]> => {
      const response = await fetch('http://localhost:3001/calls');
      if (!response.ok) {
        throw new Error('Failed to fetch active calls');
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const handleJoinCall = (callId: string) => {
    setLocation(`/call/${callId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Active Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Loading active calls...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Active Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Failed to load active calls
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Active Calls ({calls?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!calls || calls.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No active calls
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {call.title || `Call ${call.callId}`}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Started {formatTime(call.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Call ID: {call.callId}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleJoinCall(call.callId)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Join
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}