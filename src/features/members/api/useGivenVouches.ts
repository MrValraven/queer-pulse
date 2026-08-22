import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getGivenVouches } from "./members.api";

/** A vouch the signed-in member has given, resolved for display. */
export interface GivenVouchFace {
  /** The vouched member's slug (`/members/:slug`). */
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  /** ISO timestamp the vouch was given. */
  createdAt: string;
}

/**
 * The vouches the signed-in member has given (`GET /me/vouches/given`).
 *
 * Was a keyless `useEffect` + promise in `VouchProvider` firing on every route.
 * As a query it fires on first subscribe — i.e. when `useVouch()` mounts on a
 * profile or the connections page — and never for `useVouchActions()` callers.
 *
 * Returns rich `GivenVouchFace` rows (slug + name + avatar + `createdAt`) so both
 * `useVouch()` (which maps them back to `vouched: string[]`) and the profile
 * "Your network" section (which needs the name and timestamp) share one fetch.
 *
 * `staleTime: Infinity` and no invalidation of this key anywhere is deliberate:
 * `useVouchMutations` optimistically mutates the provider's `vouched` list, and
 * a refetch landing mid-flight would overwrite that optimistic value wholesale
 * — a vouch visibly un-doing itself. The old effect ran exactly once for the
 * same reason; this preserves it.
 *
 * Not invalidating is not the same as never updating, though. Both vouch
 * mutations WRITE this cache entry directly: `useVouchMember` prepends the new
 * row on success, `useVouchMutations` filters the withdrawn slug out on mutate
 * (restoring it on error). Without that, the owner's "You vouched for" stat and
 * `NetworkListModal` — which both read this query through `useProfileNetwork` —
 * stayed frozen at the session's first answer. Any future writer must patch the
 * cache the same way rather than reaching for `invalidateQueries`.
 *
 * Note `useVouchers(slug)` (`./useVouchers.ts`) is a different query — the
 * faces on someone else's profile, keyed `["vouchers", demoMode, slug]`. Don't
 * conflate them.
 */
export function useGivenVouches() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<GivenVouchFace[]>({
    queryKey: ["givenVouches", demoMode],
    enabled: !demoMode && loggedIn,
    staleTime: Infinity,
    retry: false,
    // The effect this replaces swallowed its error ("not active / not
    // authorized — leave as-is"). A 403 here is routine for a pending member;
    // without `silentError` the app-wide QueryCache onError could surface it.
    meta: { silentError: true },
    queryFn: async () => {
      if (demoMode) return [];
      const rows = await getGivenVouches();
      return rows.map((row) => ({
        slug: row.slug,
        firstName: row.firstName,
        lastName: row.lastName,
        avatarUrl: row.avatarUrl ?? undefined,
        createdAt: row.createdAt,
      }));
    },
  });
}
