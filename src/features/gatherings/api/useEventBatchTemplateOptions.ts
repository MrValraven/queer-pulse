import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  eventBatchTemplateOptionOf,
  type EventBatchTemplateOption,
} from "./eventBatch.api";
import { getEvents } from "./events.api";
import { eventKeys } from "./eventKeys";

export interface EventBatchTemplateOptionsResult {
  options: EventBatchTemplateOption[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

/** One loaded page of the picker. `rawCount` counts every card the server
 *  sent, cancelled ones included, so paging measures against its `total`. */
interface TemplateOptionsPage {
  options: EventBatchTemplateOption[];
  rawCount: number;
  total: number;
  page: number;
}

/**
 * The events a member can start a month from: `GET /events?filter=hosting`
 * (hosted and co-hosted, past and upcoming, newest first), with cancelled
 * events dropped because the template routes refuse them. The key sits under
 * `eventKeys.listRoot`, so every create that refreshes the event lists
 * refreshes the picker too; `"batchTemplates"` holds the filter position.
 * Demo mode serves one page from `addMonth/eventBatchDemo.ts`.
 */
export function useEventBatchTemplateOptions(): EventBatchTemplateOptionsResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<TemplateOptionsPage>({
    queryKey: [...eventKeys.listRoot, "batchTemplates", demoMode],
    initialPageParam: 1,
    meta: { silentError: true },
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { demoEventBatchTemplateOptions } =
          await import("../addMonth/eventBatchDemo");
        const options = demoEventBatchTemplateOptions();
        return {
          options,
          rawCount: options.length,
          total: options.length,
          page: 1,
        };
      }
      const page = pageParam as number;
      const response = await getEvents({ filter: "hosting", page });
      return {
        options: response.items
          .map(eventBatchTemplateOptionOf)
          .filter((option) => option !== null),
        rawCount: response.items.length,
        total: response.total,
        page: response.page,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (count, page) => count + page.rawCount,
        0,
      );
      // An empty page ends the list even when `total` is stale.
      return lastPage.rawCount > 0 && loadedCount < lastPage.total
        ? lastPage.page + 1
        : undefined;
    },
  });
  return {
    options: query.data?.pages.flatMap((page) => page.options) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    refetch: () => void query.refetch(),
  };
}
