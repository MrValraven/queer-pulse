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

/**
 * A notification as the backend serves it — the SAME mapped row `GET
 * /notifications` returns (`toNotificationResponse`), so a pushed notification
 * and a fetched one are interchangeable. Mirror any field added to
 * `NotificationDTO` (features/notifications/api/notifications.api.ts) here.
 * `payload` is the allowlist projection of the entity's jsonb, never the raw
 * column.
 */
export interface RealtimeNotification {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  /** The gateway resolves no profile, so this is always `null` on a frame. */
  actor?: unknown;
  otherActorCount?: number;
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
  /** Fan-out to the recipient's `user:${userId}` room, mirroring the
   *  `message:new` pattern. The frame is the row ITSELF, with no envelope
   *  around it: the gateway emits `toNotificationResponse(notification,
   *  undefined)` directly, so the frame's top level IS the notification. */
  "notification:new": RealtimeNotification;
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
  /** Auth/handshake/validation/handler failures - incl. access-token expiry,
   *  session revocation, platform lockdown, rate limiting and a handler-level
   *  refusal (a bad `conversation:join`, an oversized `typing` payload, …). See
   *  `ChatWsErrorCode` for what each `code` means; `code` stays optional on this
   *  FE type only because an older deployed backend flattens every rejection to
   *  a bare `Unauthorized`/`Token expired` message with no `code` at all - the
   *  `exception` handler in realtime.ts falls back to matching `message` in
   *  that case. `statusCode` mirrors the HTTP status the same refusal would
   *  carry over REST, when the gateway sets one. */
  exception: {
    status: "error";
    code?: ChatWsErrorCode;
    /** Display copy, and nothing else: a plain string for every refusal the
     *  gateway raises itself, or the class-validator error array for a
     *  malformed payload. A machine-readable domain code never rides in here -
     *  it arrives in `domainCode` below. */
    message: unknown;
    /** ENG-242: the domain-level code a refusal can carry alongside the coarse
     *  `code` above (e.g. `"ACCOUNT_RESTRICTED"` for a moderator `restrict`
     *  action), rather than widening `ChatWsErrorCode` (the coarse
     *  FORBIDDEN/BAD_REQUEST/… classification every refusal shares). Its own
     *  field so `message` keeps one shape across every refusal - see
     *  `ws-exception.filter.ts` on the backend. */
    domainCode?: string;
    statusCode?: number;
  };
}

/**
 * Every code the gateway's `exception` frame can carry (ENG-206/ENG-220).
 * UNAUTHORIZED - the handshake credential (the `access_token` cookie) was
 * refused outright. TOKEN_EXPIRED - a scheduled, expected, routine drop at
 * the access token's own expiry under an otherwise-open socket.
 * SESSION_REVOKED - this device's session was signed out, or the member is
 * no longer active; terminal, resolved only by signing back in.
 * PLATFORM_LOCKED - lockdown; terminal for a non-staff client until it's
 * lifted. RATE_LIMITED - a token bucket refused, at the handshake or inside a
 * handler. FORBIDDEN / NOT_FOUND / BAD_REQUEST - a handler refused a specific
 * call while the connection itself stays up. SERVER_ERROR - a server fault,
 * including an infrastructure failure during the handshake itself.
 */
export type ChatWsErrorCode =
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "SESSION_REVOKED"
  | "PLATFORM_LOCKED"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "SERVER_ERROR";

/** `conversation:join`'s ack (ENG-207): `{ ok: true; joined }` on success, or
 *  `{ ok: false; code }` on a refusal the gateway can hand back synchronously.
 *  A validation failure (a malformed `conversationId`) yields a BAD_REQUEST
 *  `exception` frame instead, with no ack at all - see `ClientToServerEvents`
 *  entry below. */
export type ConversationJoinAck =
  | { ok: true; joined: string }
  | { ok: false; code: "RATE_LIMITED" | "FORBIDDEN" };

/** `conversation:leave`'s ack (ENG-217): mirrors `ConversationJoinAck`'s
 *  success/refusal shape, minus `FORBIDDEN` - leaving a room a client was
 *  never in (or already left) is not a refusal. */
export type ConversationLeaveAck =
  { ok: true; left: string } | { ok: false; code: "RATE_LIMITED" };

/** `session:reauth`'s payload (ENG-219), mirroring the backend's
 *  `ReauthPayload` (`chat-payloads.ts`). Carries exactly ONE of two mutually
 *  usable proofs: `token`, a freshly-minted access token, for a non-browser
 *  client holding its own token outside an `httpOnly` cookie; or `ticket`, a
 *  single-use ticket minted by `POST /auth/socket-ticket`, which is what the
 *  browser SPA actually sends (its `access_token` cookie is `httpOnly` and
 *  never reaches JavaScript). The union expresses that either-or honestly,
 *  rather than declaring both fields plainly optional with no relationship
 *  between them. A payload carrying neither is a client bug the gateway
 *  refuses as `BAD_REQUEST` without dropping the socket. */
export type ReauthPayload =
  { token: string; ticket?: never } | { token?: never; ticket: string };

/** `session:reauth`'s ack (ENG-219), mirroring the backend's `ReauthAck`.
 *  `ok: true` carries the new `exp` (whichever proof it came from) so the
 *  caller reschedules its own next proactive reauth off the value the SERVER
 *  just granted. `ok: false` carries whichever {@link ChatWsErrorCode} the
 *  rejection matched: `RATE_LIMITED` and `BAD_REQUEST` refuse without
 *  dropping the socket; every other code here is followed by the gateway's
 *  existing drop, so the caller should treat any other refusal as "this
 *  socket is already gone". */
export type ReauthAck =
  { ok: true; exp: number } | { ok: false; code: ChatWsErrorCode };

export type ServerToClientEvent = keyof ServerToClientEvents;

/**
 * Frames we emit to the gateway.
 *
 * Message *writes* still go over HTTP (POST /conversations/:id/messages) — that
 * stays the source of truth. We emit five frames over the socket instead:
 * `conversation:join`/`conversation:leave` for room management,
 * `typing` for the composer's indicator, `delivered` for the receipt ack, and
 * `session:reauth` (ENG-219) to keep a live connection's expiry rescheduled
 * without a drop/reconnect at every access-token rotation.
 *
 * `message:new`/`read`/`typing` are broadcast by the gateway to the
 * *conversation room* (`namespace.to(conversationId)`, chat.gateway.ts), and a
 * socket only enters that room by emitting `conversation:join`. Without it those
 * broadcasts reach no one and new DMs only surface on a manual refresh.
 * `conversation:leave` is the explicit counterpart (ENG-217): the client emits
 * it for a thread it's navigating away from, instead of letting the room
 * membership dangle until the next reconnect.
 *
 * The gateway also accepts `message:send`, `read` and `presence:snapshot`,
 * which we don't emit (writes/receipts go over HTTP; `presence:snapshot` is
 * server-initiated), so those stay untyped here until something actually
 * sends them.
 *
 * `conversation:join`, `conversation:leave` and `session:reauth` are
 * ack-bearing - see `ClientToServerAcks` below, which `realtime.ts`'s
 * `ClientEmitters` mapped type reads to decide which events carry a
 * callback.
 */
export interface ClientToServerEvents {
  /** `chat.gateway.ts` `@SubscribeMessage('conversation:join')`. `conversationId`
   *  must be a v4 UUID (the gateway's ValidationPipe rejects otherwise - a
   *  BAD_REQUEST `exception` frame, no ack at all). A validated call acks
   *  `ConversationJoinAck`. Room membership is per-connection and lost on
   *  reconnect, so re-emit once the new connection is confirmed authenticated
   *  (see `joinConversationRoom` in realtime.ts, which every join -
   *  reconnect-time or thread-switch - goes through). */
  "conversation:join": { conversationId: string };
  /** `chat.gateway.ts` `@SubscribeMessage('conversation:leave')` (ENG-217).
   *  Leaves the room without waiting for a disconnect/reconnect, e.g. when the
   *  member switches to a different open thread. Acks `ConversationLeaveAck`.
   *  Best-effort from the client's side: nothing retries a refused leave - the
   *  room membership dies anyway the next time this socket reconnects. */
  "conversation:leave": { conversationId: string };
  /** `chat.gateway.ts` `@SubscribeMessage('typing')`. Broadcast to the room as
   *  `typing` with `userId` added server-side. Requires prior `conversation:join`. */
  typing: { conversationId: string; isTyping: boolean };
  /** `chat.gateway.ts` `@SubscribeMessage('delivered')`. The recipient acks that
   *  its device has RECEIVED everything up to now in this conversation — the
   *  server advances that participant's delivered watermark and relays
   *  `message:delivered` to the sender. Client-throttled (one ack per burst per
   *  conversation); the server rate-limits it too. Requires only ACTIVE
   *  PARTICIPATION in the conversation - the client already relies on exactly
   *  this to ack a `conversation:message` frame, which reaches a thread this
   *  socket hasn't joined the room for
   *  (see `conversation:message` in `ServerToClientEvents` and its handler in
   *  realtime.ts). */
  delivered: { conversationId: string };
  /** `chat.gateway.ts` `@SubscribeMessage('session:reauth')` (ENG-219).
   *  Presented while the socket is still open so the gateway can reschedule
   *  the same connection's expiry timer instead of the client dropping and
   *  reconnecting at every access-token rotation. Acks `ReauthAck`. See
   *  `ReauthPayload` above for the token-or-ticket shape. */
  "session:reauth": ReauthPayload;
}

export type ClientToServerEvent = keyof ClientToServerEvents;

/**
 * Ack payload for every `ClientToServerEvents` entry that returns one via
 * socket.io's callback-style emit (`socket.timeout(ms).emit(event, data, cb)`
 * in realtime.ts). An event absent here (`typing`, `delivered`) acks nothing -
 * the gateway's handler returns void and the client fires-and-forgets it.
 */
export interface ClientToServerAcks {
  "conversation:join": ConversationJoinAck;
  "conversation:leave": ConversationLeaveAck;
  "session:reauth": ReauthAck;
}
