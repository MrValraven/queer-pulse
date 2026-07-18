import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getWorkshops } from "./workshops.api";
import { workshopDtoToWorkshop } from "./workshops.adapters";
import { WORKSHOPS, type Workshop } from "../workshops.data";

export interface WorkshopsResult {
  /** All workshops fetched so far, flattened across loaded pages. */
  workshops: Workshop[];
  /** Server-reported total across all pages. */
  total: number;
  /** True while the first page is in flight. */
  isLoading: boolean;
  /** True when another page is available (always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page. */
  fetchNextPage: () => void;
  /** True while a subsequent page loads. */
  isFetchingNextPage: boolean;
}

interface WorkshopsPageVM {
  items: Workshop[];
  total: number;
  page: number;
}

/**
 * The workshops catalogue, paginated — the same page/offset `useInfiniteQuery`
 * shape as `useJobs`, because the endpoint has the same
 * `{ items, total, page, pageSize }` envelope.
 *
 * Dual-mode: demo mode returns the seeded `WORKSHOPS` fixture as one synthetic
 * full page and never touches the network (`loaded === total`, so "Load more"
 * never appears). Live mode calls GET /workshops?cat=&page= and appends pages
 * until the server `total` is reached, adapting every row through
 * `workshopDtoToWorkshop`.
 *
 * i18n: `language` is in the query key because the adapter composes the format
 * line and formats prices through `t`/`fmt` — switching language must re-derive
 * the view-models rather than serve a cached English page.
 */
export function useWorkshops(params: { cat?: string } = {}): WorkshopsResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useInfiniteQuery<WorkshopsPageVM>({
    queryKey: ["workshops", demoMode, language, params],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        return { items: WORKSHOPS, total: WORKSHOPS.length, page: 1 };
      }
      const res = await getWorkshops({ ...params, page: pageParam as number });
      return {
        items: res.items.map((dto) => workshopDtoToWorkshop(dto, t, fmt)),
        total: res.total,
        page: res.page,
      };
    },
    // Demo has nothing to fetch, so seed the fixture as the resolved first page:
    // the catalogue renders on the very first paint, exactly as it did when the
    // provider held the array directly. Live mode gets no initial data.
    initialData: demoMode
      ? {
          pages: [{ items: WORKSHOPS, total: WORKSHOPS.length, page: 1 }],
          pageParams: [1],
        }
      : undefined,
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    workshops: pages.flatMap((p) => p.items),
    total: pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
