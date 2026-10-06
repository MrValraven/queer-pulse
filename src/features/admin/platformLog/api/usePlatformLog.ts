import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import type { PlatformLogFilters } from "../platformLogFilters";
import { getPlatformLog, type PlatformLogPageDTO } from "./platformLog.api";

type PlatformLogCursor = string | undefined;

/**
 * Pages of `GET /admin/log`, newest first. Rows stay in wire format in the
 * cache and are mapped at render, so a language switch never needs a refetch.
 */
export function usePlatformLog(filters: PlatformLogFilters, isAdmin: boolean) {
  const { demoMode } = useDemoMode();
  return useInfiniteQuery<
    PlatformLogPageDTO,
    Error,
    InfiniteData<PlatformLogPageDTO, PlatformLogCursor>,
    QueryKey,
    PlatformLogCursor
  >({
    queryKey: ["admin-platform-log", demoMode, isAdmin, filters],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { demoPlatformLogPage } = await import("../platformLog.mock");
        return demoPlatformLogPage(filters, isAdmin, Date.now());
      }
      return getPlatformLog({ cursor: pageParam, ...filters });
    },
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });
}

export type PlatformLogQuery = ReturnType<typeof usePlatformLog>;
