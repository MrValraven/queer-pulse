import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { buildDemoFeatureUsage } from "../adminFeatureUsageDemo";
import {
  rangeSelectionKey,
  type FeatureUsageRangeSelection,
  type FeatureUsageWindow,
} from "../featureUsageRange";
import {
  getAdminFeatureUsage,
  type AdminFeatureUsageDTO,
  type ClassifiedFeature,
} from "./adminFeatureUsage.api";
import {
  featureUsageErrorCode,
  type FeatureUsageErrorCode,
} from "./featureUsageErrorCode";

const ADMIN_FEATURE_USAGE_KEY = "admin-feature-usage";

/** Every drill-down count at 0; this is the shape `useAdminFeatureUsage`
 *  returns before a live-mode fetch has resolved. Demo mode never renders
 *  this, as its `initialData` below is already the built fixture on the
 *  first render. */
const EMPTY_DRILL_DOWNS: AdminFeatureUsageDTO["drillDowns"] = {
  housingListings: { listings: 0, savedSearches: 0, viewings: 0 },
  forum: { threads: 0, replies: 0 },
  communities: { created: 0, stillPostingThisWeek: 0 },
};

/** The feature-usage panel's assembled data; it has the same keys in demo and
 *  live mode, so the page destructures one consistent object regardless of
 *  `demoMode`. */
export interface AdminFeatureUsageData {
  features: ClassifiedFeature[];
  drillDowns: AdminFeatureUsageDTO["drillDowns"];
  /** False while the backend has no usable reach signal for this range (see
   *  `AdminFeatureUsageDTO.hasReachSignal`). Defaults to `true` before a
   *  live-mode fetch resolves, matching `EMPTY_DRILL_DOWNS`'s "nothing to
   *  report yet" stance, so the loading skeleton shows no notice. */
  hasReachSignal: boolean;
  isLoading: boolean;
  /** True on a failed live-mode fetch (403, 500, network drop). Demo mode
   *  always resolves, so this is only ever true in live mode. The page
   *  branches on it before the stat tiles/legend/table, so a failed request
   *  never renders as a page of confident zeros. */
  isError: boolean;
  /** True while a newly picked range loads and the previous range's data is
   *  still on screen. */
  isStale: boolean;
  /** The resolved range, inclusive days. `null` until the first response. */
  window: FeatureUsageWindow | null;
  /** The launched-feature reach median the classifier used. */
  reachMedian: number;
  /** The specific cause of a failure, for the error line. `null` otherwise. */
  errorCode: FeatureUsageErrorCode | null;
}

function windowFromDto(dto: AdminFeatureUsageDTO): FeatureUsageWindow {
  return {
    rangeDays: dto.rangeDays,
    rangeStart: dto.rangeStart,
    rangeEnd: dto.rangeEnd,
    previousRangeStart: dto.previousRangeStart,
    previousRangeEnd: dto.previousRangeEnd,
    retentionStart: dto.retentionStart,
    isPreviousRangePartial: dto.isPreviousRangePartial,
  };
}

/**
 * Reach and depth per product feature (`GET /admin/feature-usage`, with
 * `rangeDays` for a preset or `from`/`to` for a custom range). Demo mode
 * builds the deterministic fixture (`buildDemoFeatureUsage`) and never
 * reaches the network, mirroring `useAdminOverview`. Live mode fetches the
 * DTO as-is: the backend already classifies each row's `state` and orders the
 * result, so there is no adapter step between the wire shape and what this
 * hook returns. Switching ranges keeps the previous range on screen
 * (`isStale`) until the new one lands.
 *
 * `depth`/`depthTotal` are passed straight through, `null` and all, without
 * defaulting to `0`. The three reach-only features (`feed`, `cinema`,
 * `content`) carry `null` there on purpose; coercing it to `0` would make
 * a feature with nothing to create read as a feature nobody used.
 */
export function useAdminFeatureUsage(
  selection: FeatureUsageRangeSelection,
): AdminFeatureUsageData {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminFeatureUsageDTO>({
    queryKey: [ADMIN_FEATURE_USAGE_KEY, demoMode, rangeSelectionKey(selection)],
    initialData: demoMode ? () => buildDemoFeatureUsage(selection) : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(buildDemoFeatureUsage(selection))
        : getAdminFeatureUsage(selection),
    placeholderData: keepPreviousData,
  });
  const data = query.data;
  const window = useMemo(() => (data ? windowFromDto(data) : null), [data]);

  return {
    features: data?.features ?? [],
    drillDowns: data?.drillDowns ?? EMPTY_DRILL_DOWNS,
    hasReachSignal: data?.hasReachSignal ?? true,
    isLoading: query.isLoading,
    isError: query.isError,
    isStale: query.isPlaceholderData,
    window,
    reachMedian: data?.reachMedian ?? 0,
    errorCode: query.isError ? featureUsageErrorCode(query.error) : null,
  };
}
