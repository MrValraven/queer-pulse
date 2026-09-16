import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import { queryClient } from "./queryClient";
import {
  bumpConversationUnread,
  patchConversationPreview,
  patchMessageDelete,
  patchMessageEdit,
  patchMessagePinned,
  patchMessageReactionCounts,
  reconcileConversationHistory,
  upsertMessage,
} from "./messageCache";
import { API_BASE_URL, apiAvailable } from "./config";
import {
  mintSocketTicket,
  refreshSession,
  type SocketTicketMintResult,
} from "./client";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logInfo, logWarn } from "../observability/logger";
import type { Conversation } from "../../features/messages/data";
import type {
  ChatWsErrorCode,
  ClientToServerAcks,
  ClientToServerEvents,
  ServerToClientEvents,
} from "../contracts/realtime";

// ── The realtime layer ──────────────────────────────────────────────────────
// A socket.io client for the backend's `/chat` namespace, honouring
// src/shared/contracts/realtime.ts. HTTP stays the source of truth; sockets are
// an enhancement that keeps the React Query cache warm (messages, conversations,
// notifications) so a second browser session sees new DMs/notifications live.
//
// Auth: the httpOnly `access_token` cookie IS the handshake credential — the
// gateway reads it off `handshake.headers.cookie` (chat.gateway.ts). Hence
// `withCredentials: true` and no manual token plumbing.
//
// A CLIENT-observed drop (transport close, ping timeout, …) is socket.io's own
// job to retry (Engine.IO backoff + heartbeat) - no hand-rolled retry for that
// case. A SERVER-forced disconnect is different: socket.io-client never
// auto-reconnects after one, so `disconnect`'s `'io server disconnect'` branch
// (ENG-209) and the `exception` handler's unauthenticated-refusal branch
// (ENG-206) each schedule a manual reconnect with their own backoff - see
// `scheduleReconnect`/`nextExponentialBackoffDelayMs` below.

/** How long to coalesce inbound messages before emitting a single delivered ack
 *  for a conversation. The ack is a "received up to now" watermark, so a burst
 *  collapses to one cheap frame instead of one per message. */
const DELIVERED_ACK_DEBOUNCE_MS = 500;

/** How many message ids `countInboxUnread` remembers for its dedupe guard
 *  (FIFO-evicted past this). Only needs to cover a burst's worth of frames, not
 *  a session's worth — see `countedInboxMessageIds`. */
const INBOX_UNREAD_DEDUPE_LIMIT = 200;

/** socket.io wants event maps as listener signatures; ours are payload types. */
type ServerListeners = {
  [K in keyof ServerToClientEvents]: (data: ServerToClientEvents[K]) => void;
};

/** Same shape for the frames we emit, so `socket.emit(...)` is type-checked.
 *  An ack-bearing event (`ClientToServerAcks`, ENG-207/ENG-217) gets a second
 *  callback parameter so `socket.timeout(ms).emit(event, data, (err, ack) =>
 *  …)` type-checks against `ClientToServerAcks[event]`; every other event
 *  keeps the plain fire-and-forget shape. */
type ClientEmitters = {
  [K in keyof ClientToServerEvents]: K extends keyof ClientToServerAcks
    ? (
        data: ClientToServerEvents[K],
        callback: (ack: ClientToServerAcks[K]) => void,
      ) => void
    : (data: ClientToServerEvents[K]) => void;
};

/** The namespace URL. socket.io reads the path as the namespace, the rest as origin. */
function realtimeUrl(): string | null {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}/chat`;
}

/**
 * Floor between two session refreshes asked for by the socket layer. The access
 * cookie lives 15 minutes, so one attempt a minute is far more headroom than a
 * legitimate expiry needs, while a gateway rejecting for some other reason can
 * never turn into a refresh loop.
 */
const AUTH_REFRESH_COOLDOWN_MS = 60_000;

/**
 * ENG-219 (frontend half): the assumed default access-token TTL, matching the
 * backend's own default (`DEFAULT_ACCESS_TTL` in `queerpulse-backend/src/
 * config/auth.config.ts`). The `access_token` cookie is `httpOnly`, so this
 * client can never read a connection's REAL `exp` off it directly; this
 * constant is only ever used to schedule the FIRST proactive
 * `session:reauth` attempt after a connection is confirmed live
 * (`handleSessionLive`), as a reasonable assumption for a socket that just
 * finished a fresh handshake. Every SUBSEQUENT proactive attempt schedules
 * off the authoritative `exp` the server itself returns in a successful
 * `session:reauth` ack instead (`msUntilNextProactiveReauth`), which needs no
 * assumption at all. If this assumption ever undershoots the real remaining
 * time (e.g. a reconnect picked up an already-partway-expired cookie), the
 * proactive attempt is simply late and buys nothing that round; the existing
 * reactive `TOKEN_EXPIRED` path (`handleExceptionFrame`) is unaffected and
 * remains the fallback either way.
 */
const ASSUMED_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
/** How long before the (assumed or authoritative) expiry a proactive
 *  `session:reauth` fires - generous headroom for the mint round trip, the
 *  emit itself, and one retry of either without ever risking the socket
 *  actually reaching `TOKEN_EXPIRED` in the common case. */
const PROACTIVE_REAUTH_MARGIN_MS = 90_000;
/** Floor for a computed proactive-reauth delay, so a margin that would
 *  otherwise compute to a near-zero or negative wait (an authoritative `exp`
 *  already close to now) still schedules a real timer rather than firing
 *  immediately in a tight loop. */
const PROACTIVE_REAUTH_MIN_DELAY_MS = 5_000;
/** Retry delay after a single `mintSocketTicket()` failure (a network blip,
 *  the backend briefly unreachable). Retried exactly once - see
 *  `performProactiveReauth`'s `isMintRetry` parameter - after which this
 *  proactive attempt gives up silently for the round; the server's own
 *  expiry timer was never touched, so the existing reactive `TOKEN_EXPIRED`
 *  path remains the fallback. */
const SOCKET_TICKET_MINT_RETRY_DELAY_MS = 5_000;
/** Retry delay after a `session:reauth` ack refuses with `RATE_LIMITED` -
 *  the one ack outcome that does NOT drop the socket server-side (see
 *  `ChatGateway.handleReauth`), so retrying here (rather than falling back to
 *  the reactive path) is both safe and the faster recovery. */
const REAUTH_RATE_LIMITED_RETRY_DELAY_MS = 10_000;
/** How long a proactive `session:reauth` emit waits for its ack before being
 *  treated as timed out. */
const REAUTH_ACK_TIMEOUT_MS = 10_000;

/** How long `joinConversationRoom` (ENG-207) waits for a `conversation:join`
 *  ack before treating the call as timed out and retrying. */
const CONVERSATION_JOIN_ACK_TIMEOUT_MS = 5_000;
/** `joinConversationRoom`'s retry delays (1s, 2s, 4s) - the Nth entry is the
 *  wait before the (N+1)th attempt. Combined with the first attempt this caps
 *  the sequence at `CONVERSATION_JOIN_MAX_ATTEMPTS` tries total. */
const CONVERSATION_JOIN_RETRY_DELAYS_MS = [1_000, 2_000, 4_000];
const CONVERSATION_JOIN_MAX_ATTEMPTS =
  CONVERSATION_JOIN_RETRY_DELAYS_MS.length + 1;

/** Base delay for the exponential reconnect backoff shared by a SERVER_ERROR
 *  `exception` while unauthenticated (ENG-206) and a server-forced
 *  `disconnect` (ENG-209): 1s, doubling on every attempt, capped at
 *  `RECONNECT_BACKOFF_CAP_MS`. */
const RECONNECT_BACKOFF_BASE_MS = 1_000;
const RECONNECT_BACKOFF_CAP_MS = 30_000;
/** RATE_LIMITED's own, flat (non-exponential) reconnect window while
 *  unauthenticated (ENG-206) - a bucket refusal isn't expected to clear faster
 *  the harder you hammer it, so there's no attempt-scaling here. */
const RATE_LIMITED_RECONNECT_MIN_MS = 15_000;
const RATE_LIMITED_RECONNECT_MAX_MS = 30_000;

/** How long a `disconnect` waits before clearing the local presence set
 *  (ENG-218) - the backend keeps a member "online" for ~10s after a
 *  TOKEN_EXPIRED drop specifically so the reconnect-and-refresh round trip
 *  doesn't flash every online dot off; this grace is shorter than that so a
 *  genuinely-gone connection still clears before the member notices, while a
 *  routine token-expiry reconnect (which reliably completes well under 5s)
 *  never gets the chance to visibly flicker. */
const PRESENCE_CLEAR_GRACE_MS = 5_000;

/** How long a recorded `pendingConnectionRefusal` stays eligible for the
 *  `disconnect` handler to confirm and act on (ENG-206) - a server-forced
 *  disconnect that truly belongs to a refusal follows it within one gateway
 *  round trip, well under this window. A pending refusal otherwise stays
 *  recorded until a `presence:snapshot`, a newer refusal, the next `connect`,
 *  or `dispose()` clears it (see each one's own doc); if a disconnect lands
 *  outside this window, or with a different reason, the `disconnect` handler
 *  leaves it alone and takes its plain reconnect path instead. */
const PENDING_CONNECTION_REFUSAL_WINDOW_MS = 5_000;

/** Mirrors `messageCache.ts`'s private `threadFilter` key builder - that file
 *  owns `upsertMessage`/`patchThread` et al but doesn't export the key itself,
 *  so ENG-217's leave path (which only needs the KEY, to invalidate without
 *  refetching) replicates it here rather than exporting internals across an
 *  ownership boundary. Keep this in sync if that key's shape ever changes. */
function threadQueryKey(conversationId: string) {
  return { queryKey: ["messages", conversationId] as const };
}

/**
 * Opens one socket to `/chat` and funnels every frame through cache
 * invalidation, so the socket never has to know a page's component tree — only
 * its query keys. `dispose()` closes it for good.
 */
class RealtimeClient {
  private socket: Socket<ServerListeners, ClientEmitters> | null = null;
  /** True while the dynamic `import("socket.io-client")` inside `connect()` is
   *  in flight — guards the gap where `this.socket` is still null so a second
   *  `connect()` call during that gap doesn't kick off a duplicate import/socket,
   *  and lets `dispose()` cancel a connect that hasn't resolved yet. */
  private connecting = false;
  private listeners = new Set<(connected: boolean) => void>();
  private url: string;
  private qc: QueryClient;
  /** The open thread whose room we want joined. Remembered across (re)connects. */
  private activeConversationId: string | null = null;
  /** Per-event fan-out sets, additive alongside the cache-invalidation handlers
   *  registered directly in `connect()` below. */
  private typingHandlers = new Set<
    (frame: ServerToClientEvents["typing"]) => void
  >();
  private readHandlers = new Set<
    (frame: ServerToClientEvents["read"]) => void
  >();
  private deliveredHandlers = new Set<
    (frame: ServerToClientEvents["message:delivered"]) => void
  >();
  private presenceHandlers = new Set<(online: ReadonlySet<string>) => void>();
  /** Fan-out for the peer-requested `onConversationMessage` subscription -
   *  additive alongside this class's own `conversation:message` cache-patch
   *  handler in `connect()`, exactly like `typingHandlers`/`readHandlers`. */
  private conversationMessageHandlers = new Set<
    (frame: ServerToClientEvents["conversation:message"]) => void
  >();
  /** Per-conversation debounce timers for the outbound delivered ack — an
   *  inbound burst coalesces into one "received up to now" frame. */
  private deliveredAckTimers = new Map<string, number>();
  /** Message ids already counted toward an inbox row's unread badge by
   *  `countInboxUnread`, FIFO-evicted past `INBOX_UNREAD_DEDUPE_LIMIT`. A
   *  participant could in principle receive the SAME message over BOTH
   *  `message:new` and `conversation:message` on a non-active conversation
   *  (e.g. a room join that hasn't caught up with `activeConversationId` yet),
   *  which would otherwise double-count it into `unreadCount`. */
  private countedInboxMessageIds = new Set<string>();
  /** The current set of online user ids, maintained from `presence` (single
   *  add/remove) and `presence:snapshot` (full replace) frames. */
  private onlineUserIds = new Set<string>();
  /** False until the first confirmed LIVE session (`handleSessionLive`,
   *  triggered by the first `presence:snapshot` after a `connect` - see that
   *  method). A later live session is therefore a genuine RECONNECT: the
   *  socket buffered nothing while it was down, so we reconcile the open
   *  thread's history since its last known message. */
  private hasConnectedBefore = false;
  /** Epoch ms of the last refresh this socket asked for, for the cooldown. */
  private lastAuthRefreshAt = 0;
  /** The signed-in member's user id, used to skip the echo of our OWN reaction
   *  (already patched optimistically by the mutation) so the frame's absolute
   *  counts never double-apply on top of that local delta. */
  private myUserId: string | null;
  /** The signed-in member's handle (profile slug). A `message:new` frame's
   *  `sender` is an `AuthorSummary`, which carries a handle and no id, so the
   *  own-echo skip on that handler has to compare handles: the rest of the app
   *  decides "is this mine" the same way (see `messageToChat`). */
  private myHandle: string | null;
  /** True once this connection has received a `presence:snapshot` (set there,
   *  below) - the contract's own definition of "authenticated" (ENG-206): the
   *  gateway only ever emits it after a fully authenticated handshake. Reset
   *  to false by the `connect` handler above (which fires too early to mean
   *  authenticated - see its own comment), so this answers "authenticated
   *  SINCE the last connect", which the `exception` handler's
   *  RATE_LIMITED/SERVER_ERROR branch and `joinConversationRoom`/
   *  `leaveConversationRoom`'s own guards all depend on. */
  private hasAuthenticatedSinceConnect = false;
  /** True once this client has decided it cannot recover on its own
   *  (ENG-206): SESSION_REVOKED, PLATFORM_LOCKED, or an auth refusal a
   *  refresh cannot fix (see `goTerminal`, the one place this flips true).
   *  Stops `disconnect` below from ever scheduling a reconnect, on top of
   *  `goTerminal`'s own `socket.io.reconnection(false)`. Never reset: only a
   *  fresh RealtimeClient, built by the provider once this one is disposed,
   *  starts non-terminal again. */
  private isTerminal = false;
  /** Consecutive CONFIRMED auth refusals (UNAUTHORIZED, TOKEN_EXPIRED, or an
   *  uncoded `Unauthorized`/`Token expired` message that a server-forced
   *  disconnect actually followed - see `pendingConnectionRefusal`, which is
   *  what tells a genuine refusal apart from a stray handler-level one) seen
   *  with no confirming `presence:snapshot` in between (ENG-206) - reset
   *  there. A second refusal in a row means a fresh refresh already had its
   *  chance and didn't help, so `handleAuthRefusal` goes terminal there,
   *  closing the loop before it can run connect, refuse, disconnect,
   *  reconnect forever. */
  private consecutiveAuthRefusals = 0;
  /** A refusal from the `exception` handler that MIGHT be a genuine
   *  connection-level refusal (a bad handshake, or TOKEN_EXPIRED) or might
   *  equally be a stray HANDLER-level refusal from a packet socket.io-client
   *  buffered while disconnected and flushed on reconnect BEFORE this
   *  connection's own `handleConnection` auth finished (ENG-206). Recorded
   *  here for the `disconnect` handler below to act on, which tells the two
   *  apart using the one signal the gateway guarantees: a genuine handshake
   *  refusal (or token expiry) always disconnects the socket, a
   *  handler-level refusal never does. Cleared on `presence:snapshot` (a
   *  confirmed live session settles the question either way), on the next
   *  `connect` (a fresh connection starts with no refusal of its own
   *  pending), and in `dispose()`; a newer refusal simply replaces an older
   *  one still waiting. */
  private pendingConnectionRefusal: { act: () => void; at: number } | null =
    null;
  /** Conversation ids whose delivered ack fired while this connection wasn't
   *  confirmed live (ENG-206) - held here and re-issued once
   *  `handleSessionLive` confirms a live connection; sending it while down
   *  would sit in socket.io-client's own sendBuffer, flush on reconnect
   *  BEFORE the new connection's own auth finishes, and throw a spurious
   *  refusal (see `pendingConnectionRefusal`). */
  private pendingDeliveredAcks = new Set<string>();
  /** The current retry-chain token for a conversation id (ENG-207), minted
   *  by `beginJoinAttempt` on every FRESH `joinConversationRoom` call
   *  (never a retry of an existing chain). A retry's ack callback compares
   *  its own captured token against this map before acting; a mismatch means
   *  a NEWER call for the same id has already superseded it (e.g. the member
   *  left the id and came back to it), so the older chain stands down rather
   *  than running two retry chains for one id. */
  private joinAttemptTokens = new Map<string, number>();
  /** Monotonic source for `joinAttemptTokens`' values. */
  private nextJoinAttemptToken = 0;
  /** True while `recoverFromAuthFailure` has an awaited `refreshSession()` in
   *  flight (ENG-209) - the `disconnect` handler must not race it with its OWN
   *  reconnect schedule; `recoverFromAuthFailure` already owns reconnecting
   *  once the refresh settles. */
  private isAuthRefreshInFlight = false;
  /** The pending manual reconnect timer, shared by the `exception` handler's
   *  unauthenticated RATE_LIMITED/SERVER_ERROR branch and the `disconnect`
   *  handler's server-forced-disconnect branch (ENG-206/ENG-209) - at most one
   *  manual reconnect is ever scheduled at a time. Cleared once a connection
   *  is confirmed authenticated (see the `presence:snapshot` handler below)
   *  and in `dispose()`. */
  private reconnectTimer: number | null = null;
  /** Attempt counter for the shared exponential backoff above, reset to 0 the
   *  moment a `presence:snapshot` arrives (a confirmed, live, authenticated
   *  connection) so a long-since-resolved run of failures doesn't linger into
   *  the NEXT unrelated outage. */
  private reconnectAttempt = 0;
  /** The pending presence-clear grace timer (ENG-218) - cancelled once a
   *  connection is confirmed authenticated (the disconnect turned out to be
   *  transient, see the `presence:snapshot` handler below) and in
   *  `dispose()`. */
  private presenceClearTimer: number | null = null;
  /** The pending proactive `session:reauth` timer (ENG-219, frontend half) -
   *  at most one is ever scheduled at a time; a fresh schedule call always
   *  clears whatever was pending first (`scheduleProactiveReauth`). Cleared
   *  in `dispose()` so a disposed client never fires a stray reauth attempt. */
  private reauthTimer: number | null = null;

  constructor(
    url: string,
    qc: QueryClient,
    myUserId: string | null,
    myHandle: string | null,
  ) {
    this.url = url;
    this.qc = qc;
    this.myUserId = myUserId;
    this.myHandle = myHandle;
  }

  /** Update the known identity after (re)auth — the client outlives an auth
   *  refresh, and the echo skips must key off the current member. */
  setMyUserId(myUserId: string | null, myHandle: string | null): void {
    this.myUserId = myUserId;
    this.myHandle = myHandle;
  }

  onStatus(cb: (connected: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(connected: boolean): void {
    for (const cb of this.listeners) cb(connected);
  }

  onTyping(
    handler: (frame: ServerToClientEvents["typing"]) => void,
  ): () => void {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }
  /** Detach a handler by reference (used by the provider to unsubscribe from the
   *  CURRENT client after reconnects re-attached it). */
  offTyping(handler: (frame: ServerToClientEvents["typing"]) => void): void {
    this.typingHandlers.delete(handler);
  }
  onRead(handler: (frame: ServerToClientEvents["read"]) => void): () => void {
    this.readHandlers.add(handler);
    return () => this.readHandlers.delete(handler);
  }
  offRead(handler: (frame: ServerToClientEvents["read"]) => void): void {
    this.readHandlers.delete(handler);
  }
  onDelivered(
    handler: (frame: ServerToClientEvents["message:delivered"]) => void,
  ): () => void {
    this.deliveredHandlers.add(handler);
    return () => this.deliveredHandlers.delete(handler);
  }
  offDelivered(
    handler: (frame: ServerToClientEvents["message:delivered"]) => void,
  ): void {
    this.deliveredHandlers.delete(handler);
  }
  /** Peer-requested subscription (additive to this class's own cache-patch
   *  handling of `conversation:message` in `connect()` below) - for a
   *  consumer that wants the raw frame itself. */
  onConversationMessage(
    handler: (frame: ServerToClientEvents["conversation:message"]) => void,
  ): () => void {
    this.conversationMessageHandlers.add(handler);
    return () => this.conversationMessageHandlers.delete(handler);
  }
  offConversationMessage(
    handler: (frame: ServerToClientEvents["conversation:message"]) => void,
  ): void {
    this.conversationMessageHandlers.delete(handler);
  }
  /** Coalesce a delivered ack for `conversationId`: schedule one "received up to
   *  now" frame and let a burst of inbound messages fold into it. If this
   *  connection isn't confirmed live when the timer fires, the ack is held in
   *  `pendingDeliveredAcks` and re-issued from `handleSessionLive` once it is;
   *  sending it while down would sit in socket.io-client's own sendBuffer and
   *  flush on reconnect before that connection's own auth finishes (see
   *  `pendingConnectionRefusal`). */
  private scheduleDeliveredAck(conversationId: string): void {
    if (this.deliveredAckTimers.has(conversationId)) return;
    const timer = window.setTimeout(() => {
      this.deliveredAckTimers.delete(conversationId);
      if (this.hasAuthenticatedSinceConnect && this.socket?.connected) {
        this.socket.emit("delivered", { conversationId });
      } else {
        this.pendingDeliveredAcks.add(conversationId);
      }
    }, DELIVERED_ACK_DEBOUNCE_MS);
    this.deliveredAckTimers.set(conversationId, timer);
  }
  /** Raise a NON-active conversation's inbox row unread badge for one message,
   *  deduped by `countedInboxMessageIds` so the same message can't double-count
   *  if it reaches us on both `message:new` and `conversation:message` (see
   *  that field's doc). Owns both the dedupe bookkeeping and the actual
   *  `bumpConversationUnread` cache patch — called from both handlers' existing
   *  non-active-conversation branch, right alongside their unread-count
   *  invalidate. */
  private countInboxUnread(conversationId: string, messageId: string): void {
    if (this.countedInboxMessageIds.has(messageId)) return;
    this.countedInboxMessageIds.add(messageId);
    if (this.countedInboxMessageIds.size > INBOX_UNREAD_DEDUPE_LIMIT) {
      const oldest = this.countedInboxMessageIds.values().next().value;
      if (oldest !== undefined) this.countedInboxMessageIds.delete(oldest);
    }
    bumpConversationUnread(this.qc, conversationId);
  }
  onPresence(handler: (online: ReadonlySet<string>) => void): () => void {
    this.presenceHandlers.add(handler);
    handler(new Set(this.onlineUserIds)); // prime with a snapshot COPY (see below)
    return () => this.presenceHandlers.delete(handler);
  }
  offPresence(handler: (online: ReadonlySet<string>) => void): void {
    this.presenceHandlers.delete(handler);
  }
  // Always hand subscribers a fresh copy, never the live mutable `onlineUserIds`
  // Set — a consumer that stored the reference would otherwise see it mutate
  // in place with no re-render trigger.
  private notifyPresence(): void {
    const snapshot = new Set(this.onlineUserIds);
    for (const handler of this.presenceHandlers) handler(snapshot);
  }
  /** Emit a `typing` frame, but only over a connection confirmed live
   *  (ENG-206) - `typing` sent while disconnected, or while a connection is
   *  up but not yet confirmed authenticated, would otherwise sit in
   *  socket.io-client's own sendBuffer and flush on the NEXT reconnect,
   *  landing before THAT connection's own auth finishes and throwing a
   *  spurious refusal (see `pendingConnectionRefusal`). Typing is a
   *  disposable signal, so this drops it: the composer's own idle timer
   *  emits `isTyping: false` again soon regardless. `volatile` on top means
   *  even a merely slow, still-connected socket may silently drop it too -
   *  buffering a stale typing signal is never worth the cost. */
  emitTyping(conversationId: string, isTyping: boolean): void {
    if (!this.hasAuthenticatedSinceConnect || !this.socket?.connected) return;
    this.socket.volatile.emit("typing", { conversationId, isTyping });
  }

  /** Mint a fresh retry-chain token for `conversationId` (ENG-207) and
   *  record it as the current one, superseding whatever chain (if any) was
   *  previously in flight for this same id. */
  private beginJoinAttempt(conversationId: string): number {
    this.nextJoinAttemptToken += 1;
    this.joinAttemptTokens.set(conversationId, this.nextJoinAttemptToken);
    return this.nextJoinAttemptToken;
  }

  /**
   * Join `conversationId`'s room over `socket` and read the ack (ENG-207),
   * used by the `presence:snapshot` handler (issuing the room join the
   * moment a connection is confirmed authenticated, including one requested
   * earlier in the same connection) and `setActiveConversation` (a thread
   * switch) - the one place either needs to agree on what a join
   * success/refusal means.
   *
   * Never emits before `hasAuthenticatedSinceConnect` is true on this SAME
   * connected socket (ENG-206/ENG-207): the gateway's join handler reads
   * `client.data.userId`, set only once the async handshake auth resolves,
   * which can land AFTER the client's own `connect` fires (the namespace
   * CONNECT packet precedes NestJS's `handleConnection`). This guard covers
   * `joinConversationRoom` specifically; the wider pre-auth race - ANY emit
   * landing before auth and throwing a spurious UNAUTHORIZED - is closed for
   * every emitter by the `exception`/`disconnect` handlers'
   * `pendingConnectionRefusal` deferral, so a stray early emit now costs at
   * most a wasted round trip. There is nothing to retry here either: the
   * `presence:snapshot` handler re-issues this call for `activeConversationId`
   * the moment authentication is confirmed, covering a pending join exactly
   * like this one.
   *
   * `ok: true` → confirmed; if `activeConversationId` has since moved on to a
   * different thread (a fast switch while this join was still in flight),
   * leave this room now that the join is confirmed to have landed (ENG-207 -
   * a `conversation:leave` sent WHILE the join was still pending can
   * be processed by the server before the join's own async room-join step
   * finishes, so acting only once the join is confirmed avoids that race).
   * A timeout, a missing ack, or `RATE_LIMITED` retries after
   * `CONVERSATION_JOIN_RETRY_DELAYS_MS` (1s/2s/4s, `attempt` starts at 1 and
   * stops once `CONVERSATION_JOIN_MAX_ATTEMPTS` is reached) - but ONLY while
   * `conversationId` is STILL `activeConversationId`, `socket` is STILL the
   * live, connected, authenticated socket, AND this call's own token is
   * STILL the current one for `conversationId` (a newer call for the same id
   * - e.g. the member left it and came back - supersedes an older chain, so
   * only ONE ever keeps retrying for that id). `FORBIDDEN` stops outright and
   * logs (e.g. removed from the conversation mid-session) - retrying can't
   * fix a permissions refusal.
   */
  private joinConversationRoom(
    conversationId: string,
    socket: Socket<ServerListeners, ClientEmitters>,
    attempt = 1,
    attemptToken?: number,
  ): void {
    if (
      !this.hasAuthenticatedSinceConnect ||
      this.socket !== socket ||
      !socket.connected
    ) {
      return;
    }
    const token = attemptToken ?? this.beginJoinAttempt(conversationId);
    socket
      .timeout(CONVERSATION_JOIN_ACK_TIMEOUT_MS)
      .emit("conversation:join", { conversationId }, (error, ack) => {
        if (this.joinAttemptTokens.get(conversationId) !== token) return;
        const isStillConnected =
          this.hasAuthenticatedSinceConnect &&
          this.socket === socket &&
          socket.connected;
        if (!isStillConnected) return;
        if (!error && ack.ok) {
          if (this.activeConversationId !== conversationId) {
            this.leaveConversationRoom(conversationId);
          }
          return;
        }
        // The member has already moved on from this id - don't retry (or
        // log a refusal for) a target nobody wants anymore.
        if (this.activeConversationId !== conversationId) return;
        if (!error && !ack.ok && ack.code === "FORBIDDEN") {
          logWarn("realtime: conversation:join forbidden", { conversationId });
          return;
        }
        // Timeout (error set, no ack), or a RATE_LIMITED refusal - retry.
        if (attempt >= CONVERSATION_JOIN_MAX_ATTEMPTS) {
          logWarn("realtime: conversation:join exhausted retries", {
            conversationId,
          });
          return;
        }
        const delay = CONVERSATION_JOIN_RETRY_DELAYS_MS[attempt - 1]!;
        window.setTimeout(() => {
          if (this.joinAttemptTokens.get(conversationId) !== token) return;
          if (
            this.hasAuthenticatedSinceConnect &&
            this.socket === socket &&
            socket.connected &&
            this.activeConversationId === conversationId
          ) {
            this.joinConversationRoom(
              conversationId,
              socket,
              attempt + 1,
              token,
            );
          }
        }, delay);
      });
  }

  /**
   * Leave `conversationId`'s room (ENG-217), e.g. when the member switches to
   * a different open thread. A no-op before `hasAuthenticatedSinceConnect`
   * (ENG-206/ENG-207, mirroring `joinConversationRoom`'s own guard): if
   * this connection was never confirmed authenticated, it was never actually
   * joined to any room either, so there's nothing on the server to leave, and
   * emitting anyway would only throw the same UNAUTHORIZED a premature join
   * would. Otherwise best-effort: a refusal or timeout is just logged, never
   * retried - the room membership dies anyway the next time this socket
   * reconnects (rooms aren't rejoined except for `activeConversationId`), so
   * a stray stale membership here costs at most some harmless extra
   * `conversation:message`/`conversation:new` traffic this class already
   * tolerates as a no-op.
   */
  private leaveConversationRoom(conversationId: string): void {
    if (!this.hasAuthenticatedSinceConnect || !this.socket?.connected) return;
    this.socket
      .timeout(CONVERSATION_JOIN_ACK_TIMEOUT_MS)
      .emit("conversation:leave", { conversationId }, (error, ack) => {
        if (error) return;
        if (!ack.ok) {
          logWarn("realtime: conversation:leave rate limited", {
            conversationId,
          });
        }
      });
  }

  /** The shared manual-reconnect scheduler for the `exception` handler's
   *  unauthenticated RATE_LIMITED/SERVER_ERROR branch and the `disconnect`
   *  handler's server-forced-disconnect branch (ENG-206/ENG-209). A no-op if
   *  this client is terminal or a reconnect is already pending - at most one
   *  manual reconnect is ever in flight. */
  private scheduleReconnect(
    delayMs: number,
    socket: Socket<ServerListeners, ClientEmitters>,
  ): void {
    if (this.isTerminal || this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.isTerminal || this.socket !== socket) return;
      socket.connect();
    }, delayMs);
  }

  /** Full-jitter the exponential backoff delay: a random point in the upper
   *  half of the capped delay, so the very first attempt (base 1s) never
   *  collapses to a near-zero wait while still smoothing a thundering herd of
   *  clients failing at the same moment. Advances `reconnectAttempt`. */
  private nextExponentialBackoffDelayMs(): number {
    const cappedDelay = Math.min(
      RECONNECT_BACKOFF_BASE_MS * 2 ** this.reconnectAttempt,
      RECONNECT_BACKOFF_CAP_MS,
    );
    this.reconnectAttempt += 1;
    return cappedDelay / 2 + Math.random() * (cappedDelay / 2);
  }

  /** Schedule a reconnect for a RATE_LIMITED or SERVER_ERROR `exception` seen
   *  BEFORE this connect ever authenticated (ENG-206) - most likely the
   *  handshake itself being refused, which the gateway may or may not also
   *  follow with a `disconnect`; `scheduleReconnect`'s own guard makes a
   *  follow-up `disconnect` a no-op either way. RATE_LIMITED gets a flat
   *  15-30s jittered window (hammering a limiter harder doesn't clear it
   *  faster); SERVER_ERROR gets the shared exponential backoff. */
  private scheduleUnauthenticatedReconnect(
    socket: Socket<ServerListeners, ClientEmitters>,
    code: "RATE_LIMITED" | "SERVER_ERROR",
  ): void {
    const delayMs =
      code === "RATE_LIMITED"
        ? RATE_LIMITED_RECONNECT_MIN_MS +
          Math.random() *
            (RATE_LIMITED_RECONNECT_MAX_MS - RATE_LIMITED_RECONNECT_MIN_MS)
        : this.nextExponentialBackoffDelayMs();
    this.scheduleReconnect(delayMs, socket);
  }

  /** Make this client terminal (ENG-206): stop socket.io's own reconnection
   *  and cancel any manual reconnect this class scheduled. Used for
   *  SESSION_REVOKED / PLATFORM_LOCKED (no refresh fixes either) and for an
   *  auth refusal a refresh cannot resolve (the cooldown skipped it, or two
   *  refusals happened in a row regardless). Recovery needs no reload - see
   *  `isTerminal`'s doc. */
  private goTerminal(
    socket: Socket<ServerListeners, ClientEmitters>,
    reason: string,
  ): void {
    logWarn("realtime: going terminal", { reason });
    this.isTerminal = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    socket.io.reconnection(false);
  }

  /** Route a CONFIRMED auth refusal (ENG-206): called only from `disconnect`
   *  once `pendingConnectionRefusal` is confirmed by an actual server-forced
   *  disconnect landing shortly after it - see that field's doc for why a raw
   *  `exception` alone never reaches here directly. `bypassCooldown` carries
   *  through to `recoverFromAuthFailure` for TOKEN_EXPIRED. Returns early if
   *  already terminal (ENG-206): a client that decided it's unrecoverable
   *  must never re-enable reconnection through this path. Otherwise counts
   *  consecutive refusals since the last confirmed `presence:snapshot` - a
   *  refresh already got its one chance on the FIRST refusal, so the SECOND
   *  one in a row goes straight to terminal. Otherwise defers to
   *  `recoverFromAuthFailure`, which has its OWN terminal trigger
   *  for a refusal the refresh cooldown skips outright. */
  private handleAuthRefusal(
    socket: Socket<ServerListeners, ClientEmitters>,
    bypassCooldown: boolean,
  ): void {
    if (this.isTerminal) return;
    this.consecutiveAuthRefusals += 1;
    if (this.consecutiveAuthRefusals >= 2) {
      this.goTerminal(socket, "2 consecutive auth refusals");
      return;
    }
    void this.recoverFromAuthFailure(socket, bypassCooldown);
  }

  /** Record `act` as the current pending connection refusal's action, and
   *  remember when (ENG-206) - see `pendingConnectionRefusal`'s
   *  own doc for what this defers and why. A later refusal simply replaces an
   *  earlier one; only the most recent is ever acted on. */
  private recordPendingConnectionRefusal(act: () => void): void {
    this.pendingConnectionRefusal = { act, at: Date.now() };
  }

  /**
   * Handles a gateway `exception` frame (ENG-206): auth/validation/handler
   * failures, including access-token expiry, session revocation, platform
   * lockdown, rate limits, and a single handler call's refusal. See
   * `ChatWsErrorCode`'s doc in contracts/realtime.ts for what each code
   * means.
   */
  private handleExceptionFrame(
    data: ServerToClientEvents["exception"],
    socket: Socket<ServerListeners, ClientEmitters>,
  ): void {
    const code: ChatWsErrorCode | undefined = data.code;

    // No `code` at all: an OLDER deployed backend, which flattens every
    // handshake rejection to a bare `Unauthorized` message (and access-token
    // expiry to `Token expired`) with nothing else to go on. Match those two
    // messages for the auth-recovery path exactly as the newer, coded
    // UNAUTHORIZED/TOKEN_EXPIRED branch below does. This is only ever
    // RECORDED here for later confirmation (ENG-206) - see
    // `pendingConnectionRefusal`'s doc for why: a HANDLER-level refusal (a
    // buffered `typing`/`delivered` packet flushed on reconnect before this
    // connection's own auth finished) throws the exact same message and
    // never disconnects the socket on its own, so treating every occurrence
    // as a connection-level refusal used to spend a refresh-token rotation
    // (or worse, go terminal) on a perfectly healthy socket.
    if (!code) {
      const message = String(data.message);
      logWarn("realtime: gateway exception (uncoded)", { message });
      if (message === "Unauthorized" || message === "Token expired") {
        const bypassCooldown = message === "Token expired";
        this.recordPendingConnectionRefusal(() =>
          this.handleAuthRefusal(socket, bypassCooldown),
        );
      }
      return;
    }

    logWarn("realtime: gateway exception", {
      code,
      message: String(data.message),
    });

    if (code === "UNAUTHORIZED" || code === "TOKEN_EXPIRED") {
      // Same deferral as the uncoded branch above, for the same reason
      // (ENG-206): recorded as a `pendingConnectionRefusal`,
      // confirmed and acted on only from `disconnect`.
      //
      // TOKEN_EXPIRED is a scheduled, EXPECTED rotation: the 15-minute
      // access cookie lapsing under an otherwise-open socket - so once
      // confirmed, it bypasses `recoverFromAuthFailure`'s cooldown (that
      // cooldown exists to stop a REPEATEDLY REFUSED socket from burning a
      // refresh on every retry, which a scheduled, once-per-15-min expiry
      // can never do). Nothing else refreshes that cookie: a member
      // sitting on /messages makes no HTTP requests (frames are patched
      // through this socket and `refetchOnWindowFocus` is off), so without
      // this, presence/typing/receipts/messages silently stop after
      // roughly 15 idle minutes.
      const bypassCooldown = code === "TOKEN_EXPIRED";
      this.recordPendingConnectionRefusal(() =>
        this.handleAuthRefusal(socket, bypassCooldown),
      );
      return;
    }

    if (code === "SESSION_REVOKED" || code === "PLATFORM_LOCKED") {
      // Terminal for this client, acted on immediately: SESSION_REVOKED and
      // PLATFORM_LOCKED are both definitive session/platform-validity
      // checks, so there's no ambiguity here for `pendingConnectionRefusal`
      // to resolve first (the auth branch above needs that resolution
      // because a stray handler-level buffered packet CAN throw the same
      // UNAUTHORIZED a genuine handshake refusal would; neither of these
      // codes can come from a handler call at all). SESSION_REVOKED fires
      // either from the gateway's own status check and `assertSessionLive`
      // during the HANDSHAKE, or later against an already-live session being
      // revoked mid-flight - either way, this device's session was signed
      // out, or the member is no longer active, and no refresh fixes either.
      // PLATFORM_LOCKED: the server refuses every handshake until
      // an admin lifts it, and each refusal costs a JWT verify + a user
      // lookup that no rate limiter covers (the gateway's buckets key on a
      // user id that only exists after a SUCCESSFUL handshake; the HTTP
      // throttler skips WS) - left to its default cadence, every signed-in
      // member would retry ~once a second for the whole lockdown.
      // Recovery needs no reload: once the surrounding page reacts (signs
      // the member out / renders the maintenance screen) and unmounts,
      // `demand` drops to 0 and the provider's effect cleanup disposes this
      // RealtimeClient - so the next connect() builds a brand-new io()
      // Manager with reconnection back at its default.
      //
      // Known PLATFORM_LOCKED gap: a member idling on /messages makes no
      // HTTP request, so nothing 503s and nothing trips the lock. They see
      // a dead socket rather than the maintenance screen until they
      // navigate or otherwise act.
      this.goTerminal(socket, code);
      return;
    }

    if (
      !this.hasAuthenticatedSinceConnect &&
      (code === "RATE_LIMITED" || code === "SERVER_ERROR")
    ) {
      // Same deferral once more (ENG-206): a buffered packet's
      // handler call can throw RATE_LIMITED or SERVER_ERROR just as easily
      // as UNAUTHORIZED, and just as falsely look like the HANDSHAKE itself
      // being refused while this connection has yet to produce a
      // `presence:snapshot`. Recorded, then confirmed and acted on only
      // from `disconnect`, which is where a manual reconnect gets
      // scheduled: socket.io's own automatic reconnection does not cover a
      // genuine handshake-time refusal it never initiated.
      this.recordPendingConnectionRefusal(() =>
        this.scheduleUnauthenticatedReconnect(socket, code),
      );
      return;
    }

    // FORBIDDEN / NOT_FOUND / BAD_REQUEST, or RATE_LIMITED / SERVER_ERROR
    // AFTER authentication (a single handler call refused - e.g. a
    // rate-limited `typing`, or `message:send` on a conversation the caller
    // was removed from) - log only, already done above. No auth action, no
    // reconnect scheduling: the connection itself stays up, and socket.io's
    // own transport-level reconnect (if the connection even dropped) keeps
    // running unmodified.
    //
    // ENG-242: a moderator `restrict` action's refusal (`ACCOUNT_RESTRICTED`)
    // lands here too, as a FORBIDDEN carrying `domainCode:
    // "ACCOUNT_RESTRICTED"` beside its display `message`, which stays a plain
    // string (see `ws-exception.filter.ts`, backend). Falling
    // into this same branch is deliberate and load-bearing: it must NEVER be
    // confused with an auth/session failure (the branches above), since the
    // member is neither signed out nor needs to refresh anything - only a
    // send was refused. Today every send goes over HTTP, so a client never
    // actually sees this frame; if a future WS send path lands, the
    // failed-send UI (`MessageRun.tsx`'s `failureCode === "ACCOUNT_RESTRICTED"`
    // branch) is what renders the honest reason, not this handler.
  }

  /**
   * Opens the socket. Fire-and-forget (the caller — the provider's connect
   * effect — isn't async): the actual work is in `connectAsync`, which
   * dynamically imports `socket.io-client` first so that ~12.7KB gzip module
   * is only ever pulled into the bundle for a page that's actually going to
   * open a socket (signed-in, live mode, a consumer has called `request()`) —
   * not preloaded for every logged-out/demo/marketing visitor.
   */
  connect(): void {
    if (this.socket || this.connecting) return;
    this.connecting = true;
    void this.connectAsync();
  }

  private async connectAsync(): Promise<void> {
    const { io } = await import("socket.io-client");
    // `dispose()` may have run while the import was in flight (e.g. a sign-out
    // that unmounts every socket consumer mid-load) — bail rather than opening
    // a socket nobody wants anymore.
    if (!this.connecting) return;
    this.connecting = false;
    const socket: Socket<ServerListeners, ClientEmitters> = io(this.url, {
      withCredentials: true,
      transports: ["websocket"],
    });
    this.socket = socket;

    socket.on("connect", () => {
      // socket.io's `connect` fires as soon as the NAMESPACE connection
      // succeeds - which happens BEFORE NestJS's `handleConnection` (the
      // actual JWT auth) resolves, since @nestjs/websockets binds message
      // handlers and runs `handleConnection` unawaited (see the namespace
      // CONNECT-precedes-`connection` ordering in socket.io itself). So
      // `connect` fires even for a handshake the gateway is about to refuse
      // with an `exception` + `disconnect`, and means only that the transport
      // is up; whether the session is authenticated is confirmed separately,
      // by the first `presence:snapshot`. Reset the per-connection auth flag
      // here; everything `connect` used to do beyond that (marking
      // the socket connected, joining the active room, reconciling history,
      // refreshing the inbox, resetting the backoff) now runs from the FIRST
      // `presence:snapshot` after this point instead, since the contract only
      // ever emits that once the handshake genuinely succeeded.
      this.hasAuthenticatedSinceConnect = false;
      // A new connection starts with no refusal of its own pending yet
      // (ENG-206): clearing any record left over from the PREVIOUS
      // connection here is safe because an `exception` frame can only ever
      // arrive after this `connect` handler has already run for the
      // connection it belongs to. Without this, a stale record from an
      // earlier connection could be wrongly confirmed by a later, unrelated
      // `io server disconnect` that carries no `exception` frame of its own
      // (a lockdown drop or a blanket session revoke, for example).
      this.pendingConnectionRefusal = null;
    });
    socket.on("disconnect", (reason) => {
      // ENG-206: `dispose()` nulls `this.socket` BEFORE calling
      // `.disconnect()`, specifically so THIS handler firing synchronously
      // from that call can't re-arm a timer or any other state on a client
      // that's already torn down. A mismatch here means this event belongs
      // to a socket this instance no longer owns.
      if (this.socket !== socket) return;
      this.emit(false);
      logInfo("realtime: disconnected", { reason });
      // ENG-206: `pendingConnectionRefusal` (see its own doc) is
      // acted on HERE, and only once CONFIRMED by an `'io server disconnect'`
      // landing within `PENDING_CONNECTION_REFUSAL_WINDOW_MS` of it - the
      // gateway guarantees a genuine connection-level refusal (or TOKEN_
      // EXPIRED) always disconnects the socket, so pairing the two is what
      // tells that apart from a stray handler-level refusal, which never
      // disconnects the socket on its own and so never gets confirmed here.
      const pendingRefusal = this.pendingConnectionRefusal;
      const isPendingRefusalConfirmed =
        reason === "io server disconnect" &&
        pendingRefusal !== null &&
        Date.now() - pendingRefusal.at < PENDING_CONNECTION_REFUSAL_WINDOW_MS;
      if (isPendingRefusalConfirmed) {
        this.pendingConnectionRefusal = null;
        pendingRefusal.act();
      } else if (
        // ENG-209: socket.io-client never auto-reconnects after a SERVER
        // disconnect - `'io server disconnect'` is the one reason value
        // meaning the SERVER explicitly called `socket.disconnect()` (as
        // this gateway does after e.g. a SESSION_REVOKED `exception`, or
        // right after any confirmed connection-level refusal above). Every
        // other reason (`'transport close'`, `'ping timeout'`, …) is a
        // CLIENT-observed drop that socket.io's own Engine.IO backoff
        // already retries - left alone here, per the file header above.
        //
        // Skipped when: a confirmed refusal already claimed this disconnect,
        // above; terminal (SESSION_REVOKED/PLATFORM_LOCKED already decided
        // this client is done); an auth refresh is in flight
        // (`recoverFromAuthFailure` already owns reconnecting once that
        // settles, and disabled `socket.io.reconnection` itself); or a
        // manual reconnect is already scheduled.
        reason === "io server disconnect" &&
        !this.isTerminal &&
        !this.isAuthRefreshInFlight &&
        this.reconnectTimer === null
      ) {
        this.scheduleReconnect(this.nextExponentialBackoffDelayMs(), socket);
      }
      // ENG-218: don't flip every online dot off for what may be a routine
      // TOKEN_EXPIRED reconnect-and-refresh - the backend itself keeps the
      // member "online" for ~10s after that specific drop for the same
      // reason. Give this connection 5s to come back (the `presence:snapshot`
      // handler below cancels this timer outright once authentication is
      // confirmed) before clearing the local snapshot. Counting as "back"
      // here requires all three: a socket this instance still owns, with its
      // AUTHENTICATION confirmed live, and actually connected.
      if (this.presenceClearTimer === null) {
        this.presenceClearTimer = window.setTimeout(() => {
          this.presenceClearTimer = null;
          if (
            this.socket === socket &&
            this.hasAuthenticatedSinceConnect &&
            socket.connected
          ) {
            return;
          }
          this.onlineUserIds.clear();
          this.notifyPresence();
        }, PRESENCE_CLEAR_GRACE_MS);
      }
    });
    socket.on("connect_error", (err: Error) => {
      this.emit(false);
      logWarn("realtime: connect error", { err: err.message });
    });

    // Gateway auth/validation/handler failures, including access-token
    // expiry, session revocation, platform lockdown, rate limits and a single
    // handler call's refusal (ENG-206). See `handleExceptionFrame` below.
    socket.on("exception", (data) => this.handleExceptionFrame(data, socket));

    // Cache patching. An inbound message carries the full MessageResponse, so we
    // patch it straight into the thread cache (upsert, deduped by id AND by the
    // sender's clientMessageId — which reconciles our own optimistic bubble)
    // instead of refetching the whole page. The reaction / updated / deleted
    // frames below only carry ids, so those still invalidate (see each note).
    socket.on("message:new", ({ conversationId, message }) => {
      // ENG-216: computed FIRST, because it gates everything below it - the
      // backend broadcasts `message:new` to the WHOLE room including the
      // sender (useMessageMutations.ts), so this fires for our own send too,
      // and (unlike the old comment here claimed) our own send does NOT
      // always target the open thread: a SECOND device of ours can send into
      // a conversation this tab has open, closed, or doesn't even have
      // cached - the echo still needs the same own-message handling either way.
      const isOwnMessage =
        !!this.myHandle && message.sender.handle === this.myHandle;
      upsertMessage(this.qc, conversationId, message);
      // The frame carries the full new message, so patch the inbox row's
      // preview/time in place (and move it to the top) instead of refetching
      // the whole list. Still applied for our OWN echo - harmless, since
      // `useSendMessage.onSuccess` already applied the identical patch on the
      // SENDING device; the second application here (on this OR another
      // device) is a no-op re-affirmation, entirely local with no network
      // round-trip of its own.
      patchConversationPreview(this.qc, conversationId, message);
      // Skip the rest for our OWN message: no unread bump (we sent it, it's
      // not unread to us on ANY device), and no delivered ack (a gateway that
      // stores deliveredAt per participant would stamp the sender's own
      // watermark from an ack about their own message, skewing group
      // "delivered to" counts) - mirrors the same own-echo skip on the
      // `reaction` and `typing` handlers below.
      if (isOwnMessage) return;
      // A new message may bump the nav DM badge (its own isolated key
      // `["conversations-unread-count"]`, mirrored from useConversations.ts, not
      // touched by the list patch above). Only invalidate for a NON-active
      // conversation: a message in the thread the member has OPEN will be
      // marked read (useMarkRead already refreshes the badge).
      if (conversationId !== this.activeConversationId) {
        void this.qc.invalidateQueries({
          queryKey: ["conversations-unread-count"],
        });
        // The NAV badge invalidate above is a separate, isolated key from the
        // inbox row's own `unread`/`unreadCount` in `["conversations"]` — the
        // list is never invalidated here (see the file header), so nothing else
        // raises that row's dot/count for a chat the member doesn't have open.
        // Bump it locally too.
        this.countInboxUnread(conversationId, message.id);
      }
      // We received it → ack delivery so the SENDER's tick advances to a double
      // check. Only the joined (open) thread streams `message:new`, so this only
      // fires for a conversation the member is present in — exactly when
      // "delivered" is true. Throttled.
      this.scheduleDeliveredAck(conversationId);
    });
    // A `read` frame is a watermark update, not new content. Our OWN read is
    // already patched into the cache by `useMarkRead.onSuccess` (zeroes the
    // unread count locally, no refetch); this frame would just be the
    // self-echo of that. The COUNTERPART's read of our sent messages doesn't
    // change our own unread count either, and the list row's
    // `otherLastReadAt` is only a cold-load fallback seed for the "Seen" tick
    // (see messages.adapters.ts) — the LIVE tick comes from the separate
    // `useReadFrames`/`onRead` subscription in useMessageReceipts.ts, which
    // already ignores our own userId there too. So there is genuinely nothing
    // to patch into `["conversations"]` for either side of this frame —
    // deliberately no handler here (was a redundant blanket invalidate that
    // doubled the GET /conversations fired by useMarkRead's own mutation).
    // A notification arrived for us. This used to be a single blanket
    // `invalidateQueries(["notifications"])` — a PREFIX match that ALSO caught
    // (and refetched) the nav bell's isolated unread-count query, doubling the
    // network cost of every single notification. Split instead: the frame
    // already carries the full notification (and a freshly-created one is
    // always unread — see `RealtimeNotification`'s note in contracts/realtime.ts),
    // so bump the badge's cache LOCALLY with no network; only the feed (which
    // needs `t`/`fmt` translation this class can't supply) genuinely needs a
    // refetch, scoped to its OWN key prefix.
    // The frame is the mapped row itself, NOT `{ notification }` — the gateway
    // emits `toNotificationResponse(...)` directly (see contracts/realtime.ts).
    socket.on("notification:new", (notification) => {
      if (!notification.read) {
        // Matches useUnreadCount.ts's `["notifications", "unread-count",
        // demoMode]` key exactly. The socket only ever exists when
        // `!demoMode` (RealtimeProvider's `active` gate), so `demoMode` is
        // always `false` here.
        this.qc.setQueryData<number>(
          ["notifications", "unread-count", false],
          (previous) => (previous ?? 0) + 1,
        );
      }
      // Matches useNotifications.ts's `["notifications", demoMode, unreadOnly,
      // language]` key as a PREFIX, scoped to `demoMode: false` — this can
      // never also match (and re-fetch) the unread-count key above, whose
      // second element is the string `"unread-count"`, not `false`.
      void this.qc.invalidateQueries({ queryKey: ["notifications", false] });
      // The Mentions tab is a separate feed keyed `["mentions", demoMode,
      // language]`, so the invalidation above never reaches it. Without this a
      // new @-mention bumps the bell badge but the open Mentions tab keeps
      // showing stale rows until a reload.
      if (notification.type === "mention") {
        void this.qc.invalidateQueries({ queryKey: ["mentions", false] });
      }
    });
    // A new conversation (a group) the member was just added to — their inbox
    // doesn't know about it yet, so refetch the list. The member isn't in the
    // conversation room, so this user-room frame is how the group first appears.
    socket.on("conversation:new", () => {
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
      // A brand-new thread may already carry unread messages → refresh the badge.
      void this.qc.invalidateQueries({
        queryKey: ["conversations-unread-count"],
      });
    });
    // ENG-160: a message landed in a conversation this socket has NOT joined
    // the room for — a different thread open, or the member elsewhere in the
    // app entirely (this frame reaches us via our `user:<id>` room, joined at
    // handshake, regardless of which thread is active). Without this, only the
    // ACTIVE thread's `message:new` kept the inbox/badge live, so a message in
    // any OTHER thread produced no badge bump and no inbox-row update until a
    // remount or reload. The gateway's fan-out (`fanOutConversationMessage`)
    // excludes the sender server-side, so an own-echo skip below is a purely
    // defensive extra layer (see that skip's own note).
    //
    // ENG-210: also upsert into the THREAD cache, alongside the inbox row this
    // already patched - this used to only patch the inbox preview, so a
    // thread that's cached but not the active/joined room (e.g. a second open
    // tab on a different conversation, or a thread the member scrolled away
    // from but didn't unmount) silently missed this message until a reopen
    // refetched it. `upsertMessage` is a no-op when the thread isn't cached
    // (`setQueriesData` over a filter only touches EXISTING cache entries - it
    // can't create one), so this can't accidentally seed a single-message
    // "page" for a thread nobody has opened yet.
    socket.on("conversation:message", ({ conversationId, message }) => {
      upsertMessage(this.qc, conversationId, message);
      // Peer-requested fan-out (additive to the cache patching in this handler,
      // exactly like `onRead`/`onDelivered` above) - for a consumer that wants
      // the raw frame itself. Runs unconditionally, ahead of the own-echo
      // check below, mirroring every other per-event fan-out in this file.
      for (const handler of this.conversationMessageHandlers) {
        handler({ conversationId, message });
      }
      // A brand-new DM has no cached row at all yet - `patchConversationPreview`
      // is a no-op in that case, so the conversation would never appear until
      // some OTHER trigger refetched the list. Detect that case (the list IS
      // cached, but no row matches this id) and invalidate the list instead,
      // mirroring `conversation:new`'s handling of a brand-new GROUP just
      // above (the unread-count badge for this case is covered once, below,
      // alongside every other non-active-conversation bump - see that
      // comment for why it isn't ALSO invalidated here). An uncached list
      // (nobody has opened the inbox yet this session) needs no action either
      // way - it'll fetch fresh on first render.
      const cachedConversationLists = this.qc.getQueriesData<Conversation[]>({
        queryKey: ["conversations"],
      });
      const isListCached = cachedConversationLists.some(
        ([, data]) => data !== undefined,
      );
      const hasCachedRow = cachedConversationLists.some(([, data]) =>
        data?.some((conversation) => conversation.id === conversationId),
      );
      if (isListCached && !hasCachedRow) {
        void this.qc.invalidateQueries({ queryKey: ["conversations"] });
      } else {
        patchConversationPreview(this.qc, conversationId, message);
      }
      if (conversationId !== this.activeConversationId) {
        // The ONE unread-count invalidate for this frame, covering both
        // branches above (a brand-new DM's row appearing for the first time,
        // or an existing row's bump) - each used to invalidate this same key
        // separately, firing it twice for a brand-new, non-active DM.
        void this.qc.invalidateQueries({
          queryKey: ["conversations-unread-count"],
        });
        // ENG-160 follow-up: this frame is what a member sitting on /messages
        // with a DIFFERENT chat open never had raise that OTHER chat's inbox
        // row — `patchConversationPreview` above only ever touches
        // preview/time, nothing else here raised `unread`/`unreadCount`, so the
        // row stayed at 0 until a remount refetched `["conversations"]`. Bump
        // it locally now, deduped against `message:new` double-delivery by
        // `countInboxUnread`. No own-echo check needed: the gateway's fan-out
        // (`fanOutConversationMessage`) already excludes the sender server-side,
        // so this branch can never fire for our own send.
        this.countInboxUnread(conversationId, message.id);
      }
      // We received it (over our OWN user room, even though this thread isn't
      // the open one) → ack delivery so the SENDER's tick advances from one
      // check to two. Without this, "the sender's tick stays at one check
      // until the recipient opens the thread" (ENG-160) even though the
      // message genuinely reached this device — `delivered` is a
      // reached-the-device signal, not a read one (see `markDelivered` in
      // conversations.service.ts: it stamps only `deliveredAt`, a column
      // distinct from `lastReadAt`/"Seen", and never emits a `read` frame).
      //
      // Same own-echo skip as the `message:new` handler above: the gateway's
      // fan-out already excludes the sender server-side
      // (`fanOutConversationMessage`), so this can't fire for our own send in
      // practice — kept for parity with the sibling handler and as a second
      // line of defence if that server-side exclusion ever changes.
      if (this.myHandle && message.sender.handle === this.myHandle) return;
      this.scheduleDeliveredAck(conversationId);
    });
    // A reaction changed on a message in this room. The frame carries the
    // authoritative per-key counts, so patch them in place (deduped by message
    // id) instead of refetching the whole thread — a full invalidate here would
    // flicker the list and churn the scroll anchor for every reaction (the very
    // thing messageCache.ts avoids elsewhere). Skip the echo of our OWN reaction:
    // its optimistic patch already applied, and re-applying absolute counts we
    // already reflect is redundant (and would fight a mid-flight local delta).
    socket.on(
      "reaction",
      ({ conversationId, messageId, userId, reactions }) => {
        // PRD-352: an open "who reacted" sheet refetches its list. Ahead of
        // the echo skip, so a reaction this member made on another device
        // lands too. Same literal as `messageReactorsQueryKey`.
        void this.qc.invalidateQueries({
          queryKey: ["messageReactors", messageId],
        });
        if (this.myUserId && userId === this.myUserId) return;
        patchMessageReactionCounts(
          this.qc,
          conversationId,
          messageId,
          reactions,
        );
      },
    );
    // A message was soft-deleted (author or staff). The frame only carries the
    // id, not a deletedAt timestamp, so patch the tombstone in place using "now"
    // — the same approximation `useDeleteMessage.onSuccess` already uses for the
    // acting user's own optimistic patch (messageCache.ts's `patchMessageDelete`
    // sets body/reactions from the delete, and `deletedAt` only needs to be
    // truthy for the tombstone to render). No own-echo skip needed: like
    // `message:new` above (and unlike `reaction`'s delta), this is an idempotent
    // SET, so re-applying the deleting user's own already-patched tombstone is a
    // harmless no-op. There's no last-message id on a cached conversation row to
    // check whether this message was the inbox preview, so the preview is left
    // alone here — it self-corrects on the next `["conversations"]` fetch.
    socket.on("message:deleted", ({ conversationId, messageId }) => {
      patchMessageDelete(
        this.qc,
        conversationId,
        messageId,
        new Date().toISOString(),
      );
    });
    // A message was pinned/unpinned. Pins are SHARED, so patch the message's pin
    // state into the thread cache (in-bubble indicator flips) and refresh only
    // the conversation's pinned-messages list — no blanket thread invalidation.
    socket.on("message:pinned", ({ conversationId, messageId, pinned }) => {
      patchMessagePinned(
        this.qc,
        conversationId,
        messageId,
        pinned ? new Date().toISOString() : null,
      );
      void this.qc.invalidateQueries({
        queryKey: ["conversation-pins", conversationId],
      });
    });
    // A message was edited (15-min window). The frame carries the full updated
    // message, so patch body + editedAt in place instead of refetching the whole
    // thread — mirrors `patchMessageEdit`'s use in `useEditMessage.onSuccess`.
    // Same idempotent-SET / no-own-echo-skip / preview-left-alone reasoning as
    // `message:deleted` above.
    socket.on("message:updated", ({ conversationId, message }) => {
      patchMessageEdit(
        this.qc,
        conversationId,
        message.id,
        message.body,
        message.editedAt ?? new Date().toISOString(),
      );
    });

    // Per-event fan-out to component subscribers (additive — the invalidation
    // handlers above still run for every frame).
    socket.on("typing", (frame) => {
      // Skip the echo of our OWN typing. The gateway already excludes the
      // sender's `user:<id>` room, but a member signed in on two devices must
      // never see themselves typing even if that frame reaches us (older
      // backend, future broadcast path) — mirrors the reaction echo-skip above.
      if (this.myUserId && frame.userId === this.myUserId) return;
      for (const handler of this.typingHandlers) handler(frame);
    });
    socket.on("read", (frame) => {
      for (const handler of this.readHandlers) handler(frame);
    });
    // Delivered receipt: the counterpart's device acked receipt up to
    // `deliveredAt`. Fan out to subscribers (the controller advances its
    // delivered watermark for the tick); no cache invalidation — it's a cheap,
    // render-only signal, mirroring how `read` drives "Seen".
    socket.on("message:delivered", (frame) => {
      for (const handler of this.deliveredHandlers) handler(frame);
    });
    socket.on("presence", ({ userId, online }) => {
      if (online) this.onlineUserIds.add(userId);
      else this.onlineUserIds.delete(userId);
      this.notifyPresence();
    });
    socket.on("presence:snapshot", ({ online }) => {
      // The contract's own definition of "authenticated": the gateway only
      // ever emits this after a FULLY authenticated handshake (ENG-206).
      // socket.io's `connect` fires too early to mean that (see its handler
      // above), so everything `handleSessionLive` does below used to run
      // from `connect` and now waits for the FIRST snapshot since that
      // connect instead - a later snapshot on the same connection is a plain
      // presence replace only.
      const isFirstSnapshotSinceConnect = !this.hasAuthenticatedSinceConnect;
      this.hasAuthenticatedSinceConnect = true;
      // Resets on every confirmed authentication: a run of consecutive auth
      // refusals `handleAuthRefusal` was counting is over once one of them
      // actually lands a live session.
      this.consecutiveAuthRefusals = 0;
      // A confirmed live session settles whatever `pendingConnectionRefusal`
      // was recorded on this connection either way (ENG-206): if
      // it was genuine, the `disconnect` that followed it already consumed
      // and cleared it before this snapshot could ever arrive; if it's still
      // here, it was a stray handler-level refusal that never mattered.
      this.pendingConnectionRefusal = null;
      if (isFirstSnapshotSinceConnect) {
        this.handleSessionLive(socket);
      }
      this.onlineUserIds = new Set(online);
      this.notifyPresence();
    });
  }

  /**
   * Runs once per connection, the moment its FIRST `presence:snapshot`
   * confirms it authenticated (called from that handler above) - everything
   * `connect` itself used to do before now runs here instead (ENG-206), so a
   * handshake the gateway is about to refuse never runs it.
   */
  private handleSessionLive(
    socket: Socket<ServerListeners, ClientEmitters>,
  ): void {
    logInfo("realtime: session live");
    this.emit(true);
    // ENG-206: send every delivered ack that had to wait because
    // this connection wasn't confirmed live when its debounce timer fired
    // (see `scheduleDeliveredAck`) - safe to emit directly now, straight over
    // this confirmed, open, authenticated socket.
    if (this.pendingDeliveredAcks.size > 0) {
      for (const conversationId of this.pendingDeliveredAcks) {
        socket.emit("delivered", { conversationId });
      }
      this.pendingDeliveredAcks.clear();
    }
    // Also resets the shared manual-reconnect backoff (ENG-209) - a
    // confirmed live connection means whatever prior run of failures it was
    // counting is over, so the NEXT unrelated outage always starts its own
    // backoff fresh, at 1s.
    this.reconnectAttempt = 0;
    // A confirmed connection supersedes any manual reconnect that was still
    // pending (ENG-206/ENG-209) - nothing left to retry.
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // ENG-218: the disconnect that preceded this connection turned out to be
    // transient - cancel the grace timer so presence never clears for it.
    if (this.presenceClearTimer !== null) {
      window.clearTimeout(this.presenceClearTimer);
      this.presenceClearTimer = null;
    }
    // Conversation-room membership lives on the socket connection and is
    // dropped on every reconnect, so (re)join the open thread now that this
    // connection is confirmed authenticated - this is also where a join
    // requested earlier on this SAME connection actually gets issued:
    // `joinConversationRoom` deliberately holds off emitting until this exact
    // confirmation (see that method's own guard).
    if (this.activeConversationId) {
      this.joinConversationRoom(this.activeConversationId, socket);
      // The FIRST connection's initial page load already covers history;
      // every later one is a genuine RECONNECT, so backfill anything missed
      // during the gap: the socket redelivers nothing, so fetch messages
      // since the last known id and merge, deduped by id - the reliable way
      // to close the gap regardless of what the transport did or didn't
      // deliver.
      if (this.hasConnectedBefore) {
        void reconcileConversationHistory(this.qc, this.activeConversationId);
      }
    }
    // A reconnect gap can also carry new messages in OTHER conversations,
    // beyond the one open above - those never streamed a `message:new` frame
    // either (the socket buffered nothing while down), and
    // `reconcileConversationHistory` only ever refreshes the ACTIVE thread's
    // inbox row, and only when it actually merged something. Without this, a
    // laptop sleep or a phone losing signal leaves the inbox list (previews +
    // unread dots) and the nav DM badge stale until the member navigates away
    // and back or reloads. `GET /conversations` already returns each row's
    // own preview/unread straight from the DB, so a plain invalidate here is
    // sufficient - no per-thread message reconciliation needed for threads
    // that aren't open.
    if (this.hasConnectedBefore) {
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
      void this.qc.invalidateQueries({
        queryKey: ["conversations-unread-count"],
      });
    }
    this.hasConnectedBefore = true;
    // ENG-219 (frontend half): arm the first proactive session:reauth for
    // THIS connection. See `ASSUMED_ACCESS_TOKEN_TTL_MS`'s own doc for why
    // this first schedule is an assumption and every later one
    // (`msUntilNextProactiveReauth`) is authoritative instead.
    this.scheduleProactiveReauth(
      socket,
      ASSUMED_ACCESS_TOKEN_TTL_MS - PROACTIVE_REAUTH_MARGIN_MS,
    );
  }

  /** Schedule the next proactive `session:reauth` attempt for `socket`,
   *  replacing whatever attempt was already pending - at most one is ever
   *  in flight (mirrors `scheduleReconnect`'s own single-pending-timer
   *  shape). `isMintRetry` threads through to `performProactiveReauth`,
   *  see its own doc for why a mint failure is retried at most once. */
  private scheduleProactiveReauth(
    socket: Socket<ServerListeners, ClientEmitters>,
    delayMs: number,
    isMintRetry = false,
  ): void {
    if (this.reauthTimer !== null) {
      window.clearTimeout(this.reauthTimer);
    }
    this.reauthTimer = window.setTimeout(
      () => {
        this.reauthTimer = null;
        void this.performProactiveReauth(socket, isMintRetry);
      },
      Math.max(delayMs, 0),
    );
  }

  /** Whether `socket` is still this instance's live, connected, confirmed
   *  connection - the guard every step of a proactive reauth attempt
   *  re-checks (an `await` sits between most of them), mirroring the same
   *  three-part check `joinConversationRoom`'s own callback repeats. A late
   *  timer firing on an already-dead, already-replaced, or already-disposed
   *  connection must do nothing noisy: this is what makes that true. */
  private isReauthableConnection(
    socket: Socket<ServerListeners, ClientEmitters>,
  ): boolean {
    return (
      this.socket === socket &&
      socket.connected &&
      this.hasAuthenticatedSinceConnect &&
      !this.isTerminal
    );
  }

  /**
   * Mint a ticket and emit `session:reauth` over `socket`, proactively,
   * before the access token this socket is trusting is due to expire
   * (ENG-219, frontend half). Never throws; every failure mode either
   * retries on its own schedule or falls silently back to the existing
   * reactive `TOKEN_EXPIRED` path (`handleExceptionFrame`/`disconnect`),
   * which remains fully armed the whole time - this is an optimization over
   * that path, never a replacement for it.
   *
   * Handles the three failure modes this needs to survive without noise:
   * - The mint request itself failing (a network blip): retried once, after
   *   `SOCKET_TICKET_MINT_RETRY_DELAY_MS`, via `isMintRetry`. A second
   *   failure gives up silently for this round.
   * - The socket dropping, being replaced by a reconnect, or this client
   *   going terminal, at any point during the mint's own network round
   *   trip or while waiting on the ack: re-checked via
   *   `isReauthableConnection` both before minting and again before
   *   emitting, so a socket that died mid-mint never gets a stray emit
   *   attempted against it.
   * - The timer firing late (a backgrounded tab throttled it well past the
   *   real expiry): if the socket is already gone by then,
   *   `isReauthableConnection` is false and this returns immediately,
   *   doing nothing. If the socket is somehow still alive and connected
   *   (an unusually long-lived background tab), the mint/emit simply
   *   proceeds as normal - a late but still-useful extension.
   */
  private async performProactiveReauth(
    socket: Socket<ServerListeners, ClientEmitters>,
    isMintRetry: boolean,
  ): Promise<void> {
    if (!this.isReauthableConnection(socket)) return;

    let minted: SocketTicketMintResult;
    try {
      minted = await mintSocketTicket();
    } catch (error) {
      logWarn("realtime: socket-ticket mint failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      if (!isMintRetry) {
        this.scheduleProactiveReauth(
          socket,
          SOCKET_TICKET_MINT_RETRY_DELAY_MS,
          true,
        );
      }
      return;
    }

    if (!this.isReauthableConnection(socket)) return;

    socket
      .timeout(REAUTH_ACK_TIMEOUT_MS)
      .emit("session:reauth", { ticket: minted.ticket }, (error, ack) => {
        if (!this.isReauthableConnection(socket)) return;
        if (error) {
          logWarn("realtime: session:reauth ack timed out");
          return;
        }
        if (ack.ok) {
          this.scheduleProactiveReauth(
            socket,
            this.msUntilNextProactiveReauth(ack.exp),
          );
          return;
        }
        if (ack.code === "RATE_LIMITED") {
          this.scheduleProactiveReauth(
            socket,
            REAUTH_RATE_LIMITED_RETRY_DELAY_MS,
          );
          return;
        }
        // Every other refusal already dropped the socket server-side
        // (`ChatGateway.dropSocketForExpiredOrInvalidCredential`) and
        // arrives as a `TOKEN_EXPIRED` exception frame plus a disconnect,
        // which the existing exception/disconnect handling above already
        // recovers from - nothing further to do here.
        logWarn("realtime: session:reauth rejected", { code: ack.code });
      });
  }

  /** How long to wait before the NEXT proactive `session:reauth`, given the
   *  authoritative `exp` (seconds since epoch) the server just granted this
   *  connection. Unlike the very first schedule (`ASSUMED_ACCESS_TOKEN_TTL_MS`),
   *  this needs no assumption: `exp` came straight from the server that will
   *  also be the one enforcing it. */
  private msUntilNextProactiveReauth(expSeconds: number): number {
    const remainingMs = expSeconds * 1000 - Date.now();
    return Math.max(
      remainingMs - PROACTIVE_REAUTH_MARGIN_MS,
      PROACTIVE_REAUTH_MIN_DELAY_MS,
    );
  }

  /**
   * Track which conversation thread is open, LEAVE the previous room, and
   * JOIN the new one, so the gateway's `message:new` / `read` broadcasts -
   * scoped to the CONVERSATION room specifically - reach this socket for
   * exactly the thread the member has open (ENG-217).
   *
   * Safe to call before the socket connects, or before this connection has
   * confirmed authentication - the id is remembered here regardless, and the
   * join is (re)issued from the `presence:snapshot` handler once this
   * connection is confirmed live; there's nothing to leave in that case (no
   * room membership exists yet to drop). Once connected and authenticated,
   * the previous thread's room is always left explicitly with
   * `conversation:leave` (clearing to `null` counts as leaving too), the
   * moment either a new thread is chosen or the active thread clears.
   *
   * The left thread's cache is marked stale WITHOUT a refetch
   * (`refetchType: "none"`) - it stops streaming `message:updated` /
   * `reaction` / `message:deleted` the moment the room is left (those are
   * room-scoped, unlike `conversation:message`'s per-user fan-out), so a
   * later reopen always refetches to stay honest - though there's no reason
   * to pay for that refetch on the way OUT.
   */
  setActiveConversation(conversationId: string | null): void {
    if (conversationId === this.activeConversationId) return;
    const previousConversationId = this.activeConversationId;
    this.activeConversationId = conversationId;
    if (previousConversationId) {
      this.leaveConversationRoom(previousConversationId);
      void this.qc.invalidateQueries({
        ...threadQueryKey(previousConversationId),
        refetchType: "none",
      });
    }
    if (conversationId && this.socket?.connected) {
      this.joinConversationRoom(conversationId, this.socket);
    }
  }

  /**
   * Refresh the session cookie after a gateway auth rejection, then reconnect.
   * Called only from `handleAuthRefusal`, which already decided a refresh is
   * worth attempting (fewer than 2 consecutive refusals since the last
   * confirmed `presence:snapshot`).
   *
   * `refreshSession()` is already single-flighted in this tab and serialised
   * across tabs by a Web Lock, so several sockets (or several tabs) hitting
   * expiry at the same moment still spend the rotating refresh token once. The
   * cooldown on top of that stops a gateway that rejects for some OTHER reason
   * from turning into a refresh loop - `bypassCooldown` (ENG-206) opts a
   * TOKEN_EXPIRED refusal out of it, since that rotation runs on its own
   * fixed, expected, 15-minute schedule. When the cooldown DOES apply, a
   * fresh refresh is skipped entirely - going terminal here (ENG-206) stops
   * what would otherwise be an endless connect/refuse/disconnect/reconnect
   * loop with nothing ever actually retrying the refresh.
   */
  private async recoverFromAuthFailure(
    socket: Socket<ServerListeners, ClientEmitters>,
    bypassCooldown = false,
  ): Promise<void> {
    const now = Date.now();
    if (
      !bypassCooldown &&
      now - this.lastAuthRefreshAt < AUTH_REFRESH_COOLDOWN_MS
    ) {
      this.goTerminal(socket, "auth refusal inside the refresh cooldown");
      return;
    }
    this.lastAuthRefreshAt = now;
    // ENG-209: tell the `disconnect` handler a refresh is in flight, so a
    // server-forced disconnect that follows this refusal doesn't ALSO
    // schedule its own manual reconnect - this method already owns
    // reconnecting once the refresh settles, below.
    this.isAuthRefreshInFlight = true;
    try {
      // Hold the reconnect loop while the refresh is in flight so the next
      // attempt carries the new cookie instead of racing the dead one.
      socket.io.reconnection(false);
      const ok = await refreshSession();
      // `dispose()` (sign-out, last consumer unmounted) may have run
      // meanwhile, or this client went terminal while the refresh was in
      // flight - e.g. a SESSION_REVOKED `exception` landing mid-await
      // (ENG-206). Either way this socket is no longer this method's to
      // manage: don't re-enable reconnection under a decision made after
      // this refresh started.
      if (this.socket !== socket || this.isTerminal) return;
      if (!ok) {
        // The session is genuinely gone, or the backend is unreachable. Stay
        // disconnected rather than burning a JWT verify per second per idle
        // tab: the next HTTP request's own 401 drives `onAuthLost` and the
        // auth reconcile, and signing back in disposes this client and builds
        // a fresh one with reconnection back at its default.
        logWarn("realtime: auth refresh failed, staying disconnected");
        return;
      }
      socket.io.reconnection(true);
      socket.connect();
    } finally {
      this.isAuthRefreshInFlight = false;
    }
  }

  dispose(): void {
    // Cancel a `connect()` whose dynamic import hasn't resolved yet — see the
    // guard at the top of `connectAsync`.
    this.connecting = false;
    this.listeners.clear();
    this.activeConversationId = null;
    this.typingHandlers.clear();
    this.readHandlers.clear();
    this.deliveredHandlers.clear();
    this.presenceHandlers.clear();
    this.conversationMessageHandlers.clear();
    this.onlineUserIds.clear();
    for (const timer of this.deliveredAckTimers.values()) {
      window.clearTimeout(timer);
    }
    this.deliveredAckTimers.clear();
    this.countedInboxMessageIds.clear();
    this.joinAttemptTokens.clear();
    this.pendingConnectionRefusal = null;
    this.pendingDeliveredAcks.clear();
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.presenceClearTimer !== null) {
      window.clearTimeout(this.presenceClearTimer);
      this.presenceClearTimer = null;
    }
    if (this.reauthTimer !== null) {
      window.clearTimeout(this.reauthTimer);
      this.reauthTimer = null;
    }
    if (this.socket) {
      // ENG-206: null `this.socket` BEFORE calling `.disconnect()` - that
      // call fires the `disconnect` handler SYNCHRONOUSLY, and its own
      // `this.socket !== socket` bail-out is what makes it see this client as
      // already torn down, so it stops before re-arming a presence timer or
      // anything else on a disposed client.
      const socket = this.socket;
      this.socket = null;
      socket.disconnect();
    }
  }
}

interface RealtimeContextValue {
  /** True only once the socket has a CONFIRMED live session - specifically
   *  the first `presence:snapshot` after connecting (see `RealtimeClient`'s
   *  `connect` handler for why the transport coming up alone isn't enough).
   *  Always false in demo mode. */
  connected: boolean;
  /** Register demand for the socket; returns a release fn. See `useRealtime`. */
  request: () => () => void;
  /** Join (or, with null, clear) the conversation room to stream into. Inert
   *  until a socket exists; survives socket re-creation and reconnects. */
  joinConversation: (conversationId: string | null) => void;
  /** Subscribe to `typing` frames. Returns an unsubscribe. Survives socket
   *  re-creation (reconnects) — a no-op in demo/logged-out mode. */
  onTyping: (
    handler: (frame: ServerToClientEvents["typing"]) => void,
  ) => () => void;
  /** Subscribe to `read` frames (additive to the cache invalidation the
   *  provider already runs for `read`). Survives socket re-creation. */
  onRead: (
    handler: (frame: ServerToClientEvents["read"]) => void,
  ) => () => void;
  /** Subscribe to `message:delivered` frames (the "double check" watermark).
   *  Survives socket re-creation; no-op in demo/logged-out mode. */
  onDelivered: (
    handler: (frame: ServerToClientEvents["message:delivered"]) => void,
  ) => () => void;
  /** Subscribe to the live online-user-id set; primed immediately with the
   *  current snapshot. Survives socket re-creation. */
  onPresence: (handler: (online: ReadonlySet<string>) => void) => () => void;
  /** Emit a `typing` frame for `conversationId`. Safe no-op before connect / in
   *  demo mode (no socket). */
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  /** The conversation id most recently REQUESTED via `joinConversation`, read
   *  at CALL time as a snapshot (a caller that needs to react to it changing
   *  should track the id itself, e.g. from whatever state drove the
   *  `joinConversation` call in the first place). This reflects what was
   *  REQUESTED; whether the room is actually joined server-side yet is a
   *  separate question - the join can still be pending, refused, or the
   *  socket can be down. Returns `null` before any thread is requested / in
   *  demo mode. */
  getActiveConversationId: () => string | null;
  /** Subscribe to `conversation:message` frames (additive to the provider's
   *  own cache-patching of that event) - for a consumer that wants the raw
   *  frame itself, mirroring `onRead`/`onDelivered`. Survives socket
   *  re-creation; a no-op in demo/logged-out mode. */
  onConversationMessage: (
    handler: (frame: ServerToClientEvents["conversation:message"]) => void,
  ) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  request: () => () => {},
  joinConversation: () => {},
  onTyping: () => () => {},
  onRead: () => () => {},
  onDelivered: () => () => {},
  onPresence: () => () => {},
  emitTyping: () => {},
  getActiveConversationId: () => null,
  onConversationMessage: () => () => {},
});

/**
 * Mounts the realtime connection lifecycle. The socket is *demand-driven*: it
 * opens only when the member is signed in, a backend is configured, demo mode is
 * OFF, **and** at least one consumer has called `request()` (via `useRealtime`).
 * So demo/offline runs are completely inert (no socket, no network), and even in
 * live mode we don't hold a socket open on pages that don't need it — only the
 * messages view (and any future opt-in like the notifications bell) does.
 * Tears the socket down on sign-out, when demo mode flips on, or when the last
 * consumer releases its demand. Reconnection in between combines socket.io's
 * own transport-level retry with this file's manual reconnect scheduling for
 * a server-forced disconnect or a pre-auth refusal (see `RealtimeClient`'s
 * `scheduleReconnect`/`goTerminal`).
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { loggedIn, user } = useAuth();
  const { demoMode } = useDemoMode();
  // The signed-in user id, for the reaction-echo skip. Held in a ref so the
  // connect effect can seed a freshly-built client without taking `user` as a
  // dependency (which would needlessly rebuild the socket on any auth refresh);
  // a separate effect below pushes later changes onto the live client.
  const myUserId = user?.id ?? null;
  // The handle the `message:new` own-echo skip compares against: an
  // `AuthorSummary` has no id. Mirrors `useMessageSearch`'s `myHandle`.
  const myHandle = user?.profile.slug ?? null;
  const myUserIdRef = useRef(myUserId);
  const myHandleRef = useRef(myHandle);
  // Keep the ref pointing at the latest committed user id so the connect effect
  // below can seed a freshly-built client without taking `user` as a socket
  // dependency. Written in an effect (not during render — react-hooks/refs) and
  // declared BEFORE the connect effect so that on a login commit which flips
  // `active` and `myUserId` together, this runs first and the ref is already
  // current when the connect effect reads it.
  useEffect(() => {
    myUserIdRef.current = myUserId;
  }, [myUserId]);
  const [connected, setConnected] = useState(false);
  const [demand, setDemand] = useState(0);
  const clientRef = useRef<RealtimeClient | null>(null);
  // The thread a consumer wants joined, held here (not just on the client) so a
  // freshly-created client re-applies it — consumers may set it before the
  // socket exists, or it must survive a sign-out/back-in that rebuilds the client.
  const activeConversationRef = useRef<string | null>(null);
  // Per-event subscriber handlers, held on the provider (not just the client) so
  // they survive the client being torn down and re-created on every (re)connect
  // (see the connect effect below, which re-attaches every held handler to a
  // freshly-created client via `client.onTyping`/`onRead`/`onPresence`).
  const handlersRef = useRef<{
    typing: Set<(frame: ServerToClientEvents["typing"]) => void>;
    read: Set<(frame: ServerToClientEvents["read"]) => void>;
    delivered: Set<(frame: ServerToClientEvents["message:delivered"]) => void>;
    presence: Set<(online: ReadonlySet<string>) => void>;
    conversationMessage: Set<
      (frame: ServerToClientEvents["conversation:message"]) => void
    >;
  }>({
    typing: new Set(),
    read: new Set(),
    delivered: new Set(),
    presence: new Set(),
    conversationMessage: new Set(),
  });

  const active = loggedIn && !demoMode && apiAvailable && demand > 0;

  const request = useCallback(() => {
    setDemand((n) => n + 1);
    return () => setDemand((n) => Math.max(0, n - 1));
  }, []);

  const joinConversation = useCallback((conversationId: string | null) => {
    activeConversationRef.current = conversationId;
    clientRef.current?.setActiveConversation(conversationId);
  }, []);

  // Unsubscribe detaches from the CURRENT client (read at unsubscribe time), not
  // the one captured at subscribe time — a reconnect rebuilds the client and
  // re-attaches every handler in `handlersRef` to the new one, so a stale
  // captured unsubscribe would only remove the handler from the dead client and
  // leak it on the live one.
  const onTyping = useCallback(
    (handler: (frame: ServerToClientEvents["typing"]) => void) => {
      handlersRef.current.typing.add(handler);
      clientRef.current?.onTyping(handler);
      return () => {
        handlersRef.current.typing.delete(handler);
        clientRef.current?.offTyping(handler);
      };
    },
    [],
  );

  const onRead = useCallback(
    (handler: (frame: ServerToClientEvents["read"]) => void) => {
      handlersRef.current.read.add(handler);
      clientRef.current?.onRead(handler);
      return () => {
        handlersRef.current.read.delete(handler);
        clientRef.current?.offRead(handler);
      };
    },
    [],
  );

  const onDelivered = useCallback(
    (handler: (frame: ServerToClientEvents["message:delivered"]) => void) => {
      handlersRef.current.delivered.add(handler);
      clientRef.current?.onDelivered(handler);
      return () => {
        handlersRef.current.delivered.delete(handler);
        clientRef.current?.offDelivered(handler);
      };
    },
    [],
  );

  const onPresence = useCallback(
    (handler: (online: ReadonlySet<string>) => void) => {
      handlersRef.current.presence.add(handler);
      clientRef.current?.onPresence(handler);
      return () => {
        handlersRef.current.presence.delete(handler);
        clientRef.current?.offPresence(handler);
      };
    },
    [],
  );

  const emitTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      clientRef.current?.emitTyping(conversationId, isTyping);
    },
    [],
  );

  // Snapshot getter: reads `activeConversationRef.current` at CALL time,
  // mirroring how `joinConversation` writes it. A stable identity (no deps)
  // since it closes purely over the ref.
  const getActiveConversationId = useCallback(
    () => activeConversationRef.current,
    [],
  );

  const onConversationMessage = useCallback(
    (
      handler: (frame: ServerToClientEvents["conversation:message"]) => void,
    ) => {
      handlersRef.current.conversationMessage.add(handler);
      clientRef.current?.onConversationMessage(handler);
      return () => {
        handlersRef.current.conversationMessage.delete(handler);
        clientRef.current?.offConversationMessage(handler);
      };
    },
    [],
  );

  useEffect(() => {
    if (!active) return;
    const url = realtimeUrl();
    if (!url) return;
    const client = new RealtimeClient(
      url,
      queryClient,
      myUserIdRef.current,
      myHandleRef.current,
    );
    clientRef.current = client;
    // Re-apply the desired thread onto the new client: a consumer may have asked
    // to join before this client existed (demand bump and connect race across
    // renders), and it's cleared on the client but remembered here.
    client.setActiveConversation(activeConversationRef.current);
    const off = client.onStatus(setConnected);
    client.connect();
    // Re-attach every handler a consumer registered before (or across) this
    // client's lifetime — the previous client (if any) is gone, along with its
    // own handler sets, but the provider's `handlersRef` outlives it.
    handlersRef.current.typing.forEach((handler) => client.onTyping(handler));
    handlersRef.current.read.forEach((handler) => client.onRead(handler));
    handlersRef.current.delivered.forEach((handler) =>
      client.onDelivered(handler),
    );
    handlersRef.current.presence.forEach((handler) =>
      client.onPresence(handler),
    );
    handlersRef.current.conversationMessage.forEach((handler) =>
      client.onConversationMessage(handler),
    );
    return () => {
      off();
      client.dispose();
      clientRef.current = null;
      setConnected(false);
    };
  }, [active]);

  // Keep the live client's known user id in sync with auth (it outlives a token
  // refresh), so the reaction-echo skip always keys off the current member.
  useEffect(() => {
    myHandleRef.current = myHandle;
    clientRef.current?.setMyUserId(myUserId, myHandle);
  }, [myUserId, myHandle]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      connected,
      request,
      joinConversation,
      onTyping,
      onRead,
      onDelivered,
      onPresence,
      emitTyping,
      getActiveConversationId,
      onConversationMessage,
    }),
    [
      connected,
      request,
      joinConversation,
      onTyping,
      onRead,
      onDelivered,
      onPresence,
      emitTyping,
      getActiveConversationId,
      onConversationMessage,
    ],
  );

  // `value` is a memoized bundle of stable callbacks that close over refs but
  // only dereference them when INVOKED (inside event handlers / effects), never
  // during render — so handing it to the context Provider is not a during-render
  // ref read. This is a `.ts` module (no JSX), hence createElement rather than
  // <Provider value={value}>, which the rule would not have flagged.
  // eslint-disable-next-line react-hooks/refs -- see above: passing a memoized callback bundle to the context Provider, not reading ref.current during render.
  return createElement(RealtimeContext.Provider, { value }, children);
}

/** Read the live socket status (e.g. to show a "reconnecting" hint). */
export function useRealtime(): RealtimeContextValue {
  return useContext(RealtimeContext);
}

/**
 * Hold the realtime socket open for as long as the calling component is mounted.
 * Mount this on a view that needs live updates (e.g. the messages page); the
 * socket opens on mount and closes when the last such consumer unmounts. Inert
 * in demo/logged-out/no-backend runs — `request()` just bumps a counter that the
 * provider's connect guard ignores until the other conditions are met.
 */
export function useRealtimeConnection(): void {
  const { request } = useRealtime();
  useEffect(() => request(), [request]);
}

/**
 * Keep the realtime socket joined to `conversationId`'s room while mounted, so
 * the open thread receives the gateway's per-conversation frames (message:new /
 * read) live. Pass the currently-open conversation id, or `null` in demo mode /
 * when no thread is open. Switching threads explicitly LEAVES the old room
 * over the server (a `conversation:leave` emit, ENG-217) before joining the
 * new one; unmounting leaves it the same way. Inert until a socket exists and
 * this connection is confirmed authenticated. Only the JOIN re-issues itself
 * across reconnects - a reconnect already drops every room server-side, so
 * there's nothing left to explicitly leave - both handled by the
 * RealtimeClient.
 */
export function useJoinConversation(conversationId: string | null): void {
  const { joinConversation } = useRealtime();
  useEffect(() => {
    joinConversation(conversationId);
    return () => joinConversation(null);
  }, [conversationId, joinConversation]);
}

/**
 * Subscribe to `typing` frames for as long as the calling component is
 * mounted. A no-op in demo/logged-out/no-backend runs (no socket). `handler`
 * must be memoized by the caller (e.g. `useCallback`) — a new function
 * identity on every render resubscribes on every render.
 */
export function useTypingFrames(
  handler: (frame: ServerToClientEvents["typing"]) => void,
): void {
  const { onTyping } = useRealtime();
  useEffect(() => onTyping(handler), [onTyping, handler]);
}

/**
 * Subscribe to `read` frames for as long as the calling component is mounted.
 * Additive to the provider's own cache-invalidation handling of `read` — this
 * is for components that want the raw frame (e.g. to show a "seen" tick).
 * `handler` must be memoized by the caller (e.g. `useCallback`) — a new
 * function identity on every render resubscribes on every render.
 */
export function useReadFrames(
  handler: (frame: ServerToClientEvents["read"]) => void,
): void {
  const { onRead } = useRealtime();
  useEffect(() => onRead(handler), [onRead, handler]);
}

/**
 * Subscribe to `conversation:message` frames for as long as the calling
 * component is mounted. Additive to the provider's own cache-patching of
 * `conversation:message` (a message that landed in a conversation this
 * socket hasn't joined the room for, ENG-160) - this is for a consumer that
 * wants the raw frame itself. A no-op in demo/logged-out/no-backend runs (no
 * socket). `handler` must be memoized by the caller (e.g. `useCallback`) - a
 * new function identity on every render resubscribes on every render.
 */
export function useConversationMessageFrames(
  handler: (frame: ServerToClientEvents["conversation:message"]) => void,
): void {
  const { onConversationMessage } = useRealtime();
  useEffect(
    () => onConversationMessage(handler),
    [onConversationMessage, handler],
  );
}

/**
 * Subscribe to `message:delivered` frames for as long as the calling component
 * is mounted — the counterpart's "double check" watermark. A no-op in
 * demo/logged-out/no-backend runs (no socket). `handler` must be memoized by the
 * caller (e.g. `useCallback`) — a new function identity every render resubscribes.
 */
export function useDeliveredFrames(
  handler: (frame: ServerToClientEvents["message:delivered"]) => void,
): void {
  const { onDelivered } = useRealtime();
  useEffect(() => onDelivered(handler), [onDelivered, handler]);
}

/**
 * The live set of online user ids, kept in sync with `presence` /
 * `presence:snapshot` frames. Starts empty and is populated once a socket
 * exists (immediately primed with the current snapshot on subscribe) — always
 * empty in demo/logged-out/no-backend runs.
 */
export function usePresenceOnline(): ReadonlySet<string> {
  const { onPresence } = useRealtime();
  const [online, setOnline] = useState<ReadonlySet<string>>(new Set());
  useEffect(() => onPresence((next) => setOnline(new Set(next))), [onPresence]);
  return online;
}

/**
 * Whether ONE specific participant is currently online, kept in sync with
 * `presence` / `presence:snapshot` frames — a per-id selector over the same
 * feed `usePresenceOnline` exposes as a whole set.
 *
 * Every presence change still notifies this hook's subscription (the client
 * only tracks one online-user-id set, not a per-id feed), but the functional
 * `setState` update below returns the SAME `previous` boolean whenever this
 * particular id's membership hasn't changed, and React bails out of
 * re-rendering when a state update resolves to the same value (`Object.is`).
 * So a caller like a thread-list row or the open conversation's header only
 * re-renders when the id it actually cares about flips — not on every other
 * member's presence flip, unlike consuming `usePresenceOnline()`'s whole set
 * directly. Returns `false` for a `null`/`undefined` id (e.g. a just-picked
 * recipient placeholder with no resolved participant yet).
 */
export function useIsOnline(participantId: string | null | undefined): boolean {
  const { onPresence } = useRealtime();
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    if (!participantId) {
      // Resets to false when the caller's id goes away (e.g. a just-picked
      // recipient placeholder with no resolved participant yet) — not a
      // response to an external event, so there's nothing to subscribe to.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOnline(false);
      return;
    }
    return onPresence((online) => {
      setIsOnline((previous) => {
        const next = online.has(participantId);
        return next === previous ? previous : next;
      });
    });
  }, [participantId, onPresence]);
  return participantId ? isOnline : false;
}

/**
 * Returns a stable `emitTyping(conversationId, isTyping)` function that sends
 * a `typing` frame over the socket. Safe to call before connect / in demo mode
 * (no socket) — it's a no-op.
 */
export function useEmitTyping(): (
  conversationId: string,
  isTyping: boolean,
) => void {
  const { emitTyping } = useRealtime();
  return emitTyping;
}
