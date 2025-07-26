import { useState } from 'react';
import { useLocation } from 'wouter';
import { PreCallScreen } from '@/components/pre-call-screen';
import { VideoCallScreen } from '@/components/video-call-screen';
import { useStream } from '@/hooks/use-stream';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [, setLocation] = useLocation();
  const [isInCall, setIsInCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>('');
  const { client, initializeClient, disconnect } = useStream();
  const { toast } = useToast();

  const handleJoinCall = async (userId: string, userName: string, callId: string) => {
    try {
      await initializeClient(userId, userName, callId);
      setCurrentCallId(callId);
      setIsInCall(true);
      
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
    setIsInCall(false);
    setCurrentCallId('');
    
    toast({
      title: "Left call",
      description: "You have left the video call",
    });
  };

  if (isInCall && client) {
    return (
      <VideoCallScreen
        client={client}
        callId={currentCallId}
        onLeaveCall={handleLeaveCall}
      />
    );
  }

  return <PreCallScreen onJoinCall={handleJoinCall} />;
}
