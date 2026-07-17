import {
  FiHeart,
  FiServer,
  FiLifeBuoy,
  FiActivity,
  FiBookOpen,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { AdminTone } from "./ui";
import { routes } from "../../app/routeMap";

// ── Finances ────────────────────────────────────────────────────────────────

export interface FinanceStat {
  labelKey: string;
  /** Numeric count-up target. */
  value: number;
  prefix?: string;
  suffix?: string;
  comma?: boolean;
  /** Highlight the number in jade (e.g. the surplus). */
  jade?: boolean;
  footKey: string;
  /** `{token}` interpolation values for `footKey`, if any. */
  footValues?: Record<string, string | number>;
}

export const FINANCE_STATS: FinanceStat[] = [
  {
    labelKey: "governance.finances.stat.sustainerMrr",
    value: 23150,
    prefix: "€",
    comma: true,
    footKey: "governance.finances.foot.sustainersCount",
    footValues: { count: 1842 },
  },
  {
    labelKey: "governance.finances.stat.totalIncome",
    value: 34370,
    prefix: "€",
    comma: true,
    footKey: "governance.finances.foot.sources",
  },
  {
    labelKey: "governance.finances.stat.surplus",
    value: 4870,
    prefix: "€",
    comma: true,
    jade: true,
    footKey: "governance.finances.foot.reserve",
  },
  {
    labelKey: "governance.finances.stat.solidarity",
    value: 18,
    suffix: "%",
    footKey: "governance.finances.foot.solidarityRate",
  },
];

/** Token colour keys mapped to CSS-module meter classes in the component. */
export type LedgerColor = "coral" | "violet" | "jade" | "amber" | "plum";

export interface LedgerRow {
  labelKey: string;
  /** Euro amount — resolve for display with `fmt.currency()`. */
  amount: number;
  /** Bar width as a percentage of the largest line. */
  width: number;
  color: LedgerColor;
}

/** Where every euro goes — widest line (honoraria) is the 100% reference. */
export const LEDGER: LedgerRow[] = [
  {
    labelKey: "governance.ledger.moderatorHonoraria",
    amount: 9600,
    width: 100,
    color: "coral",
  },
  {
    labelKey: "governance.ledger.platformTools",
    amount: 7200,
    width: 75,
    color: "plum",
  },
  {
    labelKey: "governance.ledger.mutualAid",
    amount: 6500,
    width: 68,
    color: "jade",
  },
  {
    labelKey: "governance.ledger.mentalHealth",
    amount: 3800,
    width: 40,
    color: "violet",
  },
  {
    labelKey: "governance.ledger.magazine",
    amount: 2400,
    width: 25,
    color: "amber",
  },
];

/** Where every euro comes from. */
export const INCOME_LEDGER: LedgerRow[] = [
  {
    labelKey: "governance.ledger.memberSustainers",
    amount: 23150,
    width: 67,
    color: "coral",
  },
  {
    labelKey: "governance.ledger.partnerGrants",
    amount: 6400,
    width: 19,
    color: "jade",
  },
  {
    labelKey: "governance.ledger.gatheringTickets",
    amount: 4820,
    width: 14,
    color: "violet",
  },
];

// ── Income vs spending by quarter ─────────────────────────────────────────────

export interface QuarterPoint {
  label: string;
  /** €k income. */
  income: number;
  /** €k spending. */
  spend: number;
}

/** Axis top + gridline steps (€k) for the grouped-bar chart. */
export const QUARTER_AXIS_MAX = 40;
export const QUARTER_GRIDLINES = [0, 10, 20, 30, 40];

export const QUARTERS: QuarterPoint[] = [
  { label: "Q1 25", income: 27.6, spend: 25.8 },
  { label: "Q2 25", income: 29.1, spend: 26.9 },
  { label: "Q3 25", income: 30.4, spend: 27.6 },
  { label: "Q4 25", income: 31.8, spend: 28.4 },
  { label: "Q1 26", income: 33.4, spend: 29.0 },
  { label: "Q2 26", income: 34.37, spend: 29.5 },
];

/** Canonical range ids — never translated (compared directly by the chart). */
export type QuarterRangeId = "4q" | "6q" | "all";
export const QUARTER_RANGE_IDS: QuarterRangeId[] = ["4q", "6q", "all"];

// ── Policy & versions ─────────────────────────────────────────────────────────

export interface CareVersion {
  version: string;
  date: string;
  note: string;
  badge?: string;
  badgeTone?: AdminTone;
  current?: boolean;
}

export const CARE_VERSIONS: CareVersion[] = [
  {
    version: "v4.2",
    date: "Ratified by the Annual Assembly · 12 Jun 2026 · 89% in favour",
    note: "Added an explicit clause naming deadnaming and outing as severe harm, with mandatory content removal. Proposed by the Trans & Friends moderators.",
    badge: "Current",
    badgeTone: "jade",
    current: true,
  },
  {
    version: "v4.1",
    date: "14 Mar 2026 · minor revision",
    note: "Clarified the appeals window from 7 to 14 days after member feedback.",
  },
  {
    version: "v4.0",
    date: "8 Jan 2026 · full community vote",
    note: "A complete rewrite in plain, warm language. Reframed moderation around care and restoration rather than punishment.",
    badge: "Major",
    badgeTone: "violet",
  },
  {
    version: "v3.3",
    date: "2 Oct 2025",
    note: "Added the anonymous-reporting protection guarantee.",
  },
];

/** Chrome principle keys — resolve each with `t()`. */
export const PRINCIPLE_KEYS: string[] = [
  "governance.policy.principle.noSell",
  "governance.policy.principle.visibility",
  "governance.policy.principle.noSilent",
  "governance.policy.principle.accessNeverConditional",
];

// ── Audit log ─────────────────────────────────────────────────────────────────

export type AuditTone = AdminTone;

/**
 * Coarse action category used by the audit-log action filter — a stable
 * canonical id, never displayed or translated directly. Resolve its label via
 * `t(`admin:governance.audit.actionType.${type}`)`.
 */
export type AuditType =
  | "removed"
  | "restricted"
  | "warned"
  | "dismissed"
  | "verified"
  | "appeal"
  | "policy"
  | "froze";

/**
 * Time-bucket used by the audit-log range filter — a stable canonical id,
 * never displayed or translated directly. Resolve its label via
 * `t(`admin:governance.audit.range.${range}`)`.
 */
export type AuditRange = "today" | "thisWeek" | "thisQuarter";

export interface AuditEntry {
  id: string;
  modName: string;
  modInitials: string;
  modTone: "plum" | "coral" | "jade" | "violet" | "amber" | "anon";
  action: string;
  actionTone: AuditTone;
  type: AuditType;
  subject: string;
  reason: string;
  when: string;
  range: AuditRange;
  /** Deep-link to the underlying record. */
  link: { label: string; to: string };
}

export const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: "a1",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Removed + banned",
    actionTone: "danger",
    type: "removed",
    subject: "@anon_4471",
    reason:
      "Doxxing — home address shared with a threat. Member offered safety resources.",
    when: "9 min ago",
    range: "today",
    link: { label: "Report #4471", to: routes.adminModeration },
  },
  {
    id: "a2",
    modName: "Inês Martins",
    modInitials: "IM",
    modTone: "jade",
    action: "Restricted · 7 days",
    actionTone: "amber",
    type: "restricted",
    subject: "@member·redacted",
    reason: "Repeated DMs after a clear no. Notified with policy excerpt.",
    when: "2 min ago",
    range: "today",
    link: { label: "Report #4480", to: routes.adminModeration },
  },
  {
    id: "a3",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Dismissed",
    actionTone: "coral",
    type: "dismissed",
    subject: "report #4471",
    reason:
      "Genuine community gathering, not spam. Reporter thanked for caution.",
    when: "1h ago",
    range: "today",
    link: { label: "Report #4471", to: routes.adminModeration },
  },
  {
    id: "a4",
    modName: "System",
    modInitials: "SY",
    modTone: "plum",
    action: "Auto-froze account",
    actionTone: "amber",
    type: "froze",
    subject: "@anon_4471",
    reason:
      "New account, 0 vouches, flagged for doxxing. Held for human review.",
    when: "1h ago",
    range: "today",
    link: { label: "Member @anon_4471", to: routes.adminMembers },
  },
  {
    id: "a5",
    modName: "Sofia Almeida",
    modInitials: "SA",
    modTone: "amber",
    action: "Warned",
    actionTone: "coral",
    type: "warned",
    subject: "@coin_daily",
    reason: "First spam offence. Friendly warning + link removed.",
    when: "3h ago",
    range: "today",
    link: { label: "Report #4468", to: routes.adminModeration },
  },
  {
    id: "a6",
    modName: "Inês Martins",
    modInitials: "IM",
    modTone: "jade",
    action: "Verified",
    actionTone: "jade",
    type: "verified",
    subject: "Marco Vieira",
    reason: "Two vouches confirmed. Welcomed in.",
    when: "5h ago",
    range: "today",
    link: { label: "Member Marco V.", to: routes.adminMembers },
  },
  {
    id: "a7",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Upheld appeal",
    actionTone: "violet",
    type: "appeal",
    subject: "@dovgrey",
    reason:
      "Context was missed on first review. Restriction lifted, apology sent.",
    when: "yesterday",
    range: "thisWeek",
    link: { label: "Appeal A-118", to: routes.adminModeration },
  },
  {
    id: "a8",
    modName: "Kai Sousa",
    modInitials: "KS",
    modTone: "plum",
    action: "Edited policy",
    actionTone: "violet",
    type: "policy",
    subject: "Code of Care v4.2",
    reason: "Added deadnaming clause per Assembly vote.",
    when: "12 Jun",
    range: "thisQuarter",
    link: { label: "Policy v4.2", to: routes.adminGovernance },
  },
  {
    id: "a9",
    modName: "Sofia Almeida",
    modInitials: "SA",
    modTone: "amber",
    action: "Restricted · 30 days",
    actionTone: "amber",
    type: "restricted",
    subject: "@p.costa",
    reason:
      "Second misgendering after a warning. Restricted, pointed to the pronoun guide.",
    when: "11 Jun",
    range: "thisQuarter",
    link: { label: "Report #4402", to: routes.adminModeration },
  },
  {
    id: "a10",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Overturned appeal",
    actionTone: "jade",
    type: "appeal",
    subject: "@studio.vera",
    reason:
      '"Spam" link was a mutual-aid fund. Warning removed, member thanked.',
    when: "10 Jun",
    range: "thisQuarter",
    link: { label: "Appeal A-116", to: routes.adminModeration },
  },
  {
    id: "a11",
    modName: "Inês Martins",
    modInitials: "IM",
    modTone: "jade",
    action: "Removed content",
    actionTone: "danger",
    type: "removed",
    subject: "@throwaway_22",
    reason: "Slur in a public comment. Removed, member warned with the clause.",
    when: "8 Jun",
    range: "thisQuarter",
    link: { label: "Report #4388", to: routes.adminModeration },
  },
  {
    id: "a12",
    modName: "System",
    modInitials: "SY",
    modTone: "plum",
    action: "Flagged vouch ring",
    actionTone: "violet",
    type: "froze",
    subject: "5 accounts",
    reason: "Closed-loop vouching detected. Surfaced for human review.",
    when: "7 Jun",
    range: "thisQuarter",
    link: { label: "Report #4381", to: routes.adminModeration },
  },
  {
    id: "a13",
    modName: "Sofia Almeida",
    modInitials: "SA",
    modTone: "amber",
    action: "Verified",
    actionTone: "jade",
    type: "verified",
    subject: "Rui Antunes",
    reason: "Held for a second vouch, then welcomed in once confirmed.",
    when: "5 Jun",
    range: "thisQuarter",
    link: { label: "Member Rui A.", to: routes.adminMembers },
  },
  {
    id: "a14",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Dismissed",
    actionTone: "coral",
    type: "dismissed",
    subject: "report #4360",
    reason:
      "Heated but not abusive. No code-of-care breach. Both parties messaged.",
    when: "2 Jun",
    range: "thisQuarter",
    link: { label: "Report #4360", to: routes.adminModeration },
  },
  {
    id: "a15",
    modName: "Kai Sousa",
    modInitials: "KS",
    modTone: "plum",
    action: "Warned",
    actionTone: "coral",
    type: "warned",
    subject: "@flats_lx",
    reason: "Repost bot in #housing. Rate-limited and warned.",
    when: "1 Jun",
    range: "thisQuarter",
    link: { label: "Report #4351", to: routes.adminModeration },
  },
  {
    id: "a16",
    modName: "Inês Martins",
    modInitials: "IM",
    modTone: "jade",
    action: "Edited policy",
    actionTone: "violet",
    type: "policy",
    subject: "Code of Care v4.1",
    reason: "Extended the appeals window from 7 to 14 days.",
    when: "14 Mar",
    range: "thisQuarter",
    link: { label: "Policy v4.1", to: routes.adminGovernance },
  },
];

// ── Audit-log filter option lists ─────────────────────────────────────────────

/** Real moderator names (content) shown in the moderator filter — the "all"
 *  sentinel lives in `AuditFilterState.moderator` instead, so this list never
 *  needs a translated entry mixed in with real names. */
export const AUDIT_MODERATORS = [
  "Júlia Saraiva",
  "Inês Martins",
  "Sofia Almeida",
  "Kai Sousa",
  "System",
];

export const AUDIT_ACTION_IDS: AuditType[] = [
  "removed",
  "restricted",
  "warned",
  "dismissed",
  "verified",
  "appeal",
  "policy",
  "froze",
];

export const AUDIT_RANGE_IDS: AuditRange[] = [
  "today",
  "thisWeek",
  "thisQuarter",
];

export const AUDIT_TOTAL = 14206;
export const AUDIT_PAGE_SIZE = 8;

/** "all" is the stable canonical sentinel for "no filter applied" — its label
 *  resolves via `admin:governance.audit.allModerators/allActions/allTime`. */
export interface AuditFilterState {
  query: string;
  moderator: "all" | (string & {});
  action: "all" | AuditType;
  range: "all" | AuditRange;
}

export const DEFAULT_AUDIT_FILTERS: AuditFilterState = {
  query: "",
  moderator: "all",
  action: "all",
  range: "all",
};

// ── Policy diff (v4.1 → v4.2) ─────────────────────────────────────────────────

export type DiffKind = "ctx" | "removed" | "added";

export interface DiffLine {
  kind: DiffKind;
  text: string;
}

export const CARE_DIFF: DiffLine[] = [
  {
    kind: "ctx",
    text: "We act quickly on harassment, threats and hate speech.",
  },
  {
    kind: "removed",
    text: "Sharing someone's private information may result in moderation.",
  },
  {
    kind: "added",
    text: "Outing a member — revealing their trans status, orientation or prior name without consent — is severe harm.",
  },
  {
    kind: "added",
    text: "Doxxing and outing are handled as emergencies, on a 1-hour clock, with mandatory content removal.",
  },
  {
    kind: "added",
    text: "A member's legacy name is never recorded, shown, or used in any moderation decision.",
  },
  { kind: "ctx", text: "Members are always told what was actioned and why." },
];

// ── Live-MRR panel ────────────────────────────────────────────────────────────

export interface PanelStat {
  labelKey: string;
  /** Pre-formatted compact euro figure (e.g. "€9.6k") — kept as a display
   *  string rather than run through `fmt.currency()`, which has no compact
   *  notation that reproduces this exact "k" shorthand. */
  value: string;
  icon: IconType;
}

export const PANEL_BREAKDOWN: PanelStat[] = [
  {
    labelKey: "governance.mrrPanel.breakdown.care",
    value: "€9.6k",
    icon: FiHeart,
  },
  {
    labelKey: "governance.mrrPanel.breakdown.platform",
    value: "€7.2k",
    icon: FiServer,
  },
  {
    labelKey: "governance.mrrPanel.breakdown.mutualAid",
    value: "€6.5k",
    icon: FiLifeBuoy,
  },
  {
    labelKey: "governance.mrrPanel.breakdown.health",
    value: "€3.8k",
    icon: FiActivity,
  },
  {
    labelKey: "governance.mrrPanel.breakdown.magazine",
    value: "€2.4k",
    icon: FiBookOpen,
  },
];
