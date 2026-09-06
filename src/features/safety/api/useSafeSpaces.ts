import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  demoStats,
  getSpace,
  REMOVED_SPACES,
  VERIFIED_SPACES,
  type AnySpace,
  type RemovedSpace,
  type VerifiedSpace,
} from "../safeSpaces";
import {
  safeSpaceDetailDtoToSpace,
  safeSpaceListToView,
} from "./safeSpaces.adapters";
import { getSafeSpace, getSafeSpaces } from "./safeSpaces.api";

export const SAFE_SPACES_KEY = "safeSpaces";

interface SafeSpacesView {
  verified: VerifiedSpace[];
  removed: RemovedSpace[];
  stats: {
    verified: number;
    reviews: number;
    removed: number;
    /** Newest badge date on the page, `YYYY-MM-DD`, or null when nothing on
     *  the page carries one. Null is what the hub shows before the fetch
     *  settles too, which is why the copy branches on it rather than
     *  rendering a date it does not have yet. */
    lastReVerifiedAt: string | null;
  };
}

function demoSafeSpaces(): SafeSpacesView {
  return {
    verified: VERIFIED_SPACES,
    removed: REMOVED_SPACES,
    stats: demoStats(),
  };
}

/**
 * Source for the safe-spaces directory grid (`/safe-spaces`).
 *
 * Demo mode returns the prototype's own mock arrays and never hits the
 * network. Live mode fetches the public `GET /directory/safe-spaces` (every
 * verified + removed listing plus the header stats) and adapts each card —
 * so with "Populate platform" OFF the page shows real safe spaces.
 */
export function useSafeSpaces(): SafeSpacesView & {
  isLoading: boolean;
  /** True when the directory fetch failed, so the grid can say so instead of
   *  reading as a directory with no safe spaces in it (DES-22). */
  isError: boolean;
  /** Re-runs the failed fetch. */
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const query = useQuery<SafeSpacesView>({
    queryKey: [SAFE_SPACES_KEY, demoMode],
    initialData: demoMode ? demoSafeSpaces() : undefined,
    queryFn: async () => {
      if (demoMode) return demoSafeSpaces();
      const dto = await getSafeSpaces();
      return safeSpaceListToView(dto);
    },
  });
  return {
    verified: query.data?.verified ?? [],
    removed: query.data?.removed ?? [],
    stats: query.data?.stats ?? {
      verified: 0,
      reviews: 0,
      removed: 0,
      lastReVerifiedAt: null,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * A single safe space by slug, for the detail page (`/safe-spaces/:slug`).
 * Demo resolves against the mock registry via `getSpace`; live fetches the
 * public `GET /directory/safe-spaces/:slug` and adapts the discriminated
 * verified/removed payload.
 *
 * Returns `{ space, isLoading, isError, error, refetch }` rather than a bare
 * value: the live fetch is async, so the detail page must distinguish "still
 * loading" (show a skeleton), "settled, not found" (redirect) and "the read
 * failed" (offer a retry) instead of redirecting on the initial undefined.
 *
 * The 404 is handed to the CALLER as an `ApiError`, the same shape
 * `useHousingListing`/`HousingListingPage` settled on, rather than being caught
 * here. Catching it and returning `undefined` looked like "resolve to not
 * found", but react-query rejects `undefined` as query data outright (it throws
 * `<queryHash> data is undefined`), so every 404 landed in the query's ERROR
 * state anyway: the failure was retried once and the cache-level handler raised
 * a "Something went wrong" toast that a real 404 is explicitly exempt from.
 * `null` is the value that means "nothing here", and react-query accepts it.
 */
export function useSafeSpace(slug: string | undefined): {
  space: AnySpace | undefined;
  isLoading: boolean;
  /** True when the read failed, a 404 included. Pair it with `error` below to
   *  tell "this slug names no safe space" from an outage: an outage must never
   *  be reported to a member as "this safe space does not exist" (DES-22). */
  isError: boolean;
  /** The raw failure, so a caller can tell a 404 (not found) from an outage
   *  (retryable). Mirrors `HousingListingPage`'s `isNotFound` computation. */
  error: unknown;
  /** Re-runs the failed fetch. */
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const query = useQuery<AnySpace | null>({
    queryKey: [SAFE_SPACES_KEY, "detail", slug, demoMode],
    enabled: slug !== undefined,
    // `null` rather than `undefined` for a demo slug that names nothing:
    // `undefined` reads as "no initial data" and would put the query into a
    // pending state the demo registry can answer synchronously.
    initialData: demoMode ? (getSpace(slug) ?? null) : undefined,
    queryFn: async () => {
      if (demoMode) return getSpace(slug) ?? null;
      if (slug === undefined) return null;
      // A 404 propagates deliberately: the caller reads it off `error` and
      // decides between not-found and retry. See the doc comment above.
      return safeSpaceDetailDtoToSpace(await getSafeSpace(slug));
    },
  });
  return {
    space: query.data ?? undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}
