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
import { queryClient } from "./queryClient";
import { API_BASE_URL, apiAvailable } from "./config";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logInfo, logWarn } from "../observability/logger";
import type { ServerToClientEvents } from "../contracts/realtime";

// ── The realtime layer ──────────────────────────────────────────────────────
// A thin, dependency-free WebSocket wrapper honouring src/shared/contracts/
// realtime.ts. HTTP stays the source of truth; sockets are an enhancement that
// keep the React Query cache warm (messages, conversations, notifications, feed)
// so a second browser session sees new DMs/threads live.
//
// Contract note: `ServerToClientEvents` covers message.created / message.read /
// notification.new. We additionally tolerate an out-of-band `connection.severed`
// frame (spec 03 block/DM-severance) without editing the shared contract file —
// it simply refreshes the conversations list so a severed thread drops out.

/** Extra frames we tolerate beyond the typed contract (spec-03 severance). */
interface SeveranceEvent {
  "connection.severed": { conversationId?: string; userId?: string };
}
type RealtimeEvents = ServerToClientEvents & SeveranceEvent;
type RealtimeFrame = {
  [K in keyof RealtimeEvents]: { event: K; data: RealtimeEvents[K] };
}[keyof RealtimeEvents];

/** Derive the ws(s):// origin from the configured http(s) API base. */
function realtimeUrl(): string | null {
  if (!API_BASE_URL) return null;
  const wsBase = API_BASE_URL.replace(/^http/i, "ws");
  return `${wsBase}/realtime`;
}

const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1_000;

/**
 * Reconnecting WebSocket client. `connect()` is idempotent; `dispose()` stops
 * reconnection. All cache mutation is funnelled through `apply()` so the socket
 * never has to know a page's component tree — only its query keys.
 */
class RealtimeClient {
  private socket: WebSocket | null = null;
  private disposed = false;
  private attempts = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
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
    if (this.disposed || this.socket) return;
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch (err) {
      logWarn("realtime: socket construction failed", { err: String(err) });
      this.scheduleReconnect();
      return;
    }
    this.socket = ws;

    ws.onopen = () => {
      this.attempts = 0;
      this.emit(true);
      logInfo("realtime: connected");
    };
    ws.onmessage = (ev) => this.handle(ev.data);
    ws.onclose = () => {
      this.socket = null;
      this.emit(false);
      this.scheduleReconnect();
    };
    ws.onerror = () => {
      // The close handler drives reconnection; just close the broken socket.
      ws.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.disposed || this.timer) return;
    const delay = Math.min(
      BASE_BACKOFF_MS * 2 ** this.attempts,
      MAX_BACKOFF_MS,
    );
    this.attempts += 1;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.connect();
    }, delay);
  }

  private handle(raw: unknown): void {
    if (typeof raw !== "string") return;
    let frame: RealtimeFrame;
    try {
      frame = JSON.parse(raw) as RealtimeFrame;
    } catch {
      return; // ignore malformed frames
    }
    if (!frame || typeof frame.event !== "string") return;
    this.apply(frame);
  }

  /** Patch the React Query cache for a decoded frame. Invalidation (rather than
   *  hand-merging into cursor pages) keeps HTTP authoritative and avoids drift. */
  private apply(frame: RealtimeFrame): void {
    switch (frame.event) {
      case "message.created": {
        const { conversationId } = frame.data;
        void this.qc.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
        void this.qc.invalidateQueries({ queryKey: ["conversations"] });
        break;
      }
      case "message.read": {
        void this.qc.invalidateQueries({ queryKey: ["conversations"] });
        break;
      }
      case "notification.new": {
        void this.qc.invalidateQueries({ queryKey: ["notifications"] });
        break;
      }
      case "connection.severed": {
        void this.qc.invalidateQueries({ queryKey: ["conversations"] });
        break;
      }
      default:
        break;
    }
  }

  dispose(): void {
    this.disposed = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.listeners.clear();
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
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
 * Reconnects with backoff; tears the socket down on sign-out, when demo mode
 * flips on, or when the last consumer releases its demand.
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
