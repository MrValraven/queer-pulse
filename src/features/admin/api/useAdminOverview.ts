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
import { getAdminOverview, type AdminOverviewDTO } from "./adminOverview.api";

const ADMIN_OVERVIEW_KEY = "admin-overview";

/** The dashboard's assembled data shape — same keys in demo and live mode,
 *  so `AdminOverviewPage` (E4) destructures one consistent object regardless
 *  of `demoMode`. */
export interface AdminOverviewData {
  metrics: StatCard[];
  triage: QueueRow[];
  /**
   * The same four triage numbers as plain counts. `triage` above is the
   * dashboard's rendered rows (label key, tone, icon, route); this is what a
   * reader that only wants a number should take, so it never has to index into
   * a presentation array or match on a catalog key to find one.
   *
   * `useAdminNavBadges` reads `openReports` from here (ENG-180). The rail badge
   * used to mount the whole `useModReports()` queue on every admin page — a
   * hydrated first page of reports, with reporter, reported, credibility and
   * community lookups, plus the resolved tab — purely to read a count that
   * `GET /admin/overview` already returns. Both numbers count reports in
   * status `open` or `escalated` (`ModerationService.computeCounts` and
   * `AdminOverviewService.getOverview` filter identically), so the badge shows
   * exactly what it showed before.
   */
  triageCounts: AdminOverviewDTO["triage"];
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
  // Read off the fixture rows in the same order `overviewToTriage` writes
  // them, so the demo rail badge and the demo dashboard row can never disagree
  // about how many reports are open.
  triageCounts: {
    emergencies: TRIAGE_QUEUE[0]?.count ?? 0,
    openReports: TRIAGE_QUEUE[1]?.count ?? 0,
    pendingVerifications: TRIAGE_QUEUE[2]?.count ?? 0,
    openAppeals: TRIAGE_QUEUE[3]?.count ?? 0,
  },
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
export function useAdminOverview({
  isEnabled = true,
}: {
  /**
   * `GET /admin/overview` is `@Roles(Admin)` alone, while the admin rail
   * renders for moderators and grant holders too. A caller that can be
   * mounted by one of those passes `false` so the query never fires a request
   * that would 403 — see `useAdminNavBadges`. Demo mode never touches the
   * network either way, so its fixtures still resolve.
   */
  isEnabled?: boolean;
} = {}) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<AdminOverviewData>({
    queryKey: [ADMIN_OVERVIEW_KEY, demoMode, language],
    enabled: isEnabled,
    initialData: demoMode ? DEMO_OVERVIEW : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_OVERVIEW;
      const overviewDto = await getAdminOverview();
      const reportChart = overviewToReportChart(overviewDto);
      return {
        metrics: overviewToMetrics(overviewDto, fmt),
        triage: overviewToTriage(overviewDto),
        triageCounts: overviewDto.triage,
        reportWeeks: reportChart.weeks,
        reportSeries: reportChart.series,
        memberGrowth: overviewToMemberGrowth(overviewDto),
        responseDist: overviewToResponseDist(overviewDto),
        feed: overviewToFeed(overviewDto, t, fmt),
      };
    },
  });
}
