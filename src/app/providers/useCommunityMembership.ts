import { createContext, useContext } from "react";
import type {
  CommunityRole,
  Membership,
} from "../../features/communities/membership.types";

export interface CommunityMembershipContextValue {
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

export const CommunityMembershipContext =
  createContext<CommunityMembershipContextValue | null>(null);

export function useCommunityMembership() {
  const ctx = useContext(CommunityMembershipContext);
  if (!ctx) {
    throw new Error(
      "useCommunityMembership must be used within CommunityMembershipProvider",
    );
  }
  return ctx;
}
