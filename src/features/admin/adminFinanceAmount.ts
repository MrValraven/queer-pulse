/**
 * Locale-tolerant parsing for the money figures an admin types into the
 * governance Finances editor, and for the pre-formatted amount strings the
 * backend stores on each ledger line (the quarterly seed writes `"€1,840"`,
 * demo mode writes `"23150"`).
 *
 * Accepted forms. Every one of these reads as `1840.5`:
 *
 * ```
 * "1840.5"      "1840,5"        plain decimal, either separator
 * "1840.50"     "1840,50"       two decimals
 * "1 840,50"    "1 840.50"      regular, non-breaking or narrow space groups
 * "1.840,50"                    pt-PT grouping with a decimal comma
 * "1,840.50"                    en grouping with a decimal point
 * "€1 840,50"   "1840,50 €"     a currency symbol on either side
 * "1840,50 EUR"                 an ISO code on either side
 * ```
 *
 * Plain integers (`"1840"`, `"€1,840"`, `"1.840"`, `"1 840"`) all read as
 * `1840`, and a leading `+`/`-` is honoured.
 *
 * How the decimal separator is decided:
 *
 * - Both `.` and `,` are present: the **last** one separates the decimals and
 *   the other one is a thousands group. This is what makes `"1.840,50"` and
 *   `"1,840.50"` both correct without knowing the reader's language.
 * - The same separator appears twice or more: it is a thousands group
 *   (`"1.840.500"`).
 * - A single separator followed by exactly three digits (`"1.840"`, `"1,840"`):
 *   read as a thousands group first, in either language. Money is written with
 *   at most two decimals, and the stored ledger amounts are en-formatted
 *   (`"€1,840"`), so reading that shape as a decimal would turn 1840 into 1.84
 *   for everyone reading the page in Portuguese. If the grouping reading does
 *   not hold up (`"0,500"` has no valid leading group), the same separator is
 *   retried as a decimal separator, so nothing plausible is rejected.
 * - Anything else: the single separator is the decimal separator.
 *
 * A shape that survives none of those readings is reported as `invalid` rather
 * than being coerced, so the editor can refuse to save instead of silently
 * dropping the figure.
 *
 * Pure functions, no React, so they are reusable from data prep and tests.
 */

/** Whitespace (`\s` covers the non-breaking, narrow and figure spaces `Intl`
 *  emits for pt-PT grouping) plus the currency notation that may surround a
 *  typed figure. */
const AMOUNT_NOISE = /\s|EUR|[€$£¥]/gi;

/** What a raw amount string turned into. `blank` is "the admin left this
 *  alone"; `invalid` is "this cannot be read as a number" and must block a
 *  save rather than be dropped. */
export type ParsedAmount =
  | { status: "blank" }
  | { status: "invalid" }
  | { status: "ok"; value: number };

type DecimalSeparator = "." | "," | null;

/**
 * Rewrite `body` (digits and separators only, no sign) as a plain
 * machine-readable number string, reading `decimalSeparator` as the decimal
 * point and whatever separator is left over as thousands grouping. Returns
 * `null` when the groups do not hold up, e.g. `"1,84,5"` or `"0,500"`.
 */
function toPlainNumber(
  body: string,
  decimalSeparator: DecimalSeparator,
): string | null {
  let integerText = body;
  let fractionText = "";

  if (decimalSeparator !== null) {
    const separatorAt = body.lastIndexOf(decimalSeparator);
    integerText = body.slice(0, separatorAt);
    fractionText = body.slice(separatorAt + 1);
    // A trailing separator is someone mid-keystroke ("1840,"), not an error.
    if (fractionText !== "" && !/^\d+$/.test(fractionText)) return null;
  }

  const groupSeparator = integerText.includes(".")
    ? "."
    : integerText.includes(",")
      ? ","
      : null;

  let digits = integerText;
  if (groupSeparator !== null) {
    const groups = integerText.split(groupSeparator);
    const [firstGroup, ...laterGroups] = groups;
    if (!/^[1-9]\d{0,2}$/.test(firstGroup ?? "")) return null;
    if (!laterGroups.every((group) => /^\d{3}$/.test(group))) return null;
    digits = groups.join("");
  } else if (integerText === "" && fractionText !== "") {
    // A bare fraction ",50" is half a euro, written the way a keypad produces it.
    digits = "0";
  } else if (!/^\d+$/.test(integerText)) {
    return null;
  }

  return fractionText === "" ? digits : `${digits}.${fractionText}`;
}

/** The decimal-separator readings to try, best first. See the module doc. */
function separatorCandidates(body: string): DecimalSeparator[] {
  const lastDot = body.lastIndexOf(".");
  const lastComma = body.lastIndexOf(",");

  if (lastDot >= 0 && lastComma >= 0) {
    return [lastDot > lastComma ? "." : ","];
  }

  const only: DecimalSeparator =
    lastDot >= 0 ? "." : lastComma >= 0 ? "," : null;
  if (only === null) return [null];

  const parts = body.split(only);
  const isRepeated = parts.length > 2;
  if (isRepeated) return [null];

  const isThousandsShape = /^\d{3}$/.test(parts[parts.length - 1] ?? "");
  return isThousandsShape ? [null, only] : [only];
}

/**
 * Read one typed or stored amount. Never throws and never guesses: an
 * unreadable entry comes back as `invalid` so the caller can surface it.
 */
export function parseAmountInput(raw: string): ParsedAmount {
  const cleaned = raw.replace(AMOUNT_NOISE, "");
  if (cleaned === "") return { status: "blank" };

  const signMatch = /^[+-]/.exec(cleaned);
  const sign = signMatch ? signMatch[0] : "";
  const body = cleaned.slice(sign.length);
  if (body === "" || !/^[\d.,]+$/.test(body)) return { status: "invalid" };

  for (const candidate of separatorCandidates(body)) {
    const plain = toPlainNumber(body, candidate);
    if (plain === null) continue;
    const value = Number(`${sign}${plain}`);
    if (Number.isFinite(value)) return { status: "ok", value };
  }

  return { status: "invalid" };
}

/** Convenience read-side wrapper: the number, or `null` when unreadable. */
export function parseFinanceAmount(raw: string): number | null {
  const parsed = parseAmountInput(raw);
  return parsed.status === "ok" ? parsed.value : null;
}

/** Read-side wrapper for display, where an unreadable figure renders as zero. */
export function financeAmountOrZero(raw: string): number {
  return parseFinanceAmount(raw) ?? 0;
}

/**
 * The form an amount is written back in: a plain number string, rounded to
 * cents, with no grouping and no currency symbol. Keeping the stored value
 * language-neutral is what lets it round-trip through any reader's locale.
 */
export function toCanonicalAmount(value: number): string {
  return String(Math.round(value * 100) / 100);
}
