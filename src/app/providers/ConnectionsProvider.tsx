import {
  useCallback,
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
import {
  ConnectionsContext,
  type ConnectionsState,
  type ConnectionsStore,
} from "./useConnections";

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
    const parsed: unknown = JSON.parse(raw);
    const record =
      typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
    const asSlugList = (value: unknown): string[] | null =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : null;
    return {
      connected: asSlugList(record.connected) ?? seed.connected,
      incoming: asSlugList(record.incoming) ?? seed.incoming,
      sent: asSlugList(record.sent) ?? seed.sent,
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

  const setConnected = useCallback((slugs: string[]) => {
    setState((prev) => ({ ...prev, connected: slugs }));
  }, []);

  const value = useMemo<ConnectionsStore>(
    () => ({
      ...state,
      isConnected: (slug) => state.connected.includes(slug),
      isPending: (slug) => state.sent.includes(slug),
      isIncoming: (slug) => state.incoming.includes(slug),
      accept,
      decline,
      withdraw,
      sendRequest,
      setConnected,
    }),
    [state, accept, decline, withdraw, sendRequest, setConnected],
  );

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
}
