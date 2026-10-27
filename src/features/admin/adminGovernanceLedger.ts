import type { AdminFinLine } from "./api/adminGovernanceFinances.api";
import { financeAmountOrZero } from "./adminFinanceAmount";

/** Fixed colour cycle for ledger segments and dots. `FinLine` carries no
 *  colour, so rows are tinted by position instead. */
const LEDGER_COLOR_CYCLE = ["coral", "plum", "jade", "violet", "amber"];

export function ledgerColorAt(index: number) {
  return LEDGER_COLOR_CYCLE[index % LEDGER_COLOR_CYCLE.length]!;
}

/** True once a figure has been human-verified (edited or derived) rather than
 *  left as an unreviewed seed placeholder. */
export function isVerified(source: string | undefined): boolean {
  return source !== undefined && source !== "seeded";
}

/** Rows an admin has turned off stay out of the dashboard. They remain
 *  editable (and re-enableable) from the Edit dialog only. */
export function enabledLines(lines: AdminFinLine[]): AdminFinLine[] {
  return lines.filter((line) => line.enabled !== false);
}

/** A remainder at or under this many euros is rounding, so it gets no
 *  segment and no row of its own. */
const REMAINDER_THRESHOLD = 0.5;

/** One enabled line, measured against the card total. */
export interface LedgerShare {
  line: AdminFinLine;
  colorName: string;
  /** The parsed amount, or 0 while the figure is still unverified. */
  amount: number;
  /** False in live mode while the figure is still a seeded placeholder. */
  isShown: boolean;
  /** Share of the denominator, 0 to 100. */
  percent: number;
}

export interface LedgerComposition {
  shares: LedgerShare[];
  /** The part of the total no shown line explains yet. */
  remainder: number;
  remainderPercent: number;
  hasRemainder: boolean;
}

/**
 * Measures each enabled line against the card total. The denominator is the
 * larger of the total and the sum of the shown amounts, so the bar never
 * overflows when the lines add up to more than the stated total.
 */
export function buildLedgerComposition(
  lines: AdminFinLine[],
  total: number | null,
  isDemoMode: boolean,
): LedgerComposition {
  const measured = lines.map((line, index) => {
    const isShown = isDemoMode || isVerified(line.source);
    return {
      line,
      colorName: ledgerColorAt(index),
      amount: isShown ? Math.max(0, financeAmountOrZero(line.amount)) : 0,
      isShown,
    };
  });
  const shownSum = measured.reduce((sum, share) => sum + share.amount, 0);
  const statedTotal = Math.max(0, total ?? 0);
  const denominator = Math.max(statedTotal, shownSum);
  const toPercent = (amount: number) =>
    denominator > 0 ? (amount / denominator) * 100 : 0;
  const remainder = statedTotal - shownSum;
  const hasRemainder = lines.length > 0 && remainder > REMAINDER_THRESHOLD;

  return {
    shares: measured.map((share) => ({
      ...share,
      percent: toPercent(share.amount),
    })),
    remainder: hasRemainder ? remainder : 0,
    remainderPercent: hasRemainder ? toPercent(remainder) : 0,
    hasRemainder,
  };
}
