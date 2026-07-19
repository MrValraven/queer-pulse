// Typed realtime event payloads for the backend's socket.io `/chat` namespace.
// HTTP remains the source of truth; these are an enhancement layer (delivery via
// per-user and per-conversation rooms).
//
// SOURCE OF TRUTH: `queerpulse-backend/src/chat/chat.gateway.ts`. Every name here
// was read off a literal `.emit(...)` / `@SubscribeMessage(...)` in that file —
// do not add an event without one.
//
// Trap: the backend also defines `MESSAGE_CREATED = 'message.created'` in
// `src/messaging/messaging.events.ts`. That is an INTERNAL @nestjs/event-emitter
// topic, never a socket event — the gateway re-emits it to sockets as
// `message:new`. Do not code against it.

import type { MessageResponse } from "./contracts";

/** A notification as the backend serves it (entity shape, `payload` is jsonb). */
export interface RealtimeNotification {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

/** Frames the gateway emits to us. */
export interface ServerToClientEvents {
  /** `chat.gateway.ts` → `namespace.to(conversationId).emit('message:new', …)`. */
  "message:new": { conversationId: string; message: MessageResponse };
  /** `namespace.to(conversationId).emit('read', …)`. `lastReadAt` is a Date on
   *  the server; socket.io JSON-serialises it to an ISO string on the wire. */
  read: { conversationId: string; userId: string; lastReadAt: string };
  /** `client.to(conversationId).emit('typing', …)`. */
  typing: { conversationId: string; userId: string; isTyping: boolean };
  /** `namespace.to('user:'+id).emit('presence', …)` — a connection came on/offline. */
  presence: { userId: string; online: boolean };
  /** `client.emit('presence:snapshot', …)` on connect, or on request. */
  "presence:snapshot": { online: string[] };
  /** Fan-out to the recipient's `user:${userId}` room (added by the A-emit
   *  backend workstream, mirroring the `message:new` pattern). */
  "notification:new": { notification: RealtimeNotification };
  /** Auth/handshake/validation failures, incl. access-token expiry. `code` is
   *  only set for a platform-lockdown refusal (`"PLATFORM_LOCKED"`); every other
   *  rejection is the generic `Unauthorized` with no `code`. */
  exception: { status: string; message: unknown; code?: string };
}

export type ServerToClientEvent = keyof ServerToClientEvents;

// The gateway also accepts client→server frames (`conversation:join`,
// `message:send`, `typing`, `read`, `presence:snapshot`). We send none of them —
// writes go over HTTP — so they are deliberately not typed here. Add them when
// something actually emits.
