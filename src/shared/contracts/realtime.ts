// Typed realtime event payloads, imported by both the gateway and the web socket
// client so they agree on the wire (docs/backend/06 §6.2). HTTP remains the source
// of truth; these are an enhancement layer (delivery via per-user rooms).

import type { MessageResponse, NotificationResponse } from "./contracts";

export interface ServerToClientEvents {
  "notification.new": {
    notification: NotificationResponse;
    unreadCount: number;
  };
  "message.created": { conversationId: string; message: MessageResponse };
  "message.read": {
    conversationId: string;
    userId: string;
    lastReadAt: string;
  };
}

export type ServerToClientEvent = keyof ServerToClientEvents;
