import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";

/**
 * The digit rules behind the money and count inputs of the chaptered skin
 * editor (SkinNumberControls).
 */

const NON_DIGITS = /\D/g;
const NON_AMOUNT_CHARACTERS = /[^\d.,]/g;
/** Digits with at most one decimal separator (, or .) and two decimals. */
const AMOUNT_PATTERN = /^\d*(?:[.,]\d{0,2})?$/;

/** Only whole digits: "12 places" becomes "12". */
export function toWholeDigits(typed: string): string {
  return typed.replace(NON_DIGITS, "");
}

/** Strip a legacy stored amount to its number for display: "65€" reads
 *  "65", "60.00" stays "60.00". Nothing is written back until an edit. */
export function toDisplayAmount(stored: string): string {
  return stored.replace(NON_AMOUNT_CHARACTERS, "");
}

/** The next amount after an edit, or null to refuse it. Stray characters
 *  ("65€") are dropped; a second separator or a third decimal is refused
 *  whole, so digits on either side of a separator never merge. A deletion
 *  is always accepted, so a legacy value that breaks the pattern can still
 *  be cleared. */
export function nextAmount(typed: string, previous: string): string | null {
  const cleaned = typed.replace(NON_AMOUNT_CHARACTERS, "");
  if (AMOUNT_PATTERN.test(cleaned)) return cleaned;
  return cleaned.length < previous.length ? cleaned : null;
}

/** The stored string at a control's path ("" while empty). A number from
 *  older data is read as its decimal text. */
export function readStored(
  editor: SubprofileSkinBlocksEditor,
  path: string,
): string {
  const stored = editor.getValue(path);
  if (typeof stored === "string") return stored;
  if (typeof stored === "number" && Number.isFinite(stored)) {
    return String(stored);
  }
  return "";
}
