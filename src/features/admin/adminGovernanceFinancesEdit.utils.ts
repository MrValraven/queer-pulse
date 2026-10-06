import { parseAmountInput, toCanonicalAmount } from "./adminFinanceAmount";
import type {
  AdminFinLine,
  AdminFinanceLatest,
  FinanceLedgerEdit,
  FinanceLineItem,
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

/** One breakdown entry while it is being edited: raw strings, as typed. */
export interface ItemDraft {
  name: string;
  /** The optional detail beside the name, like "€15/mo". */
  period: string;
  amount: string;
}

/** A ledger row while it is being edited. A draft past the end of the stored
 *  ledger is a row the admin added in this dialog (PRD-447). A row with
 *  `items` takes its amount from their sum; `amount` then sits unused. */
export interface LineDraft {
  label: string;
  amount: string;
  note: string;
  enabled: boolean;
  items: ItemDraft[];
}

/** The most entries one line's breakdown can hold (the backend's limit). */
export const MAX_BREAKDOWN_ITEMS = 30;
export const ITEM_NAME_MAX_LENGTH = 80;
export const ITEM_PERIOD_MAX_LENGTH = 40;

/**
 * PRD-447. A figure nobody has confirmed (still `seeded`, or never entered)
 * starts as an empty field; its stored value stays visible in the "Current"
 * column. Saving the dialog therefore confirms only the figures an admin
 * actually typed.
 */
export function toScalarDrafts(latest: AdminFinanceLatest): ScalarDrafts {
  const toDraft = (key: ScalarKey): string => {
    const value = latest[key];
    return value === null || latest.sources[key] === "seeded"
      ? ""
      : String(value);
  };
  return {
    mrr: toDraft("mrr"),
    sustainerCount: toDraft("sustainerCount"),
    solidarityRate: toDraft("solidarityRate"),
    incomeTotal: toDraft("incomeTotal"),
    expenseTotal: toDraft("expenseTotal"),
  };
}

/** The breakdown an admin has saved. A seeded (or never confirmed) one counts
 *  as empty, the same rule as `toScalarDrafts`, so seeded vendor rows never
 *  pass for confirmed figures. */
function storedManualItems(line: AdminFinLine | undefined): FinanceLineItem[] {
  return line?.itemsSource === "manual" ? line.items : [];
}

export function toLineDrafts(lines: AdminFinLine[]): LineDraft[] {
  return lines.map((line) => ({
    label: line.label,
    amount: line.amount,
    note: line.note,
    enabled: line.enabled ?? true,
    items: storedManualItems(line).map((item) => ({
      name: item.name,
      period: item.period,
      amount: item.amount,
    })),
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

/** A fresh row for the "Add a line" button. */
export function emptyLineDraft(): LineDraft {
  return { label: "", amount: "", note: "", enabled: true, items: [] };
}

/** A fresh entry for the breakdown's "Add an item" button. */
export function emptyItemDraft(): ItemDraft {
  return { name: "", period: "", amount: "" };
}

/** Sum of the breakdown in whole cents, the way the backend adds it up.
 *  Amounts `itemAmountError` refuses are skipped; they block the save anyway. */
function sumItemCents(items: ItemDraft[]): number {
  return items.reduce((cents, item) => {
    if (isItemAmountRejected(item.amount)) return cents;
    const value = parseNumber(item.amount) ?? 0;
    return cents + Math.round(value * 100);
  }, 0);
}

export function sumItems(items: ItemDraft[]): number {
  return sumItemCents(items) / 100;
}

/** The figure a line contributes: its breakdown's sum when it has one, the
 *  typed amount otherwise. */
export function lineAmountValue(line: LineDraft): number | undefined {
  return line.items.length > 0
    ? sumItems(line.items)
    : parseNumber(line.amount);
}

/** The patch for a new breakdown. Emptying it hands the last sum back to the
 *  amount field when at least one removed item carried a valid amount, so the
 *  figure on screen stays where it was. When every removed amount was blank
 *  or refused, the amount field keeps its own value, which sat untouched
 *  while the items existed. */
export function breakdownPatch(
  line: LineDraft,
  items: ItemDraft[],
): Partial<LineDraft> {
  const hasPricedItem = line.items.some(
    (item) => !isItemAmountRejected(item.amount),
  );
  if (items.length === 0 && hasPricedItem) {
    return { items, amount: toCanonicalAmount(sumItems(line.items)) };
  }
  return { items };
}

/** Why the save refuses an item amount, or null when it is fine. The backend
 *  stores item amounts as unsigned plain numbers with at most two decimals
 *  and 15 characters, so the editor holds to the same shape. */
export type ItemAmountError =
  "required" | "invalid" | "negative" | "tooPrecise";

const MAX_ITEM_AMOUNT = 999_999_999_999.99;

export function itemAmountError(value: string): ItemAmountError | null {
  const parsed = parseAmountInput(value);
  if (parsed.status === "blank") return "required";
  if (parsed.status === "invalid") return "invalid";
  if (parsed.value < 0) return "negative";
  // A tolerance, since 12.34 * 100 is 1234.0000000000002 in floating point.
  const scaled = parsed.value * 100;
  const hasExtraDecimals = Math.abs(Math.round(scaled) - scaled) > 1e-6;
  if (hasExtraDecimals || parsed.value > MAX_ITEM_AMOUNT) return "tooPrecise";
  return null;
}

function isItemAmountRejected(value: string): boolean {
  return itemAmountError(value) !== null;
}

function isItemRejected(item: ItemDraft): boolean {
  return !item.name.trim() || isItemAmountRejected(item.amount);
}

/** A breakdown entry the admin must name or price before saving. */
/** Checked on every line, switched off or on: a switched-off line still
 *  saves its breakdown, the same way `hasBlankLineLabel` holds every name. */
export function hasRejectedBreakdownItem(lines: LineDraft[]): boolean {
  return lines.some((line) => line.items.some(isItemRejected));
}

/** One separator followed by exactly three digits ("12.345", "1,840") is read
 *  as a thousands group, which is right for "1,840" and a surprise for
 *  "12.345". The editor shows how such an amount reads. */
const GROUPED_THOUSANDS_SHAPE = /^[^.,]*\d[.,]\d{3}$/;

export function isReadAsGroupedThousands(value: string): boolean {
  return (
    GROUPED_THOUSANDS_SHAPE.test(value.trim()) &&
    itemAmountError(value) === null
  );
}

/** A row the admin must name before saving. */
export function hasBlankLineLabel(lines: LineDraft[]): boolean {
  return lines.some((line) => !line.label.trim());
}

/** A line with a breakdown has its items checked by
 *  `hasRejectedBreakdownItem`, since its amount is their sum. */
export function hasRejectedLineAmount(lines: LineDraft[]): boolean {
  return lines.some(
    (line) =>
      line.enabled &&
      line.items.length === 0 &&
      isAmountRejected(line.amount, false),
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
  // PRD-447: an unconfirmed figure's draft starts empty, so it counts as
  // changed only once the admin types a number into it (0 included); saving
  // that confirms it and flips it to "Edited".
  return (
    parsed !== undefined &&
    (parsed !== latest[key] || latest.sources[key] === "seeded")
  );
}

/** The breakdown differs from the one an admin saved: entries compare in
 *  order, names and details trimmed, amounts as numbers. */
export function isBreakdownChanged(
  draft: LineDraft,
  source: AdminFinLine | undefined,
): boolean {
  const stored = storedManualItems(source);
  if (draft.items.length !== stored.length) return true;
  return draft.items.some((item, index) => {
    const storedItem = stored[index];
    return (
      !storedItem ||
      item.name.trim() !== storedItem.name.trim() ||
      item.period.trim() !== storedItem.period.trim() ||
      parseNumber(item.amount) !== parseNumber(storedItem.amount)
    );
  });
}

/** The breakdown as it is sent: trimmed words and canonical amounts. */
function toItemPayload(items: ItemDraft[]): FinanceLineItem[] {
  return items.map((item) => ({
    name: item.name.trim(),
    period: item.period.trim(),
    amount: toCanonicalAmount(parseNumber(item.amount) ?? 0),
  }));
}

/** The canonical sum sent beside a non-empty breakdown, matching the amount
 *  the backend recomputes from the same items. */
function canonicalItemsSum(items: ItemDraft[]): string {
  return toCanonicalAmount(sumItemCents(items) / 100);
}

export function isLineChanged(draft: LineDraft, source: AdminFinLine): boolean {
  return (
    draft.label.trim() !== source.label ||
    (draft.items.length === 0 &&
      isAmountChanged(draft.amount, source.amount)) ||
    isBreakdownChanged(draft, source) ||
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
    const draftAmount = parseAmountInput(draft.amount);
    const hasItems = draft.items.length > 0;
    // A row added in this dialog is sent whole; the backend appends it. A
    // breakdown goes with it, and its sum stands in as the amount.
    if (!source) {
      const appended: FinanceLedgerEdit = {
        index,
        label: draft.label.trim(),
        amount: hasItems
          ? canonicalItemsSum(draft.items)
          : draftAmount.status === "ok"
            ? toCanonicalAmount(draftAmount.value)
            : draft.amount,
        note: draft.note,
        enabled: draft.enabled,
      };
      if (hasItems) appended.items = toItemPayload(draft.items);
      edits.push(appended);
      return;
    }
    const edit: FinanceLedgerEdit = { index };
    let changed = false;
    if (draft.label.trim() !== source.label) {
      edit.label = draft.label.trim();
      changed = true;
    }
    // A changed breakdown is sent whole, with its sum as the amount, as part
    // of this line's one edit.
    if (isBreakdownChanged(draft, source)) {
      edit.items = toItemPayload(draft.items);
      if (hasItems) edit.amount = canonicalItemsSum(draft.items);
      changed = true;
    }
    // Written back as plain number strings, so what we store carries no
    // locale of its own. A line with a breakdown takes the sum above.
    if (
      !hasItems &&
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
    return total + (lineAmountValue(line) ?? 0);
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
