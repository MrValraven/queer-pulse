import { parseAmountInput } from "./adminFinanceAmount";
import { parseQuarter } from "../governance/governanceQuarter";
import type { FinancePartnerDTO } from "../governance/api/governance.api";
import type {
  AdminFinanceLatest,
  FinancePartnerEdit,
  UpdateAdminFinancesBody,
} from "./api/adminGovernanceFinances.api";

/**
 * PRD-447. Pure draft/diff helpers for the "Edit public report" dialog: the
 * stat tiles, event notes, disclosed partners and reserve that used to need
 * SQL. No React, so every rule here is testable without mounting anything.
 *
 * Each section is sent as a full replacement, and only when it differs from
 * what is stored, so saving the dialog untouched writes no history.
 */

export interface StatDraft {
  n: string;
  l: string;
  trend: string;
  up: boolean;
}

export interface NoteDraft {
  title: string;
  body: string;
}

/** `amount` stays the raw typed string until it parses. */
export interface PartnerDraft {
  name: string;
  amount: string;
  scope: string;
}

/** Both blank means "no reserve to show". */
export interface ReserveDraft {
  current: string;
  target: string;
}

export interface ReportDrafts {
  stats: StatDraft[];
  eventNotes: NoteDraft[];
  partners: PartnerDraft[];
  reserve: ReserveDraft;
}

/** Turns a stored partner's restriction into words: the typed `scope`, or the
 *  translated `scopeKey` an older seeded row carries. */
export type ScopeResolver = (partner: FinancePartnerDTO) => string;

export function toReportDrafts(
  latest: AdminFinanceLatest,
  resolveScope: ScopeResolver,
): ReportDrafts {
  return {
    stats: latest.stats.map((stat) => ({ ...stat })),
    eventNotes: latest.eventNotes.map((note) => ({ ...note })),
    partners: latest.partners.map((partner) => ({
      name: partner.name,
      amount: String(partner.amount),
      scope: resolveScope(partner),
    })),
    reserve: latest.reserve
      ? {
          current: String(latest.reserve.current),
          target: String(latest.reserve.target),
        }
      : { current: "", target: "" },
  };
}

function parsedAmount(value: string): number | undefined {
  const parsed = parseAmountInput(value);
  return parsed.status === "ok" ? parsed.value : undefined;
}

function isSame(first: unknown, second: unknown): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

/** Why saving is held back, or null when it is allowed. */
export function reportBlockedReason(
  drafts: ReportDrafts,
): "amount" | "text" | null {
  const isAmountBad = (value: string) =>
    parseAmountInput(value).status !== "ok";
  const reserveBlankCount = [drafts.reserve.current, drafts.reserve.target]
    .map((value) => parseAmountInput(value).status === "blank")
    .filter(Boolean).length;
  if (
    drafts.partners.some((partner) => isAmountBad(partner.amount)) ||
    reserveBlankCount === 1 ||
    (reserveBlankCount === 0 &&
      (isAmountBad(drafts.reserve.current) ||
        isAmountBad(drafts.reserve.target)))
  ) {
    return "amount";
  }
  const isBlank = (value: string) => !value.trim();
  if (
    drafts.stats.some((stat) => isBlank(stat.n) || isBlank(stat.l)) ||
    drafts.eventNotes.some((note) => isBlank(note.title)) ||
    drafts.partners.some(
      (partner) => isBlank(partner.name) || isBlank(partner.scope),
    )
  ) {
    return "text";
  }
  return null;
}

/** Only the sections that changed. Empty when nothing did. Call it only when
 *  {@link reportBlockedReason} is null. */
export function buildReportBody(
  drafts: ReportDrafts,
  latest: AdminFinanceLatest,
  resolveScope: ScopeResolver,
): UpdateAdminFinancesBody {
  const body: UpdateAdminFinancesBody = {};

  const stats = drafts.stats.map((stat) => ({
    n: stat.n.trim(),
    l: stat.l.trim(),
    trend: stat.trend.trim(),
    up: stat.up,
  }));
  if (!isSame(stats, latest.stats)) body.stats = stats;

  const eventNotes = drafts.eventNotes.map((note) => ({
    title: note.title.trim(),
    body: note.body.trim(),
  }));
  if (!isSame(eventNotes, latest.eventNotes)) body.eventNotes = eventNotes;

  const partners: FinancePartnerEdit[] = drafts.partners.map((partner) => ({
    name: partner.name.trim(),
    amount: parsedAmount(partner.amount) ?? 0,
    scope: partner.scope.trim(),
  }));
  const storedPartners = latest.partners.map((partner) => ({
    name: partner.name,
    amount: partner.amount,
    scope: resolveScope(partner),
  }));
  if (!isSame(partners, storedPartners)) body.partners = partners;

  const current = parsedAmount(drafts.reserve.current);
  const target = parsedAmount(drafts.reserve.target);
  const reserve =
    current === undefined || target === undefined ? null : { current, target };
  if (!isSame(reserve, latest.reserve)) body.reserve = reserve;

  return body;
}

/** Replaces one row of a list draft, leaving the rest untouched. */
export function patchRow<Row>(
  rows: Row[],
  index: number,
  patch: Partial<Row>,
): Row[] {
  return rows.map((row, rowIndex) =>
    rowIndex === index ? { ...row, ...patch } : row,
  );
}

/** The quarter after `latestQuarter` ("2026-Q4" gives 2027, 1), or today's
 *  quarter when there is no report yet. Seeds the "Open a quarter" dialog. */
export function nextQuarter(latestQuarter: string | null): {
  year: number;
  quarter: number;
} {
  const latest = parseQuarter(latestQuarter);
  if (!latest) {
    const today = new Date();
    return {
      year: today.getFullYear(),
      quarter: Math.floor(today.getMonth() / 3) + 1,
    };
  }
  const { year, quarter } = latest;
  return quarter === 4
    ? { year: year + 1, quarter: 1 }
    : { year, quarter: quarter + 1 };
}
