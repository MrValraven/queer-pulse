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

export interface StatCard {
  label: string;
  icon: IconType;
  /** Numeric target the value counts up to. */
  value: number;
  /** Render the value with thousands separators. */
  comma?: boolean;
  /** Keep one decimal place (e.g. 3.2). */
  decimal?: boolean;
  prefix?: string;
  suffix?: string;
  trend: { dir: "up" | "down" | "warn"; label: string };
  foot: string;
}

export const METRICS: StatCard[] = [
  {
    label: "Active members",
    icon: FiUsers,
    value: 8412,
    comma: true,
    trend: { dir: "up", label: "▲ 3.9%" },
    foot: "+312 this month",
  },
  {
    label: "Open reports",
    icon: FiShield,
    value: 23,
    trend: { dir: "warn", label: "oldest 14h" },
    foot: "2 are emergencies",
  },
  {
    label: "Median response",
    icon: FiClock,
    value: 3.2,
    decimal: true,
    suffix: "h",
    trend: { dir: "up", label: "▼ well under" },
    foot: "6h SLA target",
  },
  {
    label: "Sustainer MRR",
    icon: FiDollarSign,
    value: 23150,
    comma: true,
    prefix: "€",
    trend: { dir: "up", label: "▲ 4.1%" },
    foot: "1,842 sustainers",
  },
];

// ── "Needs a human" triage queue ────────────────────────────────────────────

export type QueueTone = "danger" | "coral" | "jade" | "amber";

export interface QueueRow {
  title: string;
  sub: string;
  subEm?: string;
  count: number;
  tone: QueueTone;
  icon: IconType;
  to: string;
}

export const TRIAGE_QUEUE: QueueRow[] = [
  {
    title: "Safety emergencies",
    sub: "Outing & doxxing —",
    subEm: "handle these first",
    count: 2,
    tone: "danger",
    icon: FiAlertTriangle,
    to: `${routes.adminModeration}?tab=emergencies`,
  },
  {
    title: "Open reports",
    sub: "Harassment, spam, vouch-abuse",
    count: 21,
    tone: "coral",
    icon: FiMessageSquare,
    to: routes.adminModeration,
  },
  {
    title: "Identity verifications",
    sub: "Members waiting to be welcomed in",
    count: 11,
    tone: "jade",
    icon: FiCheckCircle,
    to: `${routes.adminMembers}?tab=verification`,
  },
  {
    title: "Appeals awaiting decision",
    sub: "Members asking you to look again",
    count: 4,
    tone: "amber",
    icon: FiArchive,
    to: `${routes.adminModeration}?tab=appeals`,
  },
];

// ── Reports-by-type stacked bar (last 8 weeks) ──────────────────────────────

export interface WeekBar {
  week: string;
  /** Stacking order: outing → harassment → spam → vouch. */
  values: [outing: number, harassment: number, spam: number, vouch: number];
}

export const REPORT_WEEKS: WeekBar[] = [
  { week: "w-7", values: [1, 4, 3, 2] },
  { week: "w-6", values: [0, 3, 4, 2] },
  { week: "w-5", values: [2, 5, 3, 1] },
  { week: "w-4", values: [1, 4, 5, 3] },
  { week: "w-3", values: [0, 3, 2, 2] },
  { week: "w-2", values: [2, 6, 3, 2] },
  { week: "last", values: [1, 5, 4, 3] },
  { week: "this", values: [2, 7, 5, 3] },
];

export const REPORT_SERIES = [
  { key: "Outing/doxxing", color: "var(--danger)" },
  { key: "Harassment", color: "var(--accent)" },
  { key: "Spam", color: "var(--amber)" },
  { key: "Vouch-abuse", color: "var(--violet)" },
] as const;

// ── Member growth line ──────────────────────────────────────────────────────

export interface GrowthPoint {
  month: string;
  joined: number;
  churned: number;
  /** Labelled marker on the joined line (e.g. the Pride spike). */
  spike?: string;
}

export const MEMBER_GROWTH: GrowthPoint[] = [
  { month: "Jan", joined: 180, churned: 60 },
  { month: "", joined: 210, churned: 70 },
  { month: "Mar", joined: 240, churned: 55 },
  { month: "", joined: 225, churned: 80 },
  { month: "May", joined: 260, churned: 65 },
  { month: "Jun", joined: 290, churned: 72 },
  { month: "", joined: 520, churned: 120, spike: "Pride" },
  { month: "Aug", joined: 410, churned: 95 },
  { month: "", joined: 360, churned: 70 },
  { month: "Oct", joined: 395, churned: 68 },
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
