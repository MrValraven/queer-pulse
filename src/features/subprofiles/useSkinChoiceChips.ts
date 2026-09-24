import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { choiceSelection, type ChoiceOptionLabel } from "./skinChoiceSelection";

const LEGACY_HELPER_KEY =
  "subprofiles:skinBlock.therapist.therapyFees.legacyChoiceHelper";
const LEGACY_TEXT_HELPER_KEY =
  "subprofiles:skinBlock.therapist.therapyFees.legacyTextHelper";
const CHOICE_CLEAR_HINT_KEY = "subprofiles:skinBlock.choiceClearHint";

/** One chip: a fixed option or, with `isExtra`, a stored value that is no
 *  option (an earlier answer), shown exactly as stored. */
export interface ChoiceChipItem extends ChoiceOptionLabel {
  isExtra: boolean;
}

/**
 * The data side of a `choice` / `multiChoice` control, shared by the generic
 * page blocks editor (`SkinChoiceChipsControl`) and the therapist chapter
 * editor (`SkinChoiceChipsRefined`): the chips to show, which are selected,
 * the toggle that writes the stored shape, the helper and the note about an
 * older answer.
 *
 * `choice` stores one option value as a string; clearing it stores "". A
 * stored text equal to an option's value or label (trimmed, any case)
 * selects that option; any other stored string is older owner-typed text,
 * shown first as an extra chip. `multiChoice` stores a `string[]` in the
 * options' order, extra entries kept first. With `legacyTextPath`, the first
 * tick clears the older free text at that path.
 */
export function useSkinChoiceChips(
  control: SkinBlockControl,
  editor: SubprofileSkinBlocksEditor,
) {
  const { t } = useTranslation();
  const isMulti = control.kind === "multiChoice";
  const options: ChoiceOptionLabel[] = (control.options ?? []).map(
    (option) => ({ value: option.value, label: t(option.labelKey) }),
  );
  const optionValues = options.map((option) => option.value);
  const { selectedValues, extraValues } = choiceSelection(
    editor.getValue(control.path),
    isMulti,
    options,
  );
  const legacyStored = control.legacyTextPath
    ? editor.getValue(control.legacyTextPath)
    : undefined;
  const legacyText =
    typeof legacyStored === "string" ? legacyStored.trim() : "";
  const items: ChoiceChipItem[] = [
    ...extraValues.map((value) => ({ value, label: value, isExtra: true })),
    ...options.map((option) => ({ ...option, isExtra: false })),
  ];

  function toggle(value: string, isClearing: boolean): void {
    if (!isMulti) {
      editor.setValue(control.path, isClearing ? "" : value);
      return;
    }
    const next = selectedValues.includes(value)
      ? selectedValues.filter((entry) => entry !== value)
      : [...selectedValues, value];
    // The first tick supersedes the older free text, so it stops lingering
    // in storage (the public page ignores it once methods exist).
    if (control.legacyTextPath && legacyText && selectedValues.length === 0) {
      editor.setValue(control.legacyTextPath, "");
    }
    editor.setValue(control.path, [
      ...next.filter((entry) => !optionValues.includes(entry)),
      ...optionValues.filter((optionValue) => next.includes(optionValue)),
    ]);
  }

  const helper = control.helperKey ? t(control.helperKey) : undefined;
  // One note about an older answer: the extra chip of a `choice`, or the
  // free text at `legacyTextPath` while nothing is ticked.
  const legacyNote =
    !isMulti && extraValues.length > 0
      ? t(LEGACY_HELPER_KEY)
      : legacyText && selectedValues.length === 0
        ? t(LEGACY_TEXT_HELPER_KEY, { text: legacyText })
        : "";

  return {
    isMulti,
    items,
    selectedValues,
    toggle,
    label: t(control.labelKey),
    helper,
    legacyNote,
    clearHint: t(CHOICE_CLEAR_HINT_KEY),
  };
}
