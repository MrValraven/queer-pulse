import {
  FiUsers,
  FiShield,
  FiClock,
  FiDollarSign,
  FiAlertTriangle,
  FiMessageSquare,
  FiCheckCircle,
  FiArchive,
  FiUserPlus,
  FiStar,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes, adminCommunityMod } from "../../app/routeMap";

// ── Hero stats ────────────────────────────────────────────────────────────────

/**
 * i18n Pattern A. `labelKey` resolves the stat name; `trend`/`foot` hold a
 * catalog key plus the interpolation values (count/hours/percent) rather than
 * a baked English phrase — AdminStatGrid.tsx renders the direction arrow
 * itself from `trend.dir` (a symbol, not language) and resolves the rest
 * through `t()`.
 */
export interface StatCard {
  labelKey: string;
  icon: IconType;
  /** Numeric target the value counts up to. */
  value: number;
  /** Render the value with thousands separators. */
  comma?: boolean;
  /** Keep one decimal place (e.g. 3.2). */
  decimal?: boolean;
  prefix?: string;
  suffix?: string;
  trend: {
    dir: "up" | "down" | "warn";
    key: string;
    values?: Record<string, string | number>;
  };
  footKey: string;
  footValues?: Record<string, string | number>;
  /** True when the backing metric has no data yet (e.g. no sustainer
   *  payments/resolved reports recorded) — E4 renders "not measured yet"
   *  instead of counting up `value` (which stays 0 as a safe placeholder). */
  notMeasured?: boolean;
}

export const METRICS: StatCard[] = [
  {
    labelKey: "admin:dashboard.metrics.activeMembers.label",
    icon: FiUsers,
    value: 8412,
    comma: true,
    trend: {
      dir: "up",
      key: "admin:dashboard.metrics.trendPercent",
      values: { value: "3.9" },
    },
    footKey: "admin:dashboard.metrics.footGrowth",
    footValues: { count: 312 },
  },
  {
    labelKey: "admin:dashboard.metrics.openReports.label",
    icon: FiShield,
    value: 23,
    trend: {
      dir: "warn",
      key: "admin:dashboard.metrics.trendOldest",
      values: { hours: "14h" },
    },
    footKey: "admin:dashboard.metrics.footEmergencies",
    footValues: { count: 2 },
  },
  {
    labelKey: "admin:dashboard.metrics.medianResponse.label",
    icon: FiClock,
    value: 3.2,
    decimal: true,
    suffix: "h",
    trend: { dir: "up", key: "admin:dashboard.metrics.trendWellUnder" },
    footKey: "admin:dashboard.metrics.footSlaTarget",
    footValues: { hours: "6h" },
  },
  {
    labelKey: "admin:dashboard.metrics.sustainerMrr.label",
    icon: FiDollarSign,
    value: 23150,
    comma: true,
    prefix: "€",
    trend: {
      dir: "up",
      key: "admin:dashboard.metrics.trendPercent",
      values: { value: "4.1" },
    },
    footKey: "admin:dashboard.metrics.footSustainers",
    footValues: { count: 1842 },
  },
];

// ── "Needs a human" triage queue ────────────────────────────────────────────

export type QueueTone = "danger" | "coral" | "jade" | "amber";

/** i18n Pattern A — `titleKey`/`subKey`/`subEmKey` are platform chrome. */
export interface QueueRow {
  titleKey: string;
  subKey: string;
  subEmKey?: string;
  count: number;
  tone: QueueTone;
  icon: IconType;
  to: string;
}

export const TRIAGE_QUEUE: QueueRow[] = [
  {
    titleKey: "admin:dashboard.triage.safetyEmergencies.title",
    subKey: "admin:dashboard.triage.safetyEmergencies.sub",
    subEmKey: "admin:dashboard.triage.safetyEmergencies.subEm",
    count: 2,
    tone: "danger",
    icon: FiAlertTriangle,
    to: `${routes.adminModeration}?tab=emergencies`,
  },
  {
    titleKey: "admin:dashboard.triage.openReports.title",
    subKey: "admin:dashboard.triage.openReports.sub",
    count: 21,
    tone: "coral",
    icon: FiMessageSquare,
    to: routes.adminModeration,
  },
  {
    titleKey: "admin:dashboard.triage.identityVerifications.title",
    subKey: "admin:dashboard.triage.identityVerifications.sub",
    count: 11,
    tone: "jade",
    icon: FiCheckCircle,
    to: `${routes.adminMembers}?tab=verification`,
  },
  {
    titleKey: "admin:dashboard.triage.appeals.title",
    subKey: "admin:dashboard.triage.appeals.sub",
    count: 4,
    tone: "amber",
    icon: FiArchive,
    to: `${routes.adminModeration}?tab=appeals`,
  },
];

// ── Reports-by-type stacked bar (last 8 weeks) ──────────────────────────────

export interface WeekBar {
  /** Stable id for the React key. Numeric ids ("-7".."-2") are axis ticks, not
   *  language; "last"/"this" resolve through WEEK_LABEL_KEYS below since those
   *  two are real English words shown to the moderator. */
  week: string;
  /** Stacking order: outing → harassment → spam → other. */
  values: [outing: number, harassment: number, spam: number, other: number];
}

export const REPORT_WEEKS: WeekBar[] = [
  { week: "-7", values: [1, 4, 3, 2] },
  { week: "-6", values: [0, 3, 4, 2] },
  { week: "-5", values: [2, 5, 3, 1] },
  { week: "-4", values: [1, 4, 5, 3] },
  { week: "-3", values: [0, 3, 2, 2] },
  { week: "-2", values: [2, 6, 3, 2] },
  { week: "last", values: [1, 5, 4, 3] },
  { week: "this", values: [2, 7, 5, 3] },
];

/** Only "last"/"this" are real words; other ids render as-is (bare offsets). */
export const WEEK_LABEL_KEYS: Partial<Record<string, string>> = {
  last: "admin:dashboard.charts.week.last",
  this: "admin:dashboard.charts.week.this",
};

/** i18n Pattern A — `id` is a stable React key, `labelKey` resolves the legend text. */
export const REPORT_SERIES = [
  {
    id: "outing",
    labelKey: "admin:dashboard.charts.series.outing",
    color: "var(--danger)",
  },
  {
    id: "harassment",
    labelKey: "admin:dashboard.charts.series.harassment",
    color: "var(--accent)",
  },
  {
    id: "spam",
    labelKey: "admin:dashboard.charts.series.spam",
    color: "var(--amber)",
  },
  {
    // Relabeled from "vouch abuse" — the backend's 4th `reportsByType` bucket
    // is a general catch-all, not specifically vouch-abuse reports.
    id: "other",
    labelKey: "admin:dashboard.charts.series.other",
    color: "var(--violet)",
  },
] as const;

// ── Member growth line ──────────────────────────────────────────────────────

export interface GrowthPoint {
  /** `null` means "no tick label at this point" (design keeps the axis sparse). */
  date: Date | null;
  joined: number;
  /** `null` means "not measured yet" (no churn data recorded for this
   *  period) — E4 renders the churn line only across points with a real
   *  number, never a fabricated 0. */
  churned: number | null;
  /** True on the labelled marker point (the Pride spike). */
  spike?: boolean;
}

/**
 * i18n note: `date` is a real `Date` so `MemberGrowthChart` can format ticks
 * through `useFormat().date(..., { month: "short" })` — no hand-rolled
 * English month-abbreviation array (the exact trap `gatherings` hit first).
 */
export const MEMBER_GROWTH: GrowthPoint[] = [
  { date: new Date(2026, 0, 1), joined: 180, churned: 60 },
  { date: null, joined: 210, churned: 70 },
  { date: new Date(2026, 2, 1), joined: 240, churned: 55 },
  { date: null, joined: 225, churned: 80 },
  { date: new Date(2026, 4, 1), joined: 260, churned: 65 },
  { date: new Date(2026, 5, 1), joined: 290, churned: 72 },
  { date: null, joined: 520, churned: 120, spike: true },
  { date: new Date(2026, 7, 1), joined: 410, churned: 95 },
  { date: null, joined: 360, churned: 70 },
  { date: new Date(2026, 9, 1), joined: 395, churned: 68 },
];

// ── Response-time distribution ──────────────────────────────────────────────

export interface DistBucket {
  label: string;
  value: number;
  /** True once the bucket is past the 6h SLA. */
  overSla: boolean;
}

export const RESPONSE_DIST: DistBucket[] = [
  { label: "<1h", value: 34, overSla: false },
  { label: "1–2h", value: 58, overSla: false },
  { label: "2–4h", value: 71, overSla: false },
  { label: "4–6h", value: 40, overSla: false },
  { label: "6–8h", value: 14, overSla: true },
  { label: "8h+", value: 7, overSla: true },
];

// ── Live activity feed ──────────────────────────────────────────────────────

export type FeedTone = "jade" | "coral" | "danger" | "violet" | "amber";

export interface FeedItem {
  id: string;
  tone: FeedTone;
  icon: IconType;
  /** Lead actor / subject, rendered bold. */
  lead: string;
  /** Remaining sentence; the emphasised fragment is wrapped in <em>. */
  body: string;
  em?: string;
  bodyAfter?: string;
  time: string;
  to: string;
}

export const ACTIVITY_FEED: FeedItem[] = [
  {
    id: "f1",
    tone: "jade",
    icon: FiCheckCircle,
    lead: "Inês M.",
    body: "resolved a harassment report in",
    em: "Trans & Friends",
    bodyAfter: "— restricted for 7 days.",
    time: "2 min ago",
    to: routes.adminModeration,
  },
  {
    id: "f2",
    tone: "coral",
    icon: FiUserPlus,
    lead: "3 new members",
    body: "joined via vouch from",
    em: "Queer Creatives",
    bodyAfter: ".",
    time: "11 min ago",
    to: routes.adminMembers,
  },
  {
    id: "f3",
    tone: "danger",
    icon: FiAlertTriangle,
    lead: "Emergency report",
    body: "filed — possible",
    em: "outing",
    bodyAfter: "in a public thread. Auto-escalated.",
    time: "26 min ago",
    to: `${routes.adminModeration}?tab=emergencies`,
  },
  {
    id: "f4",
    tone: "jade",
    icon: FiCheckCircle,
    lead: "Marco V.",
    body: "was identity-verified by",
    em: "Júlia S.",
    bodyAfter: "",
    time: "42 min ago",
    to: `${routes.adminMembers}?tab=verification`,
  },
  {
    id: "f5",
    tone: "violet",
    icon: FiStar,
    lead: "Devon O.",
    body: "received their",
    em: "10th vouch",
    bodyAfter: "— now a trusted member.",
    time: "1h ago",
    to: routes.adminMembers,
  },
  {
    id: "f6",
    tone: "amber",
    icon: FiArchive,
    lead: "Appeal opened",
    body: "by a member restricted in",
    em: "Lisbon Queers",
    bodyAfter: ".",
    time: "1h ago",
    to: adminCommunityMod("queer-social"),
  },
];
