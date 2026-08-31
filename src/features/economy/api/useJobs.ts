import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getJobs } from "./jobs.api";
import { jobCardToJob } from "./jobs.adapters";
import { economyKeys } from "./economyKeys";
import type { Job } from "../jobs.data";

export interface JobsResult {
  /** All jobs fetched so far, flattened across loaded pages. */
  jobs: Job[];
  /** Server-reported total across all pages. */
  total: number;
  /** True while the first page is in flight. */
  isLoading: boolean;
  /**
   * True when the fetch failed. Without it an outage renders as "no jobs
   * match" — the board must say it could not load instead (DES-22).
   */
  isError: boolean;
  /** Re-runs the failed fetch. Wire it to the error state's retry. */
  refetch: () => void;
  /** True when another page is available (always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page. */
  fetchNextPage: () => void;
  /** True while a subsequent page loads. */
  isFetchingNextPage: boolean;
}

interface JobsPageVM {
  items: Job[];
  total: number;
  page: number;
}

/**
 * Jobs board source, paginated. Demo mode returns the mock `JOBS` array as a
 * single synthetic full page (the page merges its locally-posted jobs on top
 * and does its own client-side filtering, so demo renders exactly as today and
 * never offers "Load more" — `loaded === total` on the first page). Live mode
 * calls GET /jobs?cat=&type=&page= and appends each page, stopping at the
 * server `total`; every card is adapted via `jobCardToJob`.
 *
 * i18n: `language` is part of the query key because `jobCardToJob` resolves
 * chrome (pay/affiliation fallbacks) through `t` — switching language must
 * re-derive the adapted view-models. Locale stays independent of demo mode.
 */
export function useJobs(
  params: { cat?: string; type?: string } = {},
): JobsResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useInfiniteQuery<JobsPageVM>({
    queryKey: economyKeys.jobs(demoMode, language, params),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        // Demo-only mock — loaded on demand so it never ships in the live bundle.
        const { JOBS } = await import("../jobs.data");
        return { items: JOBS, total: JOBS.length, page: 1 };
      }
      const res = await getJobs({ ...params, page: pageParam as number });
      return {
        items: res.items.map((dto) => jobCardToJob(dto, t, fmt)),
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
    jobs: pages.flatMap((p) => p.items),
    total: pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
