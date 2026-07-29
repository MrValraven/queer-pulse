import { createContext, useContext, useEffect } from "react";
import { useAcceptedConnections } from "../../features/connect/api/useAcceptedConnections";

export interface ConnectionsState {
  /** Member slugs you're connected to (accepted). */
  connected: string[];
  /** Member slugs who've asked to connect with you. */
  incoming: string[];
  /** Member slugs you've sent a request to (awaiting reply). */
  sent: string[];
}

export interface ConnectionsContextValue extends ConnectionsState {
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

/** Internal: the context value plus the hydration setter. Most callers consume
 *  only ConnectionsContextValue; useConnectionsHydrated needs setConnected. */
export interface ConnectionsStore extends ConnectionsContextValue {
  setConnected: (slugs: string[]) => void;
}

export const ConnectionsContext = createContext<ConnectionsStore | null>(null);

export function useConnections() {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) {
    throw new Error("useConnections must be used within ConnectionsProvider");
  }
  return ctx;
}

/**
 * The connections store hydrated from the server's accepted-connection slugs.
 * Subscribe here wherever you need a reliable `isConnected(slug)` in live mode
 * (every member-contact button). `useConnections()` alone is demo-only truth:
 * in live it starts empty. Hydration replaces `connected` wholesale — the server
 * is authoritative; `undefined` (demo / logged-out / in-flight / failed) leaves
 * the seeded/empty list alone. Safe from several subscribers at once: react-query
 * hands them all the same `data` reference, so the effect only re-runs on a new
 * fetch result.
 */
export function useConnectionsHydrated(): ConnectionsContextValue {
  const store = useConnections();
  const { setConnected } = store;
  const { data: serverConnected } = useAcceptedConnections();

  useEffect(() => {
    if (!serverConnected) return;
    setConnected(serverConnected);
  }, [serverConnected, setConnected]);

  return store;
}
