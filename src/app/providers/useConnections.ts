import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useConnectionRelationships } from "../../features/connect/api/useConnectionRelationships";

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
  /** Restore a previously-captured snapshot (rollback after a failed action). */
  restore: (state: ConnectionsState) => void;
}

/** Internal: the context value plus the hydration setters. Most callers consume
 *  only ConnectionsContextValue; useConnectionsHydrated needs these two. */
export interface ConnectionsStore extends ConnectionsContextValue {
  setConnected: (slugs: string[]) => void;
  /** Replace all three lists with the server's answer (live hydration). */
  setRelationships: (state: ConnectionsState) => void;
}

/**
 * The hydrated store, plus the one thing a slug list cannot carry: which
 * connection an incoming request is, so a profile can accept or decline it
 * without first loading the connections page.
 */
export interface HydratedConnections extends ConnectionsContextValue {
  /**
   * The connection id of the request `slug` sent you, or `undefined` when there
   * is none (and always in demo mode, which has no server ids and whose
   * accept/decline never reach the network).
   */
  incomingConnectionId: (slug: string) => string | undefined;
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
 * The connections store hydrated from the server's relationship lists.
 * Subscribe here wherever you need reliable relationship truth in live mode
 * (every member-contact button, the profile hero). `useConnections()` alone is
 * demo-only truth: in live it starts empty.
 *
 * Hydration replaces all three lists wholesale (PRD-03): the server is
 * authoritative, and `undefined` (demo / logged-out / in-flight / failed) leaves
 * the seeded/empty lists alone. Before this only `connected` was hydrated, so
 * `incoming` was permanently empty in live mode: a member with a request
 * waiting from somebody was shown "Say hello" on that person's profile, and
 * sending it was refused with a 409 the modal then rendered as "you have
 * already reached out", which is the opposite of what had happened.
 *
 * Safe from several subscribers at once: react-query hands them all the same
 * `data` reference, so the effect only re-runs on a new fetch result.
 */
export function useConnectionsHydrated(): HydratedConnections {
  const store = useConnections();
  const { setRelationships } = store;
  const { data: relationships } = useConnectionRelationships();

  useEffect(() => {
    // Every list is checked before it is trusted. A 200 carrying an unexpected
    // body (a proxy, an older deploy) leaves the store exactly as it was rather
    // than throwing inside an effect and taking the page down with it.
    if (
      !relationships ||
      !Array.isArray(relationships.connected) ||
      !Array.isArray(relationships.incoming) ||
      !Array.isArray(relationships.sent)
    ) {
      return;
    }
    setRelationships({
      connected: relationships.connected,
      incoming: relationships.incoming.map((request) => request.slug),
      sent: relationships.sent,
    });
  }, [relationships, setRelationships]);

  const incomingConnectionId = useCallback(
    (slug: string) =>
      relationships?.incoming.find((request) => request.slug === slug)
        ?.connectionId,
    [relationships],
  );

  return useMemo(
    () => ({ ...store, incomingConnectionId }),
    [store, incomingConnectionId],
  );
}
