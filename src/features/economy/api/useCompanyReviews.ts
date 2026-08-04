import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCompanyReviews } from "./companies.api";
import { reviewDtoToReview } from "./companies.adapters";
import { economyKeys } from "./economyKeys";
import type { CompanyReview } from "../companies.data";

export interface CompanyReviewsResult {
  /** All reviews fetched so far, flattened across loaded pages. */
  reviews: CompanyReview[];
  /** Server-reported total across all pages. */
  total: number;
  /** True while the first page is in flight. */
  isLoading: boolean;
  /** True when another page is available (always false in demo/disabled). */
  hasNextPage: boolean;
  /** Fetch and append the next page. */
  fetchNextPage: () => void;
  /** True while a subsequent page loads. */
  isFetchingNextPage: boolean;
}

interface ReviewsPageVM {
  items: CompanyReview[];
  total: number;
  page: number;
}

/**
 * A company's reviews (GET /companies/:slug/reviews), paginated.
 *
 * Demo returns the mock profile's reviews as a single synthetic full page (the
 * same list the reviews tab shows today), so demo is unchanged and never offers
 * "Load more". Live appends each page, stopping at the server `total`.
 *
 * Fetching stays deferred exactly as before: the query is disabled without a
 * `slug`, and `opts.enabled` lets the page hold it back until the reviews tab
 * is opened.
 */
export function useCompanyReviews(
  slug: string | undefined,
  opts: { enabled?: boolean } = {},
): CompanyReviewsResult {
  const { demoMode } = useDemoMode();

  const query = useInfiniteQuery<ReviewsPageVM>({
    queryKey: economyKeys.companyReviews(slug, demoMode),
    enabled: Boolean(slug) && (opts.enabled ?? true),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!slug) return { items: [], total: 0, page: 1 };
      if (demoMode) {
        // Demo-only mock — loaded on demand so it never ships in the live bundle.
        const { COMPANY_PROFILES } = await import("../companies.data");
        const items = COMPANY_PROFILES[slug]?.reviews ?? [];
        return { items, total: items.length, page: 1 };
      }
      const res = await getCompanyReviews(slug, { page: pageParam as number });
      return {
        items: res.items.map(reviewDtoToReview),
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
    reviews: pages.flatMap((p) => p.items),
    total: pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
