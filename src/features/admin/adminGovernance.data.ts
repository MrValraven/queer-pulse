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
  label: string;
  /** Numeric count-up target. */
  value: number;
  prefix?: string;
  suffix?: string;
  comma?: boolean;
  /** Highlight the number in jade (e.g. the surplus). */
  jade?: boolean;
  foot: string;
}

export const FINANCE_STATS: FinanceStat[] = [
  {
    label: "Sustainer MRR",
    value: 23150,
    prefix: "€",
    comma: true,
    foot: "1,842 members chip in monthly",
  },
  {
    label: "Total monthly income",
    value: 34370,
    prefix: "€",
    comma: true,
    foot: "Sustainers, grants & one-offs",
  },
  {
    label: "Monthly surplus",
    value: 4870,
    prefix: "€",
    comma: true,
    jade: true,
    foot: "Held in the community reserve",
  },
  {
    label: "On solidarity access",
    value: 18,
    suffix: "%",
    foot: "Members on free or reduced rate",
  },
];

/** Token colour keys mapped to CSS-module meter classes in the component. */
export type LedgerColor = "coral" | "violet" | "jade" | "amber" | "plum";

export interface LedgerRow {
  label: string;
  amount: string;
  /** Bar width as a percentage of the largest line. */
  width: number;
  color: LedgerColor;
}

/** Where every euro goes — widest line (honoraria) is the 100% reference. */
export const LEDGER: LedgerRow[] = [
  {
    label: "Moderator honoraria",
    amount: "€9,600",
    width: 100,
    color: "coral",
  },
  { label: "Platform & tools", amount: "€7,200", width: 75, color: "plum" },
  {
    label: "Mutual aid & micro-grants",
    amount: "€6,500",
    width: 68,
    color: "jade",
  },
  { label: "Mental health fund", amount: "€3,800", width: 40, color: "violet" },
  { label: "Magazine production", amount: "€2,400", width: 25, color: "amber" },
];

/** Where every euro comes from. */
export const INCOME_LEDGER: LedgerRow[] = [
  { label: "Member sustainers", amount: "€23,150", width: 67, color: "coral" },
  { label: "Partner grants", amount: "€6,400", width: 19, color: "jade" },
  { label: "Gathering tickets", amount: "€4,820", width: 14, color: "violet" },
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

export const QUARTER_RANGES = ["4Q", "6Q", "All"];

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

export const PRINCIPLES: string[] = [
  "We will never sell member data.",
  "Visibility is always the member’s choice.",
  "No silent removals — every action carries a reason.",
  "Access is never conditional on ability to pay.",
];

// ── Audit log ─────────────────────────────────────────────────────────────────

export type AuditTone = AdminTone;

/** Coarse action category used by the audit-log action filter. */
export type AuditType =
  | "Removed"
  | "Restricted"
  | "Warned"
  | "Dismissed"
  | "Verified"
  | "Appeal"
  | "Policy"
  | "Froze";

/** Time-bucket used by the audit-log range filter. */
export type AuditRange = "Today" | "This week" | "This quarter";

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
    type: "Removed",
    subject: "@anon_4471",
    reason:
      "Doxxing — home address shared with a threat. Member offered safety resources.",
    when: "9 min ago",
    range: "Today",
    link: { label: "Report #4471", to: routes.adminModeration },
  },
  {
    id: "a2",
    modName: "Inês Martins",
    modInitials: "IM",
    modTone: "jade",
    action: "Restricted · 7 days",
    actionTone: "amber",
    type: "Restricted",
    subject: "@member·redacted",
    reason: "Repeated DMs after a clear no. Notified with policy excerpt.",
    when: "2 min ago",
    range: "Today",
    link: { label: "Report #4480", to: routes.adminModeration },
  },
  {
    id: "a3",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Dismissed",
    actionTone: "coral",
    type: "Dismissed",
    subject: "report #4471",
    reason:
      "Genuine community gathering, not spam. Reporter thanked for caution.",
    when: "1h ago",
    range: "Today",
    link: { label: "Report #4471", to: routes.adminModeration },
  },
  {
    id: "a4",
    modName: "System",
    modInitials: "SY",
    modTone: "plum",
    action: "Auto-froze account",
    actionTone: "amber",
    type: "Froze",
    subject: "@anon_4471",
    reason:
      "New account, 0 vouches, flagged for doxxing. Held for human review.",
    when: "1h ago",
    range: "Today",
    link: { label: "Member @anon_4471", to: routes.adminMembers },
  },
  {
    id: "a5",
    modName: "Sofia Almeida",
    modInitials: "SA",
    modTone: "amber",
    action: "Warned",
    actionTone: "coral",
    type: "Warned",
    subject: "@coin_daily",
    reason: "First spam offence. Friendly warning + link removed.",
    when: "3h ago",
    range: "Today",
    link: { label: "Report #4468", to: routes.adminModeration },
  },
  {
    id: "a6",
    modName: "Inês Martins",
    modInitials: "IM",
    modTone: "jade",
    action: "Verified",
    actionTone: "jade",
    type: "Verified",
    subject: "Marco Vieira",
    reason: "Two vouches confirmed. Welcomed in.",
    when: "5h ago",
    range: "Today",
    link: { label: "Member Marco V.", to: routes.adminMembers },
  },
  {
    id: "a7",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Upheld appeal",
    actionTone: "violet",
    type: "Appeal",
    subject: "@dovgrey",
    reason:
      "Context was missed on first review. Restriction lifted, apology sent.",
    when: "yesterday",
    range: "This week",
    link: { label: "Appeal A-118", to: routes.adminModeration },
  },
  {
    id: "a8",
    modName: "Kai Sousa",
    modInitials: "KS",
    modTone: "plum",
    action: "Edited policy",
    actionTone: "violet",
    type: "Policy",
    subject: "Code of Care v4.2",
    reason: "Added deadnaming clause per Assembly vote.",
    when: "12 Jun",
    range: "This quarter",
    link: { label: "Policy v4.2", to: routes.adminGovernance },
  },
  {
    id: "a9",
    modName: "Sofia Almeida",
    modInitials: "SA",
    modTone: "amber",
    action: "Restricted · 30 days",
    actionTone: "amber",
    type: "Restricted",
    subject: "@p.costa",
    reason:
      "Second misgendering after a warning. Restricted, pointed to the pronoun guide.",
    when: "11 Jun",
    range: "This quarter",
    link: { label: "Report #4402", to: routes.adminModeration },
  },
  {
    id: "a10",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Overturned appeal",
    actionTone: "jade",
    type: "Appeal",
    subject: "@studio.vera",
    reason:
      '"Spam" link was a mutual-aid fund. Warning removed, member thanked.',
    when: "10 Jun",
    range: "This quarter",
    link: { label: "Appeal A-116", to: routes.adminModeration },
  },
  {
    id: "a11",
    modName: "Inês Martins",
    modInitials: "IM",
    modTone: "jade",
    action: "Removed content",
    actionTone: "danger",
    type: "Removed",
    subject: "@throwaway_22",
    reason: "Slur in a public comment. Removed, member warned with the clause.",
    when: "8 Jun",
    range: "This quarter",
    link: { label: "Report #4388", to: routes.adminModeration },
  },
  {
    id: "a12",
    modName: "System",
    modInitials: "SY",
    modTone: "plum",
    action: "Flagged vouch ring",
    actionTone: "violet",
    type: "Froze",
    subject: "5 accounts",
    reason: "Closed-loop vouching detected. Surfaced for human review.",
    when: "7 Jun",
    range: "This quarter",
    link: { label: "Report #4381", to: routes.adminModeration },
  },
  {
    id: "a13",
    modName: "Sofia Almeida",
    modInitials: "SA",
    modTone: "amber",
    action: "Verified",
    actionTone: "jade",
    type: "Verified",
    subject: "Rui Antunes",
    reason: "Held for a second vouch, then welcomed in once confirmed.",
    when: "5 Jun",
    range: "This quarter",
    link: { label: "Member Rui A.", to: routes.adminMembers },
  },
  {
    id: "a14",
    modName: "Júlia Saraiva",
    modInitials: "JS",
    modTone: "jade",
    action: "Dismissed",
    actionTone: "coral",
    type: "Dismissed",
    subject: "report #4360",
    reason:
      "Heated but not abusive. No code-of-care breach. Both parties messaged.",
    when: "2 Jun",
    range: "This quarter",
    link: { label: "Report #4360", to: routes.adminModeration },
  },
  {
    id: "a15",
    modName: "Kai Sousa",
    modInitials: "KS",
    modTone: "plum",
    action: "Warned",
    actionTone: "coral",
    type: "Warned",
    subject: "@flats_lx",
    reason: "Repost bot in #housing. Rate-limited and warned.",
    when: "1 Jun",
    range: "This quarter",
    link: { label: "Report #4351", to: routes.adminModeration },
  },
  {
    id: "a16",
    modName: "Inês Martins",
    modInitials: "IM",
    modTone: "jade",
    action: "Edited policy",
    actionTone: "violet",
    type: "Policy",
    subject: "Code of Care v4.1",
    reason: "Extended the appeals window from 7 to 14 days.",
    when: "14 Mar",
    range: "This quarter",
    link: { label: "Policy v4.1", to: routes.adminGovernance },
  },
];

// ── Audit-log filter option lists ─────────────────────────────────────────────

export const AUDIT_MODERATORS = [
  "All moderators",
  "Júlia Saraiva",
  "Inês Martins",
  "Sofia Almeida",
  "Kai Sousa",
  "System",
];

export const AUDIT_ACTIONS = [
  "All actions",
  "Removed",
  "Restricted",
  "Warned",
  "Dismissed",
  "Verified",
  "Appeal",
  "Policy",
  "Froze",
];

export const AUDIT_RANGE_OPTIONS = [
  "All time",
  "Today",
  "This week",
  "This quarter",
];

export const AUDIT_TOTAL = 14206;
export const AUDIT_PAGE_SIZE = 8;

export interface AuditFilterState {
  query: string;
  moderator: string;
  action: string;
  range: string;
}

export const DEFAULT_AUDIT_FILTERS: AuditFilterState = {
  query: "",
  moderator: "All moderators",
  action: "All actions",
  range: "All time",
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
  label: string;
  value: string;
  icon: IconType;
}

export const PANEL_BREAKDOWN: PanelStat[] = [
  { label: "Care", value: "€9.6k", icon: FiHeart },
  { label: "Platform", value: "€7.2k", icon: FiServer },
  { label: "Mutual aid", value: "€6.5k", icon: FiLifeBuoy },
  { label: "Health", value: "€3.8k", icon: FiActivity },
  { label: "Magazine", value: "€2.4k", icon: FiBookOpen },
];
