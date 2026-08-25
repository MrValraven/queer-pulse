import {
  FiCheckCircle,
  FiUserPlus,
  FiAlertTriangle,
  FiStar,
  FiArchive,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import {
  METRICS,
  TRIAGE_QUEUE,
  REPORT_SERIES,
  type StatCard,
  type QueueRow,
  type WeekBar,
  type GrowthPoint,
  type DistBucket,
  type FeedItem,
  type FeedTone,
} from "../adminDashboard.data";
import type { AdminOverviewDTO } from "./adminOverview.api";

/**
 * Maps the admin-overview DTO (`adminOverview.api.ts`, E1) onto the 5
 * EXISTING dashboard view models the components already render
 * (`adminDashboard.data.ts` + `AdminStatGrid`/`AdminTriageQueue`/
 * `AdminDashboardCharts`/`AdminDashboardFeed`). Follows the
 * `adminMembers.adapters.ts` precedent: the backend emits numbers/enums
 * only, and this file is solely responsible for turning them into the
 * chrome the view models expect — labelKeys/titleKeys/icons/tones for the
 * charts and stat/queue rows (which the components resolve through `t()`
 * themselves), and fully-composed sentences for the live feed (which the
 * component renders verbatim, so this file must call `t()` itself).
 *
 * "Not measured yet": `stats.medianResponseHours`,
 * `stats.communityHealth.averageScore`, `responseTime`, and
 * `memberGrowth.points[].churned` all arrive `null` when nothing has been
 * recorded. Each is represented so E4 can render a not-measured state
 * instead of a fabricated zero:
 *  - the median-response and community-health stat tiles get
 *    `StatCard.notMeasured: true` (value falls back to 0, a safe placeholder
 *    E4 never displays because of the flag);
 *  - `overviewToResponseDist` returns `null` outright;
 *  - `GrowthPoint.churned` is passed through as `null` rather than coerced to
 *    0 — `adminDashboard.data.ts`'s `GrowthPoint.churned` was widened from
 *    `number` to `number | null` for exactly this case (the fixture's own
 *    `MEMBER_GROWTH` values are all plain numbers and stay valid unchanged).
 */

const [
  ACTIVE_MEMBERS_FIXTURE,
  OPEN_REPORTS_FIXTURE,
  MEDIAN_RESPONSE_FIXTURE,
  COMMUNITY_HEALTH_FIXTURE,
] = METRICS as [StatCard, StatCard, StatCard, StatCard];

const [
  SAFETY_EMERGENCIES_FIXTURE,
  OPEN_REPORTS_QUEUE_FIXTURE,
  IDENTITY_VERIFICATIONS_FIXTURE,
  APPEALS_FIXTURE,
] = TRIAGE_QUEUE as [QueueRow, QueueRow, QueueRow, QueueRow];

/* ── 1 · Hero stat tiles ──────────────────────────────────────────────────── */

function percentTrendValue(percent: number, fmt: Formatters): string {
  return fmt.number(Math.abs(percent), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function activeMembersTrend(
  growthPercent: number | null,
  fmt: Formatters,
): StatCard["trend"] {
  if (growthPercent === null) {
    return { dir: "warn", key: "admin:dashboard.metrics.trendNoData" };
  }
  return {
    dir: growthPercent >= 0 ? "up" : "down",
    key: "admin:dashboard.metrics.trendPercent",
    values: { value: percentTrendValue(growthPercent, fmt) },
  };
}

function openReportsTrend(oldestOpenHours: number | null): StatCard["trend"] {
  if (oldestOpenHours === null) {
    return { dir: "warn", key: "admin:dashboard.metrics.trendNoData" };
  }
  return {
    dir: "warn",
    key: "admin:dashboard.metrics.trendOldest",
    values: { hours: `${oldestOpenHours}h` },
  };
}

/** The platform's moderation-response SLA target (matches the fixture's own
 *  `footSlaTarget` copy, "6h SLA target") — the threshold the median-response
 *  tile's trend badge compares the live value against. */
const MEDIAN_RESPONSE_SLA_HOURS = 6;

/** Unlike the other 3 tiles' trends, this one isn't null-vs-live — it's a
 *  live value that can itself be good or bad news, so the badge must be
 *  derived from the number rather than reused verbatim from the fixture
 *  (a live median of, say, 9h is NOT "well under" a 6h SLA). */
function medianResponseTrend(
  medianResponseHours: number | null,
): StatCard["trend"] {
  if (medianResponseHours === null) {
    return { dir: "warn", key: "admin:dashboard.metrics.trendNoData" };
  }
  if (medianResponseHours <= MEDIAN_RESPONSE_SLA_HOURS) {
    return { dir: "up", key: "admin:dashboard.metrics.trendWellUnder" };
  }
  return { dir: "warn", key: "admin:dashboard.metrics.trendOverSla" };
}

/** Mirrors `SUPPORT_HEALTH_THRESHOLD` (`admin-communities-response.ts`) — the
 *  score below which a community is flagged as needing support. Duplicated
 *  as a display-only threshold the same way `MEDIAN_RESPONSE_SLA_HOURS`
 *  above mirrors the backend's SLA target, since the frontend has no import
 *  path into backend source. */
const COMMUNITY_HEALTH_SUPPORT_THRESHOLD = 78;

function communityHealthTrend(averageScore: number | null): StatCard["trend"] {
  if (averageScore === null) {
    return { dir: "warn", key: "admin:dashboard.metrics.trendNoData" };
  }
  if (averageScore >= COMMUNITY_HEALTH_SUPPORT_THRESHOLD) {
    return { dir: "up", key: "admin:dashboard.metrics.trendHealthy" };
  }
  return { dir: "warn", key: "admin:dashboard.metrics.trendNeedsHand" };
}

/** GET /admin/overview → the 4 hero stat tiles. Reuses each fixture tile's
 *  `labelKey`/icon/format-flags (comma/decimal/prefix/suffix/`to`) as its
 *  base and only overrides the live value/trend/foot fields. */
export function overviewToMetrics(
  dto: AdminOverviewDTO,
  fmt: Formatters,
): StatCard[] {
  const medianResponseHours = dto.stats.medianResponseHours;
  const communityHealthAverageScore = dto.stats.communityHealth.averageScore;

  return [
    {
      ...ACTIVE_MEMBERS_FIXTURE,
      value: dto.stats.activeMembers.value,
      trend: activeMembersTrend(dto.stats.activeMembers.growthPercent, fmt),
      footValues: { count: dto.stats.activeMembers.netNewThisMonth },
    },
    {
      ...OPEN_REPORTS_FIXTURE,
      value: dto.stats.openReports.value,
      trend: openReportsTrend(dto.stats.openReports.oldestOpenHours),
      footValues: { count: dto.stats.openReports.emergencies },
    },
    {
      ...MEDIAN_RESPONSE_FIXTURE,
      value: medianResponseHours ?? 0,
      notMeasured: medianResponseHours === null,
      trend: medianResponseTrend(medianResponseHours),
    },
    {
      ...COMMUNITY_HEALTH_FIXTURE,
      value: communityHealthAverageScore ?? 0,
      notMeasured: communityHealthAverageScore === null,
      trend: communityHealthTrend(communityHealthAverageScore),
      footValues: { count: dto.stats.communityHealth.needingSupportCount },
    },
  ];
}

/* ── 2 · "Needs a human" triage queue ─────────────────────────────────────── */

/** GET /admin/overview → the 4 triage-queue rows. Reuses each fixture row's
 *  titleKey/subKey/subEmKey/tone/icon/`to` verbatim and only overrides the
 *  live `count`. */
export function overviewToTriage(dto: AdminOverviewDTO): QueueRow[] {
  return [
    { ...SAFETY_EMERGENCIES_FIXTURE, count: dto.triage.emergencies },
    { ...OPEN_REPORTS_QUEUE_FIXTURE, count: dto.triage.openReports },
    {
      ...IDENTITY_VERIFICATIONS_FIXTURE,
      count: dto.triage.pendingVerifications,
    },
    { ...APPEALS_FIXTURE, count: dto.triage.openAppeals },
  ];
}

/* ── 3 · Reports-by-type stacked bar ──────────────────────────────────────── */

/** Only the last two weeks are real words ("last"/"this"); every earlier
 *  week is a bare numeric offset — mirrors `REPORT_WEEKS`'s own id scheme
 *  (`"-7".."-2", "last", "this"`) for however many weeks the backend sends. */
function weekLabelForIndex(index: number, totalWeeks: number): string {
  if (index === totalWeeks - 1) return "this";
  if (index === totalWeeks - 2) return "last";
  return String(index - (totalWeeks - 1));
}

/** GET /admin/overview → the reports-by-type chart's weeks + legend series.
 *  `series` is the (relabeled) fixture `REPORT_SERIES` — its 4 colors/labelKeys
 *  are chrome, not data, so there's nothing live to substitute. */
export function overviewToReportChart(dto: AdminOverviewDTO): {
  weeks: WeekBar[];
  series: typeof REPORT_SERIES;
} {
  const totalWeeks = dto.reportsByType.weeks.length;
  return {
    weeks: dto.reportsByType.weeks.map((week, index) => ({
      week: weekLabelForIndex(index, totalWeeks),
      values: week.values,
    })),
    series: REPORT_SERIES,
  };
}

/* ── 4 · Member growth line ───────────────────────────────────────────────── */

/** GET /admin/overview → the member-growth line points. `churned` is passed
 *  through as-is (`number | null`) — E4 renders the churn line only where it
 *  has real data, never a fabricated 0. */
export function overviewToMemberGrowth(dto: AdminOverviewDTO): GrowthPoint[] {
  return dto.memberGrowth.points.map((point) => ({
    date: new Date(point.at),
    joined: point.joined,
    churned: point.churned,
    spike: point.spike,
  }));
}

/* ── 5 · Response-time distribution ───────────────────────────────────────── */

/** GET /admin/overview → the response-time distribution buckets, or `null`
 *  when nothing has been resolved yet (no median to bucket) — E4 renders a
 *  not-measured state for `null` rather than an empty/zeroed chart. */
export function overviewToResponseDist(
  dto: AdminOverviewDTO,
): DistBucket[] | null {
  if (dto.responseTime === null) return null;
  return dto.responseTime.buckets.map((bucket) => ({
    label: bucket.label,
    value: bucket.value,
    overSla: bucket.overSla,
  }));
}

/* ── 6 · Live activity feed ────────────────────────────────────────────────── */

interface FeedTypeConfig {
  tone: FeedTone;
  icon: IconType;
}

/** The exact 6 `type` strings `admin-overview.service.ts`'s `assembleFeed`
 *  emits today (verified against backend source, not guessed), mapped to a
 *  tone/icon pair. Kept `Partial`-shaped via the `??` fallback below since
 *  the DTO itself leaves `type` an untyped string — an unmapped future type
 *  (or a typo on the backend side) gets an honest generic line (see
 *  `FEED_GENERIC_CONFIG`/`feedLineFor`) rather than crashing or silently
 *  mislabeling. */
const FEED_TYPE_CONFIG: Partial<Record<string, FeedTypeConfig>> = {
  report_filed: { tone: "danger", icon: FiAlertTriangle },
  report_resolved: { tone: "jade", icon: FiCheckCircle },
  member_joined: { tone: "coral", icon: FiUserPlus },
  vouch_received: { tone: "violet", icon: FiStar },
  community_joined: { tone: "coral", icon: FiUserPlus },
  join_request_submitted: { tone: "amber", icon: FiArchive },
};

const FEED_GENERIC_CONFIG: FeedTypeConfig = {
  tone: "jade",
  icon: FiCheckCircle,
};

function feedTypeConfigFor(type: string): FeedTypeConfig {
  return FEED_TYPE_CONFIG[type] ?? FEED_GENERIC_CONFIG;
}

type FeedEntryDTO = AdminOverviewDTO["feed"][number];

interface FeedLine {
  lead: string;
  body: string;
  em?: string;
  bodyAfter?: string;
}

/** Composes each feed type's `{lead} {body} {em} {bodyAfter}` sentence from
 *  only the DTO's own `actor`/`target`/`community`/`count` — never a
 *  fabricated detail (mirrors `adminMembers.adapters.ts`'s composition
 *  functions). Everything authored here (verbs, connective phrases) resolves
 *  through `t()`; the real names/counts the backend sends go in as-is.
 *
 *  The backend nulls `actor` for an anonymous/erased reporter or moderator,
 *  and currently always nulls `community`/`count` except where noted per
 *  case below — every branch has an honest fallback for the null case
 *  rather than rendering a blank or fabricated name. */
function feedLineFor(entry: FeedEntryDTO, t: TFunction): FeedLine {
  switch (entry.type) {
    // Reporter name, or anonymous/erased — `community` is currently always
    // null for this source, but the field is honored if the backend adds it.
    case "report_filed": {
      const isAnonymous = entry.actor === null;
      return {
        lead:
          entry.actor ??
          t("admin:dashboard.feed.type.reportFiled.anonymousLead"),
        body: isAnonymous
          ? t("admin:dashboard.feed.type.reportFiled.anonymousBody")
          : t("admin:dashboard.feed.type.reportFiled.body"),
        em: entry.community ?? undefined,
        bodyAfter: entry.community ? "." : undefined,
      };
    }
    // The moderator who closed it out, or null for the erased-actor case.
    case "report_resolved":
      return {
        lead:
          entry.actor ??
          t("admin:dashboard.feed.type.reportResolved.anonymousLead"),
        body: t("admin:dashboard.feed.type.reportResolved.body"),
        em: entry.community ?? undefined,
        bodyAfter: entry.community ? "." : undefined,
      };
    // The backend always sends the new member's real name as `actor` today
    // (never an aggregate `count`) — `count` is honored as a fallback lead
    // in case a future aggregated row ever sends one instead.
    case "member_joined": {
      const lead =
        entry.actor ??
        (entry.count !== null
          ? t("admin:dashboard.feed.type.memberJoined.leadCount", {
              count: entry.count,
            })
          : t("admin:dashboard.feed.type.memberJoined.genericLead"));
      return {
        lead,
        body: t("admin:dashboard.feed.type.memberJoined.body"),
        em: entry.community ?? undefined,
        bodyAfter: entry.community ? "." : undefined,
      };
    }
    // `target` is the vouchee, `actor` the voucher — the only feed type
    // where the backend populates `target`.
    case "vouch_received": {
      const lead =
        entry.target ??
        t("admin:dashboard.feed.type.vouchReceived.genericLead");
      if (entry.actor === null) {
        return {
          lead,
          body: t("admin:dashboard.feed.type.vouchReceived.bodyNoActor"),
        };
      }
      return {
        lead,
        body: t("admin:dashboard.feed.type.vouchReceived.body"),
        em: entry.actor,
        bodyAfter: ".",
      };
    }
    // `community` is the one field this source reliably populates.
    case "community_joined":
      return {
        lead:
          entry.actor ??
          t("admin:dashboard.feed.type.communityJoined.genericLead"),
        body: t("admin:dashboard.feed.type.communityJoined.body"),
        em: entry.community ?? undefined,
        bodyAfter: entry.community ? "." : undefined,
      };
    // The applicant's own submitted name — no account/profile exists yet.
    case "join_request_submitted":
      return {
        lead:
          entry.actor ??
          t("admin:dashboard.feed.type.joinRequestSubmitted.genericLead"),
        body: t("admin:dashboard.feed.type.joinRequestSubmitted.body"),
        em: entry.community ?? undefined,
        bodyAfter: entry.community ? "." : undefined,
      };
    default:
      return {
        lead: entry.actor ?? "",
        body: t("admin:dashboard.feed.type.generic.body"),
      };
  }
}

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_DAY = 86_400_000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

/** "2 minutes ago" / "1 hour ago" / "3 days ago" — fully `Intl`-localized via
 *  `fmt.relativeTime`, no hand-rolled English unit words. Feed entries are
 *  always recent, so unlike `adminMembers.adapters.ts`'s
 *  `contributionWhen` there's no absolute-date fallback. */
function feedRelativeTime(isoTimestamp: string, fmt: Formatters): string {
  const atMs = Date.parse(isoTimestamp);
  if (Number.isNaN(atMs)) return "";
  const elapsedMs = Date.now() - atMs;
  const elapsedMinutes = Math.round(elapsedMs / MILLISECONDS_PER_MINUTE);
  if (elapsedMinutes < MINUTES_PER_HOUR) {
    return fmt.relativeTime(-elapsedMinutes, "minute");
  }
  const elapsedHours = Math.round(elapsedMs / MILLISECONDS_PER_HOUR);
  if (elapsedHours < HOURS_PER_DAY) {
    return fmt.relativeTime(-elapsedHours, "hour");
  }
  const elapsedDays = Math.round(elapsedMs / MILLISECONDS_PER_DAY);
  return fmt.relativeTime(-elapsedDays, "day");
}

/** GET /admin/overview → the live activity feed. Maps each entry's `type` to
 *  a `{tone, icon}` pair and composes its sentence from
 *  actor/target/community/count; `time` is a relative string from `at`, `to`
 *  is the DTO's own `route` verbatim. */
export function overviewToFeed(
  dto: AdminOverviewDTO,
  t: TFunction,
  fmt: Formatters,
): FeedItem[] {
  return dto.feed.map((entry) => {
    const { tone, icon } = feedTypeConfigFor(entry.type);
    const line = feedLineFor(entry, t);
    return {
      id: entry.id,
      tone,
      icon,
      lead: line.lead,
      body: line.body,
      em: line.em,
      bodyAfter: line.bodyAfter,
      time: feedRelativeTime(entry.at, fmt),
      to: entry.route,
    };
  });
}

/* ── Shared chart helper ───────────────────────────────────────────────────── */

/** A "nice" (1/2/5 × 10^n) axis max at or above `values`' max, so a chart
 *  drawn against live data never clips the way it would against the fixture's
 *  hardcoded axis max (14 / 560 / 80). Returns 10 for an empty/all-zero
 *  input rather than 0, so a chart with no data yet still has a sane axis. */
export function chartMax(values: number[]): number {
  const dataMax = values.length > 0 ? Math.max(...values) : 0;
  if (dataMax <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(dataMax));
  const normalized = dataMax / magnitude;
  const niceNormalized =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}
