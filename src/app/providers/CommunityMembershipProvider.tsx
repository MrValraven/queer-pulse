import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CommunityRole,
  Membership,
} from "../../features/communities/membership.types";
import { useDemoMode } from "./DemoModeProvider";

interface CommunityMembershipContextValue {
  /** The current user's membership in each community, keyed by slug. */
  memberships: Record<string, Membership>;
  /** Slugs the user has requested to join (request-tier), awaiting approval. */
  pendingRequests: string[];
  isMember: (slug: string) => boolean;
  hasRequested: (slug: string) => boolean;
  roleIn: (slug: string) => CommunityRole | null;
  /** Instant-join (public tier). */
  join: (slug: string) => void;
  /** Submit a join request (request tier). */
  requestToJoin: (slug: string) => void;
  /** Found a community — the current user joins as its owner. */
  createOwned: (slug: string) => void;
  leave: (slug: string) => void;
}

const CommunityMembershipContext =
  createContext<CommunityMembershipContextValue | null>(null);

/**
 * Pre-seeded so all three role/join states are demonstrable on the flagships.
 * Demo-only fiction — in live mode the viewer's real membership comes from the
 * API (`myRole` per community), so the store starts empty.
 */
const SEED: Record<string, Membership> = {
  "queer-runners": { role: "mod", joinedAt: "March 2025" },
  "trans-hub": { role: "mod", joinedAt: "Jan 2025" },
};

/**
 * Session-level store for the member's community memberships, roles and requests
 * — the DEMO source of truth, and nothing more.
 *
 * In live mode the server owns all of this: `myRole` and `myJoinRequestStatus`
 * ship on every community card and detail, `GET /me/communities` returns the
 * whole membership map (`useMyCommunities`), and joining / reviewing / removing /
 * promoting are the mutations in `api/useCommunityMutations.ts`. So the store
 * starts empty and stays empty live, and the mod-tools simulation that used to
 * live here (`approveRequest`, `promoteToMod`/`promotedMods`) is gone: it wrote
 * state nothing outside this file ever read, and its semantics were incoherent
 * anyway (a mod approving someone else's request marked *themselves* a member).
 */
export function CommunityMembershipProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { demoMode } = useDemoMode();
  const [memberships, setMemberships] = useState<Record<string, Membership>>(
    () => (demoMode ? SEED : {}),
  );
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  // Re-seed when the "Populate platform" toggle flips: the mock memberships are
  // demo-only, so live mode must never show them.
  const [prevDemo, setPrevDemo] = useState(demoMode);
  if (prevDemo !== demoMode) {
    setPrevDemo(demoMode);
    setMemberships(demoMode ? SEED : {});
    setPendingRequests([]);
  }

  const isMember = useCallback(
    (slug: string) => slug in memberships,
    [memberships],
  );
  const hasRequested = useCallback(
    (slug: string) => pendingRequests.includes(slug),
    [pendingRequests],
  );
  const roleIn = useCallback(
    (slug: string): CommunityRole | null => memberships[slug]?.role ?? null,
    [memberships],
  );

  const join = useCallback((slug: string) => {
    setMemberships((prev) =>
      prev[slug]
        ? prev
        : { ...prev, [slug]: { role: "member", joinedAt: "just now" } },
    );
    setPendingRequests((prev) => prev.filter((s) => s !== slug));
  }, []);

  const requestToJoin = useCallback((slug: string) => {
    setPendingRequests((prev) =>
      prev.includes(slug) ? prev : [...prev, slug],
    );
  }, []);

  const createOwned = useCallback((slug: string) => {
    setMemberships((prev) =>
      prev[slug]
        ? prev
        : { ...prev, [slug]: { role: "owner", joinedAt: "just now" } },
    );
  }, []);

  const leave = useCallback((slug: string) => {
    setMemberships((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      memberships,
      pendingRequests,
      isMember,
      hasRequested,
      roleIn,
      join,
      requestToJoin,
      createOwned,
      leave,
    }),
    [
      memberships,
      pendingRequests,
      isMember,
      hasRequested,
      roleIn,
      join,
      requestToJoin,
      createOwned,
      leave,
    ],
  );

  return (
    <CommunityMembershipContext.Provider value={value}>
      {children}
    </CommunityMembershipContext.Provider>
  );
}

export function useCommunityMembership() {
  const ctx = useContext(CommunityMembershipContext);
  if (!ctx) {
    throw new Error(
      "useCommunityMembership must be used within CommunityMembershipProvider",
    );
  }
  return ctx;
}
