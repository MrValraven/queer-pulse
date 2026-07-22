import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMembers, type MembersPage } from "./members.api";
import { cardDtoToMemberCard } from "./members.adapters";
import { MEMBERS, type MemberCard } from "../memberDirectoryFilter.data";

export interface MembersResult {
  /** All members fetched so far, flattened across loaded pages. */
  items: MemberCard[];
  /** Server-reported total across all pages. */
  total: number;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
}

interface MembersPageVM {
  items: MemberCard[];
  total: number;
  page: number;
}

/**
 * Directory source, paginated. Demo mode returns the page's own MemberCard
 * registry as a single synthetic page (full filter fidelity); live mode calls
 * GET /members?page= and appends each page, stopping at the server `total`.
 */
export function useMembers(
  params: {
    query?: string;
    tags?: string[];
    identities?: string[];
    /** Server-side sort order (a `MemberSort` wire token). Demo mode ignores it
     *  and sorts the mock list in the browser; see the page's `sortMembers`. */
    sort?: string;
  } = {},
): MembersResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<MembersPageVM>({
    queryKey: ["members", demoMode, params],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        return { items: MEMBERS, total: MEMBERS.length, page: 1 };
      }
      const res: MembersPage = await getMembers({
        ...params,
        page: pageParam as number,
      });
      return {
        items: res.items.map(cardDtoToMemberCard),
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
