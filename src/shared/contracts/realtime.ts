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

import type { MessageReactionKey, MessageResponse } from "./contracts";

/** One key's authoritative count in a `reaction` frame — viewer-agnostic (no
 *  `mine`), so a single broadcast is correct for every client in the room. */
export interface ReactionCount {
  key: MessageReactionKey;
  count: number;
}

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
  /** `namespace.to(conversationId).emit('message:delivered', …)` — `userId`'s
   *  device acked receipt up to `deliveredAt`. The SENDER advances its tick from
   *  one check (sent) to two (delivered). `deliveredAt` is a Date server-side,
   *  ISO on the wire (as with `read`). One rung below `read`, which outranks it. */
  "message:delivered": {
    conversationId: string;
    userId: string;
    deliveredAt: string;
  };
  /** `client.to(conversationId).emit('typing', …)`. */
  typing: { conversationId: string; userId: string; isTyping: boolean };
  /** `namespace.to('user:'+id).emit('presence', …)` — a connection came on/offline. */
  presence: { userId: string; online: boolean };
  /** `client.emit('presence:snapshot', …)` on connect, or on request. */
  "presence:snapshot": { online: string[] };
  /** Fan-out to the recipient's `user:${userId}` room (added by the A-emit
   *  backend workstream, mirroring the `message:new` pattern). */
  "notification:new": { notification: RealtimeNotification };
  /** `chat.gateway.ts` → `namespace.to('user:'+id).emit('conversation:new', …)`
   *  — a new conversation (a group #17) the member was just added to. Fanned to
   *  each member's user room (they aren't in the conversation room yet), so the
   *  client just invalidates `["conversations"]` and re-fetches the DTO. */
  "conversation:new": { conversationId: string };
  /** `chat.gateway.ts` → `namespace.to('user:'+id).emit('conversation:message', …)`
   *  — a message landed in a conversation this member has NOT joined the
   *  socket room for (a different thread open, or elsewhere in the app
   *  entirely). Fanned to every other still-active participant's `user:<id>`
   *  room alongside (not instead of) the room-scoped `message:new` above —
   *  the two overlap for a participant who DOES have the thread open, and
   *  that overlap is a harmless, idempotent re-affirmation on the client
   *  (ENG-160). Carries the same hydrated `MessageResponse` as `message:new`
   *  so the client can patch the conversation-list row without a refetch. */
  "conversation:message": { conversationId: string; message: MessageResponse };
  /** `namespace.to(conversationId).emit('reaction', …)` — a reaction was added
   *  or removed on a message in this conversation. Carries the reactor's
   *  `userId` (so a client can skip the echo of its OWN reaction, already
   *  patched optimistically) and the message's authoritative per-key `reactions`
   *  counts, so clients patch the chip counts in place instead of refetching. */
  reaction: {
    conversationId: string;
    messageId: string;
    userId: string;
    reactions: ReactionCount[];
  };
  /** `namespace.to(conversationId).emit('message:deleted', …)` — a message was
   *  soft-deleted in this conversation. */
  "message:deleted": { conversationId: string; messageId: string };
  /** `namespace.to(conversationId).emit('message:pinned', …)` — a message was
   *  pinned or unpinned in this conversation. Pins are SHARED, so both
   *  participants refresh the pinned-messages banner (and patch the message's
   *  pin state) rather than refetching the thread. */
  "message:pinned": {
    conversationId: string;
    messageId: string;
    pinned: boolean;
  };
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
  /** `chat.gateway.ts` `@SubscribeMessage('delivered')`. The recipient acks that
   *  its device has RECEIVED everything up to now in this conversation — the
   *  server advances that participant's delivered watermark and relays
   *  `message:delivered` to the sender. Client-throttled (one ack per burst per
   *  conversation); the server rate-limits it too. Requires `conversation:join`. */
  delivered: { conversationId: string };
}

export type ClientToServerEvent = keyof ClientToServerEvents;
