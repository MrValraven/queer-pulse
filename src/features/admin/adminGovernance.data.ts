import type { AdminTone } from "./ui";
import type { FinanceMetricSource } from "./api/adminGovernanceFinances.api";

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
  /** Provenance of `value`, shown as a badge next to the label. */
  source?: FinanceMetricSource;
}

/** Token colour keys mapped to CSS-module meter classes in the component. */
export type LedgerColor = "coral" | "violet" | "jade" | "amber" | "plum";

export interface LedgerRow {
  labelKey: string;
  /** Plain-English label for demo mode, mirroring `labelKey`'s meaning —
   *  used as the final display label when reshaping this mock into the
   *  backend's `FinLine` response shape. */
  demoLabel: string;
  /** Euro amount — resolve for display with `fmt.currency()`. */
  amount: number;
  /** Bar width as a percentage of the largest line. */
  width: number;
  color: LedgerColor;
}

/** Where every euro goes — widest line (honoraria) is the 100% reference. */

/** Where every euro comes from. */

// ── Income vs spending by quarter ─────────────────────────────────────────────

export interface QuarterPoint {
  label: string;
  /** €k income. */
  income: number;
  /** €k spending. */
  spend: number;
}


/** Canonical range ids — never translated (compared directly by the chart). */
export type QuarterRangeId = "4q" | "6q" | "all";
export const QUARTER_RANGE_IDS: QuarterRangeId[] = ["4q", "6q", "all"];

// ── Audit log ─────────────────────────────────────────────────────────────────

export type AuditTone = AdminTone;

/**
 * Coarse action category used by the audit-log action filter — a stable
 * canonical id, never displayed or translated directly. Resolve its label via
 * `t(`admin:governance.audit.actionType.${type}`)`.
 */
export type AuditType =
  | "dismiss"
  | "warn"
  | "hide_content"
  | "remove_content"
  | "restrict"
  | "suspend"
  | "ban"
  | "shield"
  | "escalate"
  | "appeal_upheld"
  | "appeal_overturned"
  | "suspension_lifted";

/**
 * Time-bucket used by the audit-log range filter — a stable canonical id,
 * never displayed or translated directly. Resolve its label via
 * `t(`admin:governance.audit.range.${range}`)`.
 */
export type AuditRange = "today" | "week" | "quarter";

/** Chip tone for each backend action code — shared by demo→live remapping in
 *  `useAdminAudit` when a live row's raw action code needs a fallback tone. */
export const ACTION_TONE: Record<AuditType, AdminTone> = {
  dismiss: "coral",
  warn: "coral",
  hide_content: "amber",
  remove_content: "danger",
  restrict: "amber",
  suspend: "amber",
  ban: "danger",
  shield: "violet",
  escalate: "violet",
  appeal_upheld: "jade",
  appeal_overturned: "jade",
  suspension_lifted: "jade",
};

export interface AuditEntry {
  id: string;
  moderatorName: string;
  moderatorInitials: string;
  moderatorTone: "plum" | "coral" | "jade" | "violet" | "amber" | "anon";
  action: string;
  actionTone: AuditTone;
  type: AuditType;
  subject: string;
  reason: string;
  when: string;
  range: AuditRange;
}


// ── Audit-log filter option lists ─────────────────────────────────────────────

/** Real moderator names (content) shown in the moderator filter — the "all"
 *  sentinel lives in `AuditFilterState.moderator` instead, so this list never
 *  needs a translated entry mixed in with real names. */

export const AUDIT_ACTION_IDS: AuditType[] = [
  "dismiss",
  "warn",
  "hide_content",
  "remove_content",
  "restrict",
  "suspend",
  "ban",
  "shield",
  "escalate",
  "appeal_upheld",
  "appeal_overturned",
  "suspension_lifted",
];

export const AUDIT_RANGE_IDS: AuditRange[] = ["today", "week", "quarter"];

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
