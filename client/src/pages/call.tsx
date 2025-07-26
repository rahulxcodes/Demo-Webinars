import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { VideoCallScreen } from '@/components/video-call-screen';
import { useStream } from '@/hooks/use-stream';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function CallPage() {
  const [, params] = useRoute('/call/:callId');
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const { client, initializeClient, disconnect, isLoading } = useStream();
  const { toast } = useToast();

  const callId = params?.callId;

  const handleJoinCall = async () => {
    if (!name.trim() || !callId) return;

    try {
      const userId = Math.random().toString(36).substr(2, 9);
      await initializeClient(userId, name.trim(), callId);
      setIsJoined(true);
      
      toast({
        title: "Joined call successfully",
        description: `Call ID: ${callId}`,
      });
    } catch (error) {
      toast({
        title: "Failed to join call",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleLeaveCall = () => {
    disconnect();
    setIsJoined(false);
    setLocation('/');
  };

  if (!callId) {
    setLocation('/');
    return null;
  }

  if (isJoined && client) {
    return (
      <VideoCallScreen
        client={client}
        callId={callId}
        onLeaveCall={handleLeaveCall}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Call</h1>
            <p className="text-gray-600">Call ID: {callId}</p>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Your Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinCall()}
              />
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleJoinCall}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Call'}
            </Button>

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => setLocation('/')}
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
