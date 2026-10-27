import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { buildDemoFeatureUsageDetail } from "../adminFeatureUsageDemo";
import {
  rangeSelectionKey,
  type FeatureUsageRangeSelection,
} from "../featureUsageRange";
import {
  getAdminFeatureUsageDetail,
  type AdminFeatureUsageDetailDTO,
} from "./adminFeatureUsage.api";
import {
  featureUsageErrorCode,
  type FeatureUsageErrorCode,
} from "./featureUsageErrorCode";

const ADMIN_FEATURE_USAGE_DETAIL_KEY = "admin-feature-usage-detail";

export interface AdminFeatureUsageDetailData {
  /** Rows created per day over the range, oldest first. `null` for a
   *  reach-only feature, and before the response lands. */
  createdDaily: number[] | null;
  /** The first day `createdDaily` counts (inclusive, YYYY-MM-DD), as the
   *  response states it. `null` before a response lands. */
  rangeStart: string | null;
  isLoading: boolean;
  /** No response yet (TanStack v5 `isPending`), fetching or paused. */
  isPending: boolean;
  /** The fetch is waiting for a connection (`fetchStatus === "paused"`). */
  isPaused: boolean;
  isError: boolean;
  /** The specific cause of a failure, for the panel's error line. */
  errorCode: FeatureUsageErrorCode | null;
}

/**
 * One feature's created-per-day series
 * (`GET /admin/feature-usage/:featureKey/detail`), fetched only once a row
 * expands (`options.isEnabled`) and kept fresh for five minutes, since the
 * counted days are all in the past. Demo mode builds the matching fixture
 * (`buildDemoFeatureUsageDetail`, which sums to the main fixture's `depth`)
 * and never reaches the network.
 */
export function useAdminFeatureUsageDetail(
  featureKey: string,
  selection: FeatureUsageRangeSelection,
  options: { isEnabled: boolean },
): AdminFeatureUsageDetailData {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminFeatureUsageDetailDTO>({
    queryKey: [
      ADMIN_FEATURE_USAGE_DETAIL_KEY,
      demoMode,
      featureKey,
      rangeSelectionKey(selection),
    ],
    queryFn: () =>
      demoMode
        ? Promise.resolve(buildDemoFeatureUsageDetail(featureKey, selection))
        : getAdminFeatureUsageDetail(featureKey, selection),
    enabled: options.isEnabled,
    staleTime: 5 * 60_000,
  });

  return {
    createdDaily: query.data?.createdDaily ?? null,
    rangeStart: query.data?.rangeStart ?? null,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isPaused: query.fetchStatus === "paused",
    isError: query.isError,
    errorCode: query.isError ? featureUsageErrorCode(query.error) : null,
  };
}
