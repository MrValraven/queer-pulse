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
  /** `namespace.to(conversationId).emit('message:updated', …)` — a message was
   *  edited (15-min window) in this conversation. */
  "message:updated": { conversationId: string; message: MessageResponse };
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
  /** `namespace.to(conversationId).emit('reaction', …)` — a reaction was added
   *  or removed on a message in this conversation. */
  reaction: { conversationId: string; messageId: string };
  /** `namespace.to(conversationId).emit('message:deleted', …)` — a message was
   *  soft-deleted in this conversation. */
  "message:deleted": { conversationId: string; messageId: string };
  /** Auth/handshake/validation failures, incl. access-token expiry. `code` is
   *  only set for a platform-lockdown refusal (`"PLATFORM_LOCKED"`); every other
   *  rejection is the generic `Unauthorized` with no `code`. */
  exception: { status: string; message: unknown; code?: string };
}

export type ServerToClientEvent = keyof ServerToClientEvents;

/**
 * Frames we emit to the gateway.
 *
 * Message *writes* still go over HTTP (POST /conversations/:id/messages) — that
 * stays the source of truth. The one frame we emit is room management:
 * `message:new`/`read`/`typing` are broadcast by the gateway to the
 * *conversation room* (`namespace.to(conversationId)`, chat.gateway.ts), and a
 * socket only enters that room by emitting `conversation:join`. Without it those
 * broadcasts reach no one and new DMs only surface on a manual refresh.
 *
 * We emit `typing` (the composer's typing indicator — see the realtime layer's
 * `emitTyping`). The gateway also accepts `message:send`, `read` and
 * `presence:snapshot`, which we don't emit (writes/receipts go over HTTP), so
 * those stay untyped here until something actually sends them.
 */
export interface ClientToServerEvents {
  /** `chat.gateway.ts` `@SubscribeMessage('conversation:join')`. `conversationId`
   *  must be a v4 UUID (the gateway's ValidationPipe rejects otherwise). Room
   *  membership is per-connection and lost on reconnect, so re-emit on connect. */
  "conversation:join": { conversationId: string };
  /** `chat.gateway.ts` `@SubscribeMessage('typing')`. Broadcast to the room as
   *  `typing` with `userId` added server-side. Requires prior `conversation:join`. */
  typing: { conversationId: string; isTyping: boolean };
}

export type ClientToServerEvent = keyof ClientToServerEvents;
