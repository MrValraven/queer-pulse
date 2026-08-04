import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getRoster } from "./communities.api";
import { rosterEntryToRosterMember } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { RosterMember } from "../community.model";
import type { PulsePaging } from "./useCommunityPosts";

export interface RosterResult extends PulsePaging {
  roster: RosterMember[];
}

interface RosterPageVM {
  items: RosterMember[];
  total: number;
  page: number;
}

/**
 * A community's roster, paginated. Demo returns the flagship's mock roster
 * synchronously with `hasNextPage: false`, so the Members tab renders exactly
 * as it does today and never touches the network. Live mode calls GET
 * /communities/:slug/roster?page= and appends each page, stopping at the
 * server `total` — mirrors `useCommunityPosts`'s pagination shape exactly.
 * Private-community 404s surface as an empty roster — the not-found gate
 * lives in `useCommunity`.
 */
export function useRoster(slug: string | undefined): RosterResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<RosterPageVM>({
    queryKey: ["roster", slug, demoMode],
    enabled: !demoMode && Boolean(slug),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getRoster(slug!, pageParam as number);
      return {
        items: res.items.map(rosterEntryToRosterMember),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const roster = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.items),
    [query.data],
  );

  if (demoMode) {
    return {
      roster: getLiving(slug)?.roster ?? [],
      hasNextPage: false,
      fetchNextPage: () => {},
      isFetchingNextPage: false,
    };
  }
  return {
    roster,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
