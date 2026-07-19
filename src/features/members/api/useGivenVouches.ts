import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getGivenVouches } from "./members.api";

/**
 * Slugs the signed-in member has vouched for (`GET /me/vouches/given`).
 *
 * Was a keyless `useEffect` + promise in `VouchProvider` firing on every route.
 * As a query it fires on first subscribe — i.e. when `useVouch()` mounts on a
 * profile or the connections page — and never for `useVouchActions()` callers.
 *
 * Returns bare slugs rather than `{ slug }` rows so the shape matches
 * `VouchProvider`'s `vouched: string[]` store exactly, keeping the hydration in
 * `useVouch()` a straight assignment.
 *
 * `staleTime: Infinity` and no invalidation of this key anywhere is deliberate:
 * `useVouchMutations` optimistically mutates the provider's `vouched` list, and
 * a refetch landing mid-flight would overwrite that optimistic value wholesale
 * — a vouch visibly un-doing itself. The old effect ran exactly once for the
 * same reason; this preserves it.
 *
 * Note `useVouchers(slug)` (`./useVouchers.ts`) is a different query — the
 * faces on someone else's profile, keyed `["vouchers", demoMode, slug]`. Don't
 * conflate them.
 */
export function useGivenVouches() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<string[]>({
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
      return rows.map((r) => r.slug);
    },
  });
}
