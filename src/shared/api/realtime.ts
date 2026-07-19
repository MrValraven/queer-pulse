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
import type { ServerToClientEvents } from "../contracts/realtime";

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
  private socket: Socket<ServerListeners> | null = null;
  private listeners = new Set<(connected: boolean) => void>();
  private url: string;
  private qc: QueryClient;

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

  connect(): void {
    if (this.socket) return;
    const socket: Socket<ServerListeners> = io(this.url, {
      withCredentials: true,
      transports: ["websocket"],
    });
    this.socket = socket;

    socket.on("connect", () => {
      this.emit(true);
      logInfo("realtime: connected");
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
  }

  dispose(): void {
    this.listeners.clear();
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
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  request: () => () => {},
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

  const active = loggedIn && !demoMode && apiAvailable && demand > 0;

  const request = useCallback(() => {
    setDemand((n) => n + 1);
    return () => setDemand((n) => Math.max(0, n - 1));
  }, []);

  useEffect(() => {
    if (!active) return;
    const url = realtimeUrl();
    if (!url) return;
    const client = new RealtimeClient(url, queryClient);
    clientRef.current = client;
    const off = client.onStatus(setConnected);
    client.connect();
    return () => {
      off();
      client.dispose();
      clientRef.current = null;
      setConnected(false);
    };
  }, [active]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ connected, request }),
    [connected, request],
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
