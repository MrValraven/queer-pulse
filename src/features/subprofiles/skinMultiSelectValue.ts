import type { ChoiceOptionLabel } from "./skinChoiceSelection";

/**
 * Pure reads behind `SkinMultiSelectControl`: which entries a stored
 * `multiSelect` value holds, and what typed text would add. No React here.
 */

/** An option with its label in the current language and, once that catalog
 *  has loaded, in the other one, so text saved in either language matches. */
export interface MultiSelectOption extends ChoiceOptionLabel {
  otherLabel?: string;
}

/** One chosen entry: a fixed option (stored by its id, shown by its
 *  translated label) or the owner's own words, shown exactly as stored. */
export interface MultiSelectEntry {
  value: string;
  label: string;
  isCustom: boolean;
}

const folded = (text: string): string => text.trim().toLowerCase();

/** Whether a folded text equals the option's label in either language. */
function isLabelMatch(option: MultiSelectOption, needle: string): boolean {
  return (
    folded(option.label) === needle ||
    (option.otherLabel !== undefined && folded(option.otherLabel) === needle)
  );
}

/** The option a stored text stands for: its id or either label, trimmed and
 *  in any case ("pt", "Portuguese", "português "). */
function matchStored(
  text: string,
  options: MultiSelectOption[],
): string | undefined {
  const needle = folded(text);
  return options.find(
    (option) => folded(option.value) === needle || isLabelMatch(option, needle),
  )?.value;
}

/** The option typed text names: either label only, so a short word that
 *  happens to be an id ("it", "uk") stays the owner's own words. */
function matchTyped(
  text: string,
  options: MultiSelectOption[],
): string | undefined {
  const needle = folded(text);
  return options.find((option) => isLabelMatch(option, needle))?.value;
}

/** The trimmed, non-blank texts a stored value holds: every entry of a list,
 *  or the comma-separated parts of an older one-line answer
 *  ("Portuguese, English"). */
function storedTexts(stored: unknown): string[] {
  const entries = Array.isArray(stored)
    ? stored
    : typeof stored === "string"
      ? stored.split(",")
      : [];
  return entries
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** The chosen values in stored order. A text equal to an option's id or
 *  either label (trimmed, any case) counts as that option's id, so the next
 *  edit stores the id. Duplicates collapse, compared trimmed and in any case. */
export function multiSelectValues(
  stored: unknown,
  options: MultiSelectOption[],
): string[] {
  const seenKeys = new Set<string>();
  const values: string[] = [];
  for (const text of storedTexts(stored)) {
    const value = matchStored(text, options) ?? text;
    const key = folded(value);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    values.push(value);
  }
  return values;
}

/** A chosen value as the control shows it. */
export function multiSelectEntry(
  value: string,
  options: ChoiceOptionLabel[],
): MultiSelectEntry {
  const option = options.find((candidate) => candidate.value === value);
  return option
    ? { value, label: option.label, isCustom: false }
    : { value, label: value, isCustom: true };
}

/** What typed text does: nothing when blank, point at the chosen entry it
 *  repeats, or add a value (an option's id when the text names one by its
 *  label, else the trimmed text). */
export type TypedEntryResult =
  | { kind: "blank" }
  | { kind: "alreadyChosen"; value: string }
  | { kind: "add"; value: string };

export function typedEntryResult(
  text: string,
  chosenValues: string[],
  options: MultiSelectOption[],
): TypedEntryResult {
  const trimmed = text.trim();
  if (!trimmed) return { kind: "blank" };
  const value = matchTyped(trimmed, options) ?? trimmed;
  const chosen = chosenValues.find(
    (chosenValue) => folded(chosenValue) === folded(value),
  );
  return chosen === undefined
    ? { kind: "add", value }
    : { kind: "alreadyChosen", value: chosen };
}
