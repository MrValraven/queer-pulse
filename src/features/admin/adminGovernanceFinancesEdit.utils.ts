import { parseAmountInput, toCanonicalAmount } from "./adminFinanceAmount";
import type {
  AdminFinLine,
  AdminFinanceLatest,
  FinanceLedgerEdit,
  UpdateAdminFinancesBody,
} from "./api/adminGovernanceFinances.api";

/**
 * Pure draft/diff helpers for the Finances edit dialog. No React, so the
 * dialog stays a thin table renderer and every rule here can be unit-tested
 * without mounting anything.
 */

/** The editable headline figures, in the order they appear in the dialog.
 *  Every one of them is also a key on `AdminFinanceLatest` and on the update
 *  payload, which is what lets the diff loop below stay generic. */
export const SCALAR_KEYS = [
  "mrr",
  "sustainerCount",
  "solidarityRate",
  "incomeTotal",
  "expenseTotal",
] as const;

export type ScalarKey = (typeof SCALAR_KEYS)[number];

/** How each headline figure is shown when read back: money, a count, or a
 *  percentage. Drives the "Current" column and the input adornment. */
export const SCALAR_UNIT: Record<ScalarKey, "currency" | "count" | "percent"> =
  {
    mrr: "currency",
    sustainerCount: "count",
    solidarityRate: "percent",
    incomeTotal: "currency",
    expenseTotal: "currency",
  };

/** Headline figures while they are being edited: raw strings, exactly as
 *  typed, so no notation is thrown away before it can be parsed. */
export type ScalarDrafts = Record<ScalarKey, string>;

/** A ledger row while it is being edited. `label` is read-only context. */
export interface LineDraft {
  label: string;
  amount: string;
  note: string;
  enabled: boolean;
}

export function toScalarDrafts(latest: AdminFinanceLatest): ScalarDrafts {
  return {
    mrr: String(latest.mrr),
    sustainerCount: String(latest.sustainerCount),
    solidarityRate: String(latest.solidarityRate),
    incomeTotal: String(latest.incomeTotal),
    expenseTotal: String(latest.expenseTotal),
  };
}

export function toLineDrafts(lines: AdminFinLine[]): LineDraft[] {
  return lines.map((line) => ({
    label: line.label,
    amount: line.amount,
    note: line.note,
    enabled: line.enabled ?? true,
  }));
}

/** Empty string means "left blank" (skip). An unreadable entry never reaches
 *  here: the save button stays disabled while any amount fails to parse, so
 *  a typo is refused out loud rather than dropped from the payload. */
export function parseNumber(value: string): number | undefined {
  const parsed = parseAmountInput(value);
  return parsed.status === "ok" ? parsed.value : undefined;
}

/** An amount the admin must fix before saving: unreadable, or (on a row that
 *  is switched on) left empty. */
export function isAmountRejected(
  value: string,
  isBlankAllowed: boolean,
): boolean {
  const status = parseAmountInput(value).status;
  return status === "invalid" || (status === "blank" && !isBlankAllowed);
}

export function hasRejectedLineAmount(lines: LineDraft[]): boolean {
  return lines.some(
    (line) => line.enabled && isAmountRejected(line.amount, false),
  );
}

/** Amounts compare as numbers, so re-typing a stored "€1,840" as "1 840" is
 *  not an edit. An unreadable draft counts as unchanged here: the save is
 *  already held back by `isAmountRejected`. */
function isAmountChanged(draft: string, source: string): boolean {
  const draftAmount = parseAmountInput(draft);
  if (draftAmount.status !== "ok") return false;
  const sourceAmount = parseAmountInput(source);
  return (
    sourceAmount.status !== "ok" || draftAmount.value !== sourceAmount.value
  );
}

export function isScalarChanged(
  key: ScalarKey,
  drafts: ScalarDrafts,
  latest: AdminFinanceLatest,
): boolean {
  const parsed = parseNumber(drafts[key]);
  return parsed !== undefined && parsed !== latest[key];
}

export function isLineChanged(draft: LineDraft, source: AdminFinLine): boolean {
  return (
    isAmountChanged(draft.amount, source.amount) ||
    draft.note !== source.note ||
    draft.enabled !== (source.enabled ?? true)
  );
}

export function ledgerDiff(
  drafts: LineDraft[],
  original: AdminFinLine[],
): FinanceLedgerEdit[] {
  const edits: FinanceLedgerEdit[] = [];
  drafts.forEach((draft, index) => {
    const source = original[index];
    if (!source) return;
    const edit: FinanceLedgerEdit = { index };
    let changed = false;
    // Written back as plain number strings, so what we store carries no
    // locale of its own.
    const draftAmount = parseAmountInput(draft.amount);
    if (
      draftAmount.status === "ok" &&
      isAmountChanged(draft.amount, source.amount)
    ) {
      edit.amount = toCanonicalAmount(draftAmount.value);
      changed = true;
    }
    if (draft.note !== source.note) {
      edit.note = draft.note;
      changed = true;
    }
    if (draft.enabled !== (source.enabled ?? true)) {
      edit.enabled = draft.enabled;
      changed = true;
    }
    if (changed) edits.push(edit);
  });
  return edits;
}

/** Sum of the amounts on the lines that are switched on, for the table foot.
 *  Unreadable amounts are skipped; they block the save anyway. */
export function sumEnabledLines(lines: LineDraft[]): number {
  return lines.reduce((total, line) => {
    if (!line.enabled) return total;
    return total + (parseNumber(line.amount) ?? 0);
  }, 0);
}

export interface EditDrafts {
  scalars: ScalarDrafts;
  income: LineDraft[];
  expense: LineDraft[];
  note: string;
}

/** Only what actually changed. Empty when nothing did. */
export function buildUpdateBody(
  drafts: EditDrafts,
  latest: AdminFinanceLatest,
): UpdateAdminFinancesBody {
  const body: UpdateAdminFinancesBody = {};
  SCALAR_KEYS.forEach((key) => {
    if (isScalarChanged(key, drafts.scalars, latest)) {
      body[key] = parseNumber(drafts.scalars[key]);
    }
  });
  const incomeEdits = ledgerDiff(drafts.income, latest.income);
  if (incomeEdits.length > 0) body.income = incomeEdits;
  const expenseEdits = ledgerDiff(drafts.expense, latest.expense);
  if (expenseEdits.length > 0) body.expense = expenseEdits;
  if (Object.keys(body).length > 0 && drafts.note.trim()) {
    body.note = drafts.note.trim();
  }
  return body;
}

/** How many rows differ from what is stored: the footer's "{count} changes". */
export function countChanges(
  drafts: EditDrafts,
  latest: AdminFinanceLatest,
): number {
  const scalarChanges = SCALAR_KEYS.filter((key) =>
    isScalarChanged(key, drafts.scalars, latest),
  ).length;
  return (
    scalarChanges +
    ledgerDiff(drafts.income, latest.income).length +
    ledgerDiff(drafts.expense, latest.expense).length
  );
}
