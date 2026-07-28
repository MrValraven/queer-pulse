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
  private presenceHandlers = new Set<(online: ReadonlySet<string>) => void>();
  /** The current set of online user ids, maintained from `presence` (single
   *  add/remove) and `presence:snapshot` (full replace) frames. */
  private onlineUserIds = new Set<string>();

  constructor(url: string, qc: QueryClient) {
    this.url = url;
    this.qc = qc;
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
      }
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

    // Cache patching. Invalidation (rather than hand-merging into cursor pages)
    // keeps HTTP authoritative and avoids drift.
    socket.on("message:new", ({ conversationId }) => {
      void this.qc.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
    });
    socket.on("read", () => {
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
    });
    socket.on("notification:new", () => {
      void this.qc.invalidateQueries({ queryKey: ["notifications"] });
    });
    socket.on("reaction", ({ conversationId }) => {
      void this.qc.invalidateQueries({ queryKey: ["messages", conversationId] });
    });
    socket.on("message:deleted", ({ conversationId }) => {
      void this.qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      void this.qc.invalidateQueries({ queryKey: ["conversations"] });
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
    this.presenceHandlers.clear();
    this.onlineUserIds.clear();
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
  const { loggedIn } = useAuth();
  const { demoMode } = useDemoMode();
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
    presence: Set<(online: ReadonlySet<string>) => void>;
  }>({
    typing: new Set(),
    read: new Set(),
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
    const client = new RealtimeClient(url, queryClient);
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
    handlersRef.current.presence.forEach((handler) => client.onPresence(handler));
    return () => {
      off();
      client.dispose();
      clientRef.current = null;
      setConnected(false);
    };
  }, [active]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ connected, request, joinConversation, onTyping, onRead, onPresence, emitTyping }),
    [connected, request, joinConversation, onTyping, onRead, onPresence, emitTyping],
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
