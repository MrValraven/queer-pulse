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

interface CommunityMembershipContextValue {
  /** The current user's membership in each community, keyed by slug. */
  memberships: Record<string, Membership>;
  /** Slugs the user has requested to join (request-tier), awaiting approval. */
  pendingRequests: string[];
  /** Promoted-to-mod member keys per community (mod-tools simulation). */
  promotedMods: Record<string, string[]>;
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
  /** Approve a pending request → becomes a member (mod-tools sim). */
  approveRequest: (slug: string) => void;
  /** Promote a roster member to mod (mod-tools sim). */
  promoteToMod: (slug: string, memberKey: string) => void;
}

const CommunityMembershipContext =
  createContext<CommunityMembershipContextValue | null>(null);

/** Pre-seeded so all three role/join states are demonstrable on the flagships. */
const SEED: Record<string, Membership> = {
  "queer-runners": { role: "mod", joinedAt: "March 2025" },
  "trans-hub": { role: "mod", joinedAt: "Jan 2025" },
};

/** Session-level store for the member's community memberships, roles and requests. */
export function CommunityMembershipProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [memberships, setMemberships] =
    useState<Record<string, Membership>>(SEED);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [promotedMods, setPromotedMods] = useState<Record<string, string[]>>(
    {},
  );

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

  const approveRequest = useCallback((slug: string) => {
    setPendingRequests((prev) => prev.filter((s) => s !== slug));
    setMemberships((prev) =>
      prev[slug]
        ? prev
        : { ...prev, [slug]: { role: "member", joinedAt: "just now" } },
    );
  }, []);

  const promoteToMod = useCallback((slug: string, memberKey: string) => {
    setPromotedMods((prev) => {
      const cur = prev[slug] ?? [];
      if (cur.includes(memberKey)) return prev;
      return { ...prev, [slug]: [...cur, memberKey] };
    });
  }, []);

  const value = useMemo(
    () => ({
      memberships,
      pendingRequests,
      promotedMods,
      isMember,
      hasRequested,
      roleIn,
      join,
      requestToJoin,
      createOwned,
      leave,
      approveRequest,
      promoteToMod,
    }),
    [
      memberships,
      pendingRequests,
      promotedMods,
      isMember,
      hasRequested,
      roleIn,
      join,
      requestToJoin,
      createOwned,
      leave,
      approveRequest,
      promoteToMod,
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
