/**
 * Money display for the magazine desk (CON-18).
 *
 * Amounts arrive from the API as DECIMAL STRINGS off Postgres `numeric`
 * ("420.00"). Nothing here parses one into a `number`: binary floats cannot
 * hold 0.10, and these are the figures an issue's cost is built from. Every
 * total the desk shows is summed server-side and arrives already formed.
 */

const SYMBOL_BY_CURRENCY: Record<string, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
  BRL: "R$",
};

/**
 * "€420.00" for a currency with a known symbol, "CHF 420.00" otherwise.
 * `null` amount gives `null` back so the caller picks its own empty copy
 * rather than printing a zero nobody agreed to.
 */
export function formatMoney(
  currency: string,
  amount: string | null,
): string | null {
  if (amount === null) return null;
  const code = currency.toUpperCase();
  const symbol = SYMBOL_BY_CURRENCY[code];
  return symbol ? `${symbol}${amount}` : `${code} ${amount}`;
}

/**
 * The desk's own wording for a money field, when it says something the
 * amount cannot.
 *
 * With no amount the text IS the record and always shows. With an amount,
 * the text only earns its place when it carries words: "€420" beside
 * "€420.00" is noise, while "18 travel, receipts with Marta" beside "€18.00"
 * is the receipt. Strip currency marks, digits and separators; whatever is
 * left is what the editor actually wrote.
 */
export function moneyNote(
  amount: string | null,
  text: string | null,
): string | null {
  if (!text) return null;
  if (amount === null) return text;
  const residue = text
    .replace(/\p{Sc}/gu, "")
    // Named ISO codes only. Stripping any three-letter word would swallow
    // "€18 bus" and hide the one thing that line was recording.
    .replace(/\b(EUR|GBP|USD|BRL|CHF)\b/gi, "")
    .replace(/[\d.,\s]/g, "");
  return residue.length > 0 ? text : null;
}
