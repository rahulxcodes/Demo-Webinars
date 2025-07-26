import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useStream } from '@/hooks/use-stream';

interface PreCallScreenProps {
  onJoinCall: (userId: string, userName: string, callId: string) => void;
}

export function PreCallScreen({ onJoinCall }: PreCallScreenProps) {
  const [name, setName] = useState('');
  const [callId, setCallId] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const { isLoading } = useStream();

  const handleJoinCall = () => {
    if (!name.trim()) return;
    
    const finalCallId = callId.trim() || generateCallId();
    const userId = generateUserId();
    
    onJoinCall(userId, name.trim(), finalCallId);
  };

  const handleCreateNewCall = () => {
    if (!name.trim()) return;
    
    const newCallId = generateCallId();
    const userId = generateUserId();
    
    onJoinCall(userId, name.trim(), newCallId);
  };

  const generateCallId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const generateUserId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Video className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">StreamVideo</h1>
            <p className="text-gray-600">Join or create a video call</p>
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
              />
            </div>
            
            <div>
              <Label htmlFor="callId" className="text-sm font-medium text-gray-700">
                Call ID
              </Label>
              <Input
                id="callId"
                type="text"
                placeholder="Enter call ID or leave empty to create new"
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Device Preview */}
            <div className="bg-gray-900 rounded-lg aspect-video relative overflow-hidden">
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-500" />
              </div>
              <div className="absolute bottom-3 left-3 flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-10 h-10 p-0 bg-black bg-opacity-50 border-0 hover:bg-black hover:bg-opacity-70"
                  onClick={() => setIsMicOn(!isMicOn)}
                >
                  {isMicOn ? (
                    <Mic className="w-4 h-4 text-white" />
                  ) : (
                    <MicOff className="w-4 h-4 text-white" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-10 h-10 p-0 bg-black bg-opacity-50 border-0 hover:bg-black hover:bg-opacity-70"
                  onClick={() => setIsCameraOn(!isCameraOn)}
                >
                  {isCameraOn ? (
                    <Video className="w-4 h-4 text-white" />
                  ) : (
                    <VideoOff className="w-4 h-4 text-white" />
                  )}
                </Button>
              </div>
              <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                You
              </div>
            </div>

            <div className="space-y-3">
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
                onClick={handleCreateNewCall}
                disabled={!name.trim() || isLoading}
              >
                Create New Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
