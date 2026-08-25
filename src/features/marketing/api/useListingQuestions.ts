import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { toItemsPage } from "../../../shared/api/pagination";
import type { ListingPublicQuestion } from "../directoryPlaces";
import { getListingQuestions } from "./directory.api";
import { DIRECTORY_KEY } from "./useDirectory";

/** Query key root for the paged public-questions list, so the ask/answer
 *  mutations can invalidate it by slug. */
export const DIRECTORY_QUESTIONS_KEY = "questions";

export interface ListingQuestionsResult {
  questions: ListingPublicQuestion[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

interface QuestionsPageVM {
  items: ListingPublicQuestion[];
  total: number;
  page: number;
}

/**
 * The full public-question list for a listing, newest first, paged.
 *
 * The detail payload already carries the ten most recent questions, so this
 * stays parked until the reader asks to see more (`isEnabled`), so a page
 * nobody scrolled makes no second request. Once enabled it owns the list and
 * pages through the backend's own `total`, exactly like
 * `useDirectoryPlacesPage`.
 *
 * Demo mode never hits the network: the fixture has no questions, so it
 * answers with a single empty terminal page and the section keeps reading as
 * "nobody has asked anything yet".
 */
export function useListingQuestions(
  slug: string,
  isEnabled: boolean,
): ListingQuestionsResult {
  const { demoMode } = useDemoMode();

  const query = useInfiniteQuery<QuestionsPageVM>({
    queryKey: [DIRECTORY_KEY, DIRECTORY_QUESTIONS_KEY, slug, demoMode],
    enabled: isEnabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) return { items: [], total: 0, page: 1 };
      const page = toItemsPage(
        await getListingQuestions(slug, pageParam as number),
      );
      return { items: page.items, total: page.total, page: page.page };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (count, page) => count + page.items.length,
        0,
      );
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    questions: pages.flatMap((page) => page.items),
    total: pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
