import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCommunities, type CommunitiesQuery } from "./communities.api";
import { cardDtoToCommunity } from "./communities.adapters";
import { communities } from "../../homepage/data/communities";
import type { Community } from "../../homepage/data/types";

export interface CommunitiesResult {
  /** Every community fetched so far, flattened across the loaded pages. */
  items: Community[];
  /** Server-reported total across all pages (demo: the registry length). */
  total: number;
  /** True when another page is available (live only — always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page (no-op once `hasNextPage` is false). */
  fetchNextPage: () => void;
  /** True while a subsequent page is loading. */
  isFetchingNextPage: boolean;
  /** True while the first page is in flight. */
  isLoading: boolean;
}

interface CommunitiesPageVM {
  items: Community[];
  total: number;
  page: number;
}

/**
 * Discover-grid source, paginated. Demo mode returns the page's own static
 * `communities` registry as a single synthetic page (full fidelity for the type
 * chips + living-card stats) — `getNextPageParam` then sees loaded === total and
 * yields `undefined`, so demo never shows a "Load more" and renders exactly as
 * it does today. Live mode calls GET /communities?filter=…&type=…&page= and
 * appends each page, adapting every card to the same view-model and stopping
 * at the server `total`.
 *
 * The page's category chips are a `type` query param on both paths (demo
 * filters the static registry the same way live filters server-side), so a
 * chip narrows the WHOLE result set — not just whatever page happened to be
 * loaded already (COM-3: a category with more than one page used to false-
 * negative "no communities match" past page 1). Live mode hides private
 * communities from non-members (the API omits them from the list).
 */
export function useCommunities(
  params: CommunitiesQuery = {},
  options: { enabled?: boolean } = {},
): CommunitiesResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<CommunitiesPageVM>({
    queryKey: ["communities", demoMode, params],
    // Callers may gate this fetch off when its result isn't consumed (e.g. a
    // profile viewing another member). Demo mode's queryFn is a local no-network
    // read, but gating it too keeps the discarded-path behaviour consistent.
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        // Mirror the live endpoint's ILIKE-over-name/tagline search client-side
        // (the mock registry has no separate "purpose" field). Demo has no
        // pagination, so a fresh search always yields its own single page —
        // there's nothing to reset.
        const needle = params.q?.trim().toLowerCase();
        const searched = needle
          ? communities.filter((community) =>
              `${community.name} ${community.description}`
                .toLowerCase()
                .includes(needle),
            )
          : communities;
        // Mirror the live endpoint's `type=` filter (COM-3) — applied
        // server-side there, applied here over the same static registry so
        // demo behaviour stays byte-for-byte identical to live.
        const matches = params.type
          ? searched.filter((community) => community.type === params.type)
          : searched;
        // Mirror the live endpoint's `sort=name` (A→Z); `newest`/omitted keeps
        // the registry's own order, same as the backend's `created_at DESC`
        // default reads today.
        const sorted =
          params.sort === "name"
            ? [...matches].sort((a, b) => a.name.localeCompare(b.name))
            : matches;
        return { items: sorted, total: sorted.length, page: 1 };
      }
      const res = await getCommunities({
        ...params,
        page: pageParam as number,
      });
      return {
        items: res.items.map(cardDtoToCommunity),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    items: pages.flatMap((p) => p.items),
    total: pages[0]?.total ?? 0,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
  };
}
