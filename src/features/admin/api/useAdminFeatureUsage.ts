import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_FEATURE_USAGE } from "../adminFeatureUsage.data";
import {
  getAdminFeatureUsage,
  type AdminFeatureUsageDTO,
  type ClassifiedFeature,
} from "./adminFeatureUsage.api";

const ADMIN_FEATURE_USAGE_KEY = "admin-feature-usage";

/** Every drill-down count at 0; this is the shape `useAdminFeatureUsage`
 *  returns before a live-mode fetch has resolved. Demo mode never renders
 *  this, as its `initialData` below is already the assembled fixture on the
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
   *  report yet" stance rather than showing a notice during the loading
   *  skeleton. */
  hasReachSignal: boolean;
  isLoading: boolean;
  /** True on a failed live-mode fetch (403, 500, network drop). Demo mode's
   *  `queryFn` always resolves, so this is only ever true in live mode. The
   *  page branches on it before the stat tiles/legend/table, rather than
   *  rendering a page of confident zeros with nothing saying the request
   *  failed. */
  isError: boolean;
}

/**
 * Reach and depth per product feature (`GET /admin/feature-usage?rangeDays=`).
 * Demo mode returns the colocated fixture (`DEMO_FEATURE_USAGE`) and never
 * reaches the network, mirroring `useAdminOverview`. Live mode fetches the
 * DTO as-is: the backend already classifies each row's `state` and orders the
 * result, so there is no adapter step between the wire shape and what this
 * hook returns.
 *
 * `depth`/`depthTotal` are passed straight through, `null` and all, without
 * defaulting to `0`. The three reach-only features (`feed`, `cinema`,
 * `content`) carry `null` there on purpose; coercing it to `0` would make
 * a feature with nothing to create read as a feature nobody used.
 */
export function useAdminFeatureUsage(rangeDays: number): AdminFeatureUsageData {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminFeatureUsageDTO>({
    queryKey: [ADMIN_FEATURE_USAGE_KEY, demoMode, rangeDays],
    initialData: demoMode ? DEMO_FEATURE_USAGE : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(DEMO_FEATURE_USAGE)
        : getAdminFeatureUsage(rangeDays),
  });

  return {
    features: query.data?.features ?? [],
    drillDowns: query.data?.drillDowns ?? EMPTY_DRILL_DOWNS,
    hasReachSignal: query.data?.hasReachSignal ?? true,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
