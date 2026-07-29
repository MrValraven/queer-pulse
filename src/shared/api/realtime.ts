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
import { io, type Socket } from "socket.io-client";
import { queryClient } from "./queryClient";
import {
  patchMessagePinned,
  patchMessageReactionCounts,
  reconcileConversationHistory,
  upsertMessage,
} from "./messageCache";
import { API_BASE_URL, apiAvailable } from "./config";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logInfo, logWarn } from "../observability/logger";
import type {
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
// Reconnection is socket.io's job (Engine.IO backoff + heartbeat). There is
// deliberately no hand-rolled retry/ping here.

/** How long to coalesce inbound messages before emitting a single delivered ack
 *  for a conversation. The ack is a "received up to now" watermark, so a burst
 *  collapses to one cheap frame instead of one per message. */
const DELIVERED_ACK_DEBOUNCE_MS = 500;

/** socket.io wants event maps as listener signatures; ours are payload types. */
type ServerListeners = {
  [K in keyof ServerToClientEvents]: (data: ServerToClientEvents[K]) => void;
};

/** Same shape for the frames we emit, so `socket.emit(...)` is type-checked. */
type ClientEmitters = {
  [K in keyof ClientToServerEvents]: (data: ClientToServerEvents[K]) => void;
};

/** The namespace URL. socket.io reads the path as the namespace, the rest as origin. */
function realtimeUrl(): string | null {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}/chat`;
}

/**
 * Opens one socket to `/chat` and funnels every frame through cache
 * invalidation, so the socket never has to know a page's component tree — only
 * its query keys. `dispose()` closes it for good.
 */
class RealtimeClient {
  private socket: Socket<ServerListeners, ClientEmitters> | null = null;
  private listeners = new Set<(connected: boolean) => void>();
  private url: string;
  private qc: QueryClient;
  /** The open thread whose room we want joined. Remembered across (re)connects. */
  private activeConversationId: string | null = null;
  /** Per-event fan-out sets, additive alongside the cache-invalidation handlers
   *  registered directly in `connect()` below. */
  private typingHandlers = new Set<(frame: ServerToClientEvents["typing"]) => void>();
  private readHandlers = new Set<(frame: ServerToClientEvents["read"]) => void>();
  private deliveredHandlers = new Set<
    (frame: ServerToClientEvents["message:delivered"]) => void
  >();
  private presenceHandlers = new Set<(online: ReadonlySet<string>) => void>();
  /** Per-conversation debounce timers for the outbound delivered ack — an
   *  inbound burst coalesces into one "received up to now" frame. */
  private deliveredAckTimers = new Map<string, number>();
  /** The current set of online user ids, maintained from `presence` (single
   *  add/remove) and `presence:snapshot` (full replace) frames. */
  private onlineUserIds = new Set<string>();
  /** False until the first successful `connect`. A later `connect` is therefore
   *  a genuine RECONNECT — the socket buffered nothing while it was down, so we
   *  reconcile the open thread's history since its last known message. */
  private hasConnectedBefore = false;
  /** The signed-in member's user id, used to skip the echo of our OWN reaction
   *  (already patched optimistically by the mutation) so the frame's absolute
   *  counts never double-apply on top of that local delta. */
  private myUserId: string | null;

  constructor(url: string, qc: QueryClient, myUserId: string | null) {
    this.url = url;
    this.qc = qc;
    this.myUserId = myUserId;
  }

  /** Update the known user id after (re)auth — the client outlives an auth
   *  refresh, and the reaction-echo skip must key off the current member. */
  setMyUserId(myUserId: string | null): void {
    this.myUserId = myUserId;
  }

  onStatus(cb: (connected: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(connected: boolean): void {
    for (const cb of this.listeners) cb(connected);
  }

  onTyping(handler: (frame: ServerToClientEvents["typing"]) => void): () => void {
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
  /** Coalesce a delivered ack for `conversationId`: schedule one "received up to
   *  now" frame and let a burst of inbound messages fold into it. Cheap no-op if
   *  an ack is already pending or the socket is down. */
  private scheduleDeliveredAck(conversationId: string): void {
    if (this.deliveredAckTimers.has(conversationId)) return;
    const timer = window.setTimeout(() => {
      this.deliveredAckTimers.delete(conversationId);
      this.socket?.emit("delivered", { conversationId });
    }, DELIVERED_ACK_DEBOUNCE_MS);
    this.deliveredAckTimers.set(conversationId, timer);
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
  emitTyping(conversationId: string, isTyping: boolean): void {
    this.socket?.emit("typing", { conversationId, isTyping });
  }

  connect(): void {
    if (this.socket) return;
    const socket: Socket<ServerListeners, ClientEmitters> = io(this.url, {
      withCredentials: true,
      transports: ["websocket"],
    });
    this.socket = socket;

    socket.on("connect", () => {
      this.emit(true);
      logInfo("realtime: connected");
      // Conversation-room membership lives on the socket connection and is
      // dropped on every reconnect, so (re)join the open thread each time we
      // connect. This is what makes the gateway's per-conversation broadcasts
      // (message:new / read / typing) reach us — without it, new DMs only
      // appear on a manual refresh.
      if (this.activeConversationId) {
        socket.emit("conversation:join", {
          conversationId: this.activeConversationId,
        });
        // On a RECONNECT (not the first connect, whose initial page load already
        // covers history), backfill anything missed during the gap: the socket
        // redelivers nothing, so fetch messages since the last known id and merge
        // (dedup by id) rather than trusting the transport or refetching page 1.
        if (this.hasConnectedBefore) {
          void reconcileConversationHistory(this.qc, this.activeConversationId);
        }
      }
      this.hasConnectedBefore = true;
    });
    socket.on("disconnect", (reason) => {
      this.emit(false);
      logInfo("realtime: disconnected", { reason });
    });
    socket.on("connect_error", (err: Error) => {
      this.emit(false);
      logWarn("realtime: connect error", { err: err.message });
    });

    // Gateway auth/validation failures (incl. access-token expiry, which drops
    // the socket so it reconnects with a freshly-refreshed cookie).
    socket.on("exception", (data) => {
      logWarn("realtime: gateway exception", { message: String(data.message) });
      // Platform lockdown: the server will refuse every handshake until an admin
      // lifts it, and each refusal costs a JWT verify + a user lookup that no
      // rate limiter covers (the gateway's buckets key on a user id that only
      // exists after a SUCCESSFUL handshake; the HTTP throttler skips WS). Left
      // to its default cadence, every signed-in member would retry ~once a
      // second for the whole lockdown. Stop reconnecting. Recovery needs no
      // reload: once the maintenance screen renders, the messages page
      // unmounts, `demand` drops to 0 and the effect cleanup disposes this
      // RealtimeClient — so the next connect() builds a brand-new io() Manager
      // with reconnection back at its default.
      //
      // Known gap: a member idling on /messages makes no HTTP request, so
      // nothing 503s and nothing trips the lock. They see a dead socket rather
      // than the maintenance screen until they navigate or otherwise act.
      if (data.code === "PLATFORM_LOCKED") {
        socket.io.reconnection(false);
      }
    });

    // Cache patching. An inbound message carries the full MessageResponse, so we
    // patch it straight into the thread cache (upsert, deduped by id AND by the
    // sender's clientMessageId — which reconciles our own optimistic bubble)
    // instead of refetching the whole page. The reaction / updated / deleted
    // frames below only carry ids, so those still invalidate (see each note).
    socket.on("message:new", ({ conversationId, message }) => {
      upsertMessage(this.qc, conversationId, message);
      // Inbox previews + unread badges live in a small, separate list; refresh
      // them (the thread itself is already patched above).
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
      // We received it → ack delivery so the SENDER's tick advances to a double
      // check. Only the joined (open) thread streams `message:new`, so this only
      // fires for a conversation the member is present in — exactly when
      // "delivered" is true. Throttled; acking the echo of our own send is a
      // harmless self-watermark advance (never rendered against our own bubbles).
      this.scheduleDeliveredAck(conversationId);
    });
    socket.on("read", () => {
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
    });
    socket.on("notification:new", () => {
      void this.qc.invalidateQueries({ queryKey: ["notifications"] });
    });
    // A new conversation (a group) the member was just added to — their inbox
    // doesn't know about it yet, so refetch the list. The member isn't in the
    // conversation room, so this user-room frame is how the group first appears.
    socket.on("conversation:new", () => {
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
    });
    // A reaction changed on a message in this room. The frame carries the
    // authoritative per-key counts, so patch them in place (deduped by message
    // id) instead of refetching the whole thread — a full invalidate here would
    // flicker the list and churn the scroll anchor for every reaction (the very
    // thing messageCache.ts avoids elsewhere). Skip the echo of our OWN reaction:
    // its optimistic patch already applied, and re-applying absolute counts we
    // already reflect is redundant (and would fight a mid-flight local delta).
    socket.on("reaction", ({ conversationId, messageId, userId, reactions }) => {
      if (this.myUserId && userId === this.myUserId) return;
      patchMessageReactionCounts(this.qc, conversationId, messageId, reactions);
    });
    socket.on("message:deleted", ({ conversationId }) => {
      void this.qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
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
    socket.on("message:updated", ({ conversationId }) => {
      void this.qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
    });

    // Per-event fan-out to component subscribers (additive — the invalidation
    // handlers above still run for every frame).
    socket.on("typing", (frame) => {
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
      this.onlineUserIds = new Set(online);
      this.notifyPresence();
    });
  }

  /**
   * Track which conversation thread is open and join its room, so the gateway's
   * `message:new` / `read` broadcasts (which target the conversation room, not
   * the per-user room) reach this socket. Safe to call before the socket
   * connects — the id is remembered and the join is (re)issued from the
   * `connect` handler above. There is no server `conversation:leave`; a
   * superseded room simply stops being the active thread, and the stray
   * `conversations` invalidations its events still trigger are cheap (and keep
   * the inbox previews/unread fresh anyway).
   */
  setActiveConversation(conversationId: string | null): void {
    if (conversationId === this.activeConversationId) return;
    this.activeConversationId = conversationId;
    if (conversationId && this.socket?.connected) {
      this.socket.emit("conversation:join", { conversationId });
    }
  }

  dispose(): void {
    this.listeners.clear();
    this.activeConversationId = null;
    this.typingHandlers.clear();
    this.readHandlers.clear();
    this.deliveredHandlers.clear();
    this.presenceHandlers.clear();
    this.onlineUserIds.clear();
    for (const timer of this.deliveredAckTimers.values()) {
      window.clearTimeout(timer);
    }
    this.deliveredAckTimers.clear();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

interface RealtimeContextValue {
  /** True while a socket is open. Always false in demo mode. */
  connected: boolean;
  /** Register demand for the socket; returns a release fn. See `useRealtime`. */
  request: () => () => void;
  /** Join (or, with null, clear) the conversation room to stream into. Inert
   *  until a socket exists; survives socket re-creation and reconnects. */
  joinConversation: (conversationId: string | null) => void;
  /** Subscribe to `typing` frames. Returns an unsubscribe. Survives socket
   *  re-creation (reconnects) — a no-op in demo/logged-out mode. */
  onTyping: (handler: (frame: ServerToClientEvents["typing"]) => void) => () => void;
  /** Subscribe to `read` frames (additive to the cache invalidation the
   *  provider already runs for `read`). Survives socket re-creation. */
  onRead: (handler: (frame: ServerToClientEvents["read"]) => void) => () => void;
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
});

/**
 * Mounts the realtime connection lifecycle. The socket is *demand-driven*: it
 * opens only when the member is signed in, a backend is configured, demo mode is
 * OFF, **and** at least one consumer has called `request()` (via `useRealtime`).
 * So demo/offline runs are completely inert (no socket, no network), and even in
 * live mode we don't hold a socket open on pages that don't need it — only the
 * messages view (and any future opt-in like the notifications bell) does.
 * Tears the socket down on sign-out, when demo mode flips on, or when the last
 * consumer releases its demand. Reconnection in between is socket.io's.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { loggedIn, user } = useAuth();
  const { demoMode } = useDemoMode();
  // The signed-in user id, for the reaction-echo skip. Held in a ref so the
  // connect effect can seed a freshly-built client without taking `user` as a
  // dependency (which would needlessly rebuild the socket on any auth refresh);
  // a separate effect below pushes later changes onto the live client.
  const myUserId = user?.id ?? null;
  const myUserIdRef = useRef(myUserId);
  myUserIdRef.current = myUserId;
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
    delivered: Set<
      (frame: ServerToClientEvents["message:delivered"]) => void
    >;
    presence: Set<(online: ReadonlySet<string>) => void>;
  }>({
    typing: new Set(),
    read: new Set(),
    delivered: new Set(),
    presence: new Set(),
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

  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    clientRef.current?.emitTyping(conversationId, isTyping);
  }, []);

  useEffect(() => {
    if (!active) return;
    const url = realtimeUrl();
    if (!url) return;
    const client = new RealtimeClient(url, queryClient, myUserIdRef.current);
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
    handlersRef.current.presence.forEach((handler) => client.onPresence(handler));
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
    clientRef.current?.setMyUserId(myUserId);
  }, [myUserId]);

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
    ],
  );

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
 * when no thread is open. Switching threads leaves the old room implicitly and
 * joins the new one; unmounting clears it. Inert until a socket exists and
 * re-joins itself across reconnects — both handled by the RealtimeClient.
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
 * Returns a stable `emitTyping(conversationId, isTyping)` function that sends
 * a `typing` frame over the socket. Safe to call before connect / in demo mode
 * (no socket) — it's a no-op.
 */
export function useEmitTyping(): (conversationId: string, isTyping: boolean) => void {
  const { emitTyping } = useRealtime();
  return emitTyping;
}
