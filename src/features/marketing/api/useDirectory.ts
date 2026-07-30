import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDirectoryListingsActions } from "../../../app/providers/useDirectoryListingsActions";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  DIRECTORY_PLACES,
  getPlace,
  type DirectoryPlace,
} from "../directoryPlaces";
import {
  cardDtoToPlace,
  detailDtoToPlace,
  submittedToPlace,
} from "./directory.adapters";
import { getDirectory, getDirectorySpace } from "./directory.api";
import { ApiError } from "../../../shared/api/client";

export const DIRECTORY_KEY = "directory";

/**
 * Source for the public business directory grid (`/local/directory`).
 *
 * Demo mode returns the prototype's own `DIRECTORY_PLACES` registry and never
 * hits the network. Live mode fetches the public `GET /directory` (every live
 * listing) and adapts each card — so with "Populate platform" OFF the page
 * shows real businesses, and the fabricated fixture only appears in demo.
 *
 * Always fetches the unfiltered grand total — the directory page's "Verified
 * safe spaces" chip is applied client-side (alongside category/query/vibe) so
 * its "X of Y" count stays meaningful. `getDirectory`'s `safe` param remains a
 * valid, separately-usable API capability (the backend also boosts verified
 * listings first by default) for any caller that wants server-side filtering.
 *
 * Returns a plain array (page keeps its own `useSimulatedLoad` skeleton), so
 * this stays a drop-in for the previous synchronous read point.
 */
export function useDirectoryPlaces(): DirectoryPlace[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<DirectoryPlace[]>({
    queryKey: [DIRECTORY_KEY, demoMode],
    initialData: demoMode ? DIRECTORY_PLACES : undefined,
    queryFn: async () => {
      if (demoMode) return DIRECTORY_PLACES;
      const cards = await getDirectory();
      return cards.map(cardDtoToPlace);
    },
  });
  return query.data ?? [];
}

/**
 * A single directory place by slug, for the detail page
 * (`/local/directory/:slug`). Demo resolves against the mock registry, then
 * falls back to the member's own submitted-listings overlay (so a demo
 * user's wizard-created listing is viewable and its owner-only affordances —
 * "Edit this listing", replying to reviews — are reachable); live fetches the
 * public `GET /directory/:slug` and adapts it.
 *
 * Returns `{ place, isLoading, isError, refetch }` rather than a bare value:
 * the live fetch is async, so the detail page must distinguish "still loading"
 * (show a skeleton), "settled, not found" (redirect), and "the read failed"
 * (show an error state) instead of redirecting on the initial undefined. Only a
 * genuine 404 resolves to `undefined` (not found) with `isLoading` false; any
 * other failure (5xx, network) propagates so `isError` is true and the page can
 * offer a retry rather than a misleading not-found redirect.
 */
export function useDirectoryPlace(slug: string | undefined): {
  place: DirectoryPlace | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const fmt = useFormat();
  // Hook-safe: read the demo/session listings overlay at the hook's top
  // level (never inside queryFn). `local` is the whole demo store — same
  // source `useDirectoryListings`' `submitted` reads in demo mode — and, in
  // live mode, only ever a same-session optimistic overlay never consulted
  // below (the demo branch is the sole caller of `demoPlace`).
  const { local: submittedListings } = useDirectoryListingsActions();

  // Fixture-first, then the member's own submitted listing for that slug.
  // Kept synchronous to match `getPlace`'s existing demo pattern.
  const demoPlace = (): DirectoryPlace | undefined => {
    const fixture = getPlace(slug);
    if (fixture) return fixture;
    const submitted = submittedListings.find((listing) => listing.slug === slug);
    return submitted ? submittedToPlace(submitted) : undefined;
  };

  const query = useQuery<DirectoryPlace | undefined>({
    queryKey: [DIRECTORY_KEY, "detail", slug, demoMode, language],
    enabled: slug !== undefined,
    initialData: demoMode ? demoPlace() : undefined,
    queryFn: async () => {
      if (demoMode) return demoPlace();
      if (slug === undefined) return undefined;
      try {
        return detailDtoToPlace(await getDirectorySpace(slug), fmt);
      } catch (error) {
        // Only a real 404 means "no such listing" → resolve to undefined so the
        // page redirects to the directory. Any other failure (5xx, network)
        // re-throws so the query enters its error state and the page can offer
        // a retry, rather than falsely claiming the listing doesn't exist.
        if (error instanceof ApiError && error.status === 404) return undefined;
        throw error;
      }
    },
  });
  return {
    place: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
