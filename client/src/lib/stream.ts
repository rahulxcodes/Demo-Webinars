import { StreamVideoClient, User } from '@stream-io/video-react-sdk';

export interface StreamConfig {
  apiKey: string;
  token: string;
  user: User;
}

let streamClient: StreamVideoClient | null = null;

export const createStreamClient = (config: StreamConfig): StreamVideoClient => {
  if (streamClient) {
    streamClient.disconnectUser();
  }

  streamClient = new StreamVideoClient({
    apiKey: config.apiKey,
    user: config.user,
    token: config.token,
  });

  return streamClient;
};

export const getStreamClient = (): StreamVideoClient | null => {
  return streamClient;
};

export const disconnectStreamClient = () => {
  if (streamClient) {
    streamClient.disconnectUser();
    streamClient = null;
  }
};
