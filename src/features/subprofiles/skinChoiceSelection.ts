/**
 * Pure reads behind `SkinChoiceChipsControl`: which chips a stored `choice`
 * or `multiChoice` value selects. No React here.
 */

/** An option with its label already translated. */
export interface ChoiceOptionLabel {
  value: string;
  label: string;
}

export interface ChoiceSelection {
  /** Every selected value: an option's own value where the stored text
   *  matches one, else the stored text itself. */
  selectedValues: string[];
  /** The selected values that match no option (older owner-typed text). */
  extraValues: string[];
}

const folded = (text: string): string => text.trim().toLowerCase();

/** The option a stored text stands for: equal to its value or its label once
 *  both are trimmed and lower-cased ("weekly", "Weekly", "WEEKLY "). */
function matchOption(
  text: string,
  options: ChoiceOptionLabel[],
): string | undefined {
  const needle = folded(text);
  return options.find(
    (option) =>
      folded(option.value) === needle || folded(option.label) === needle,
  )?.value;
}

/** The trimmed, non-blank strings a stored value holds: every entry of a
 *  `multiChoice` list, or the one string of a `choice`. */
function storedTexts(stored: unknown, isMulti: boolean): string[] {
  const entries = isMulti ? (Array.isArray(stored) ? stored : []) : [stored];
  return entries
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** What a stored value selects. A text matching an option counts as that
 *  option (the stored text stays until the owner picks); duplicates collapse. */
export function choiceSelection(
  stored: unknown,
  isMulti: boolean,
  options: ChoiceOptionLabel[],
): ChoiceSelection {
  const selectedValues = [
    ...new Set(
      storedTexts(stored, isMulti).map(
        (text) => matchOption(text, options) ?? text,
      ),
    ),
  ];
  const optionValues = options.map((option) => option.value);
  return {
    selectedValues,
    extraValues: selectedValues.filter(
      (value) => !optionValues.includes(value),
    ),
  };
}
