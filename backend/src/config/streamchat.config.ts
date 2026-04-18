// backend/src/config/streamchat.config.ts
import { StreamChat } from 'stream-chat';

const apiKey = 'mx9jnen6dduk';
const apiSecret = '9dxp8ug6qkecbs4qah7rfwsjq8zwvkcbq6p3fvzj4jfa4bk6as5ctvsk59pxgdmq';

// Initialize StreamChat server client
export const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const STREAM_CHAT_CONFIG = {
  apiKey,
  apiSecret,
  // Token expiration time (7 days)
  tokenExpiration: 60 * 60 * 24 * 7,
};
