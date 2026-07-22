import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  METRICS,
  TRIAGE_QUEUE,
  REPORT_WEEKS,
  REPORT_SERIES,
  MEMBER_GROWTH,
  RESPONSE_DIST,
  ACTIVITY_FEED,
  type StatCard,
  type QueueRow,
  type WeekBar,
  type GrowthPoint,
  type DistBucket,
  type FeedItem,
} from "../adminDashboard.data";
import {
  overviewToMetrics,
  overviewToTriage,
  overviewToReportChart,
  overviewToMemberGrowth,
  overviewToResponseDist,
  overviewToFeed,
} from "./adminOverview.adapters";
import { getAdminOverview } from "./adminOverview.api";

const ADMIN_OVERVIEW_KEY = "admin-overview";

/** The dashboard's assembled data shape — same keys in demo and live mode,
 *  so `AdminOverviewPage` (E4) destructures one consistent object regardless
 *  of `demoMode`. */
export interface AdminOverviewData {
  metrics: StatCard[];
  triage: QueueRow[];
  reportWeeks: WeekBar[];
  reportSeries: typeof REPORT_SERIES;
  memberGrowth: GrowthPoint[];
  responseDist: DistBucket[] | null;
  feed: FeedItem[];
}

/** The demo fixtures assembled to the exact same shape the live path
 *  produces — a stable module-level const, since the fixtures themselves are
 *  language-independent (their i18n keys are resolved later by the
 *  components, not here). */
const DEMO_OVERVIEW: AdminOverviewData = {
  metrics: METRICS,
  triage: TRIAGE_QUEUE,
  reportWeeks: REPORT_WEEKS,
  reportSeries: REPORT_SERIES,
  memberGrowth: MEMBER_GROWTH,
  responseDist: RESPONSE_DIST,
  feed: ACTIVITY_FEED,
};

/**
 * The admin dashboard overview: hero stat tiles, triage queue, reports-by-type
 * chart, member-growth line, response-time distribution, and the live
 * activity feed — assembled from a single `GET /admin/overview` DTO via the
 * E2 adapters. Demo mode returns the colocated fixtures (assembled into the
 * same shape) and never hits the network, mirroring `useAdminCommunities`.
 *
 * `language` sits in the query key alongside `demoMode` because the live
 * adapters (`overviewToMetrics`/`overviewToFeed`) resolve i18n keys and
 * locale-format numbers/relative-time through `t`/`fmt` — a language switch
 * must re-map the already-fetched DTO, not just re-render stale strings.
 * Demo mode's fixtures hold i18n KEYS resolved later by the components, so
 * demo output is language-independent, but keeping `language` in the key here
 * too is harmless and keeps the pattern consistent with `useAdminCommunities`.
 */
export function useAdminOverview() {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<AdminOverviewData>({
    queryKey: [ADMIN_OVERVIEW_KEY, demoMode, language],
    initialData: demoMode ? DEMO_OVERVIEW : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_OVERVIEW;
      const overviewDto = await getAdminOverview();
      const reportChart = overviewToReportChart(overviewDto);
      return {
        metrics: overviewToMetrics(overviewDto, fmt),
        triage: overviewToTriage(overviewDto),
        reportWeeks: reportChart.weeks,
        reportSeries: reportChart.series,
        memberGrowth: overviewToMemberGrowth(overviewDto),
        responseDist: overviewToResponseDist(overviewDto),
        feed: overviewToFeed(overviewDto, t, fmt),
      };
    },
  });
}
