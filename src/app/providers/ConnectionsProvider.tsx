import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_CONNECTED,
  SEED_INCOMING,
  SEED_SENT,
} from "../../features/connect/connections.data";
import { useDemoMode } from "./DemoModeProvider";

interface ConnectionsState {
  /** Member slugs you're connected to (accepted). */
  connected: string[];
  /** Member slugs who've asked to connect with you. */
  incoming: string[];
  /** Member slugs you've sent a request to (awaiting reply). */
  sent: string[];
}

interface ConnectionsContextValue extends ConnectionsState {
  isConnected: (slug: string) => boolean;
  isPending: (slug: string) => boolean;
  isIncoming: (slug: string) => boolean;
  /** Accept an incoming request: moves the slug from `incoming` to `connected`. */
  accept: (slug: string) => void;
  /** Politely decline: drops the slug from `incoming`. */
  decline: (slug: string) => void;
  /** Withdraw a sent request: drops the slug from `sent`. */
  withdraw: (slug: string) => void;
  /** Send a connection request. No-op if already connected or already sent. */
  sendRequest: (slug: string) => void;
}

const ConnectionsContext = createContext<ConnectionsContextValue | null>(null);
const STORAGE_KEY = "qp.connections.v1";

function seedState(): ConnectionsState {
  return {
    connected: [...SEED_CONNECTED],
    incoming: [...SEED_INCOMING],
    sent: [...SEED_SENT],
  };
}

/** An empty relationship set — the live-mode starting point (server is authoritative). */
function emptyState(): ConnectionsState {
  return { connected: [], incoming: [], sent: [] };
}

function readInitial(): ConnectionsState {
  const seed = seedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    return {
      connected: Array.isArray(parsed?.connected)
        ? parsed.connected
        : seed.connected,
      incoming: Array.isArray(parsed?.incoming)
        ? parsed.incoming
        : seed.incoming,
      sent: Array.isArray(parsed?.sent) ? parsed.sent : seed.sent,
    };
  } catch {
    return seed;
  }
}

/**
 * App-wide store of the current user's connection relationships, keyed by real
 * member slug — who they're connected to, who's asked to connect, and who they've
 * sent a request to. Persists to localStorage so accepting, declining, withdrawing
 * and reaching out all stick across reloads and surface anywhere that reads it
 * (the connections page, the Connect modal). Blocked and vouched relationships
 * live in SocialProvider / VouchProvider; this provider deliberately doesn't
 * duplicate them.
 *
 * In DEMO mode this is the source of truth: it seeds from mock data, persists to
 * localStorage, and tracks which mock slugs the user has acted on. In LIVE mode
 * the server is authoritative — the provider starts empty and is only a thin
 * optimistic layer that `useConnectionActions` nudges before it invalidates the
 * `["connections"]` query (whose refetched server list is the truth). localStorage
 * is not read or written in live mode, so it can never shadow the server.
 */
export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const [state, setState] = useState<ConnectionsState>(() =>
    demoMode ? readInitial() : emptyState(),
  );

  // Persist only in demo mode. In live mode the server owns the list, so writing
  // it here would let a stale localStorage snapshot shadow the real data.
  useEffect(() => {
    if (!demoMode) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [demoMode, state]);

  // Reset when the mode flips at runtime (the "Populate platform" toggle):
  // re-seed from mock when entering demo, clear to empty when going live. Done
  // with React's "adjust state during render" pattern (comparing the previous
  // mode) rather than an effect, so there's no cascading-render round-trip.
  const [prevDemo, setPrevDemo] = useState(demoMode);
  if (prevDemo !== demoMode) {
    setPrevDemo(demoMode);
    setState(demoMode ? readInitial() : emptyState());
  }

  const accept = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      incoming: prev.incoming.filter((s) => s !== slug),
      connected: prev.connected.includes(slug)
        ? prev.connected
        : [slug, ...prev.connected],
    }));
  }, []);

  const decline = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      incoming: prev.incoming.filter((s) => s !== slug),
    }));
  }, []);

  const withdraw = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      sent: prev.sent.filter((s) => s !== slug),
    }));
  }, []);

  const sendRequest = useCallback((slug: string) => {
    setState((prev) => {
      if (prev.connected.includes(slug) || prev.sent.includes(slug))
        return prev;
      return { ...prev, sent: [slug, ...prev.sent] };
    });
  }, []);

  const value = useMemo<ConnectionsContextValue>(
    () => ({
      ...state,
      isConnected: (slug) => state.connected.includes(slug),
      isPending: (slug) => state.sent.includes(slug),
      isIncoming: (slug) => state.incoming.includes(slug),
      accept,
      decline,
      withdraw,
      sendRequest,
    }),
    [state, accept, decline, withdraw, sendRequest],
  );

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) {
    throw new Error("useConnections must be used within ConnectionsProvider");
  }
  return ctx;
}
