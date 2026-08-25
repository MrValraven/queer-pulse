import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { PROFILES, type Profile } from "../flatmates.data";
import {
  getFlatmateProfiles,
  type FlatmateFilters,
} from "./flatmateProfile.api";
import { flatmateDtoToProfile } from "./flatmateProfile.adapters";

const FLATMATE_PROFILES_KEY = "flatmate-profiles";

interface FlatmateProfilesPageVM {
  items: Profile[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * The flatmate board, paginated. Demo returns the PROFILES fixture as a single
 * synthetic page (the board still refines client-side); live queries the
 * member-only, match-ranked directory one page at a time, with the board's
 * filters as server-side query params.
 *
 * Both halves were broken before: the hook was called with no filters at all
 * and read page 1 only, so neighbourhood/budget/move-in/lifestyle ran over a
 * truncated set and a member filtering by "Arroios" could see nothing while
 * matching profiles sat on page 2. `flatmateDtoToProfile`'s `id` is a row
 * index, so each page is offset by the rows already loaded to keep those keys
 * unique across pages.
 */
export function useFlatmateProfiles(filters: FlatmateFilters = {}) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const query = useInfiniteQuery<FlatmateProfilesPageVM>({
    // `language` is part of the key because the adapter resolves the name
    // fallback and move-in line through `t` and the budget through `fmt`.
    queryKey: [FLATMATE_PROFILES_KEY, demoMode, filters, language],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        // `page * pageSize === total`, so `getNextPageParam` yields undefined
        // and demo mode never issues a page-2 fetch.
        return {
          items: PROFILES,
          total: PROFILES.length,
          page: 1,
          pageSize: PROFILES.length,
        };
      }
      const page = pageParam as number;
      const profilePage = await getFlatmateProfiles({ ...filters, page });
      const offset = (profilePage.page - 1) * profilePage.pageSize;
      return {
        items: profilePage.items.map((dto, index) =>
          flatmateDtoToProfile(dto, offset + index, t, fmt),
        ),
        total: profilePage.total,
        page: profilePage.page,
        pageSize: profilePage.pageSize,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
    // Keep the previous filter's results on screen while the new ones load.
    placeholderData: keepPreviousData,
  });
  const profiles = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? profiles.length;
  return { ...query, profiles, total };
}
