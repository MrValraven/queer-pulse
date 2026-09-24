import { useId } from "react";
import {
  FiCheckCircle,
  FiCheckSquare,
  FiCircle,
  FiSquare,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { choiceSelection, type ChoiceOptionLabel } from "./skinChoiceSelection";
import styles from "./SkinChoiceChipsControl.module.css";

const LEGACY_HELPER_KEY =
  "subprofiles:skinBlock.therapist.therapyFees.legacyChoiceHelper";
const LEGACY_TEXT_HELPER_KEY =
  "subprofiles:skinBlock.therapist.therapyFees.legacyTextHelper";
const CLEAR_HINT_KEY = "subprofiles:skinBlock.choiceClearHint";

/** The always-present indicator, by input type then selected state, so a
 *  chip keeps its width when picked and single and multi groups look apart. */
const INDICATOR = {
  radio: { on: FiCheckCircle, off: FiCircle },
  checkbox: { on: FiCheckSquare, off: FiSquare },
};

/** One chip: a fixed option or, with `isExtra`, a stored value that is no
 *  option (an earlier answer), shown exactly as stored. */
interface ChoiceChipItem extends ChoiceOptionLabel {
  isExtra: boolean;
}

/** One toggle chip: a visually hidden radio or checkbox inside its label, so
 *  arrow keys, Space and the screen-reader state come from the native input.
 *  The indicator icon and the plum fill mark the selected state. */
function ChoiceChip({
  item,
  type,
  groupName,
  isSelected,
  describedBy,
  onToggle,
}: {
  item: ChoiceChipItem;
  type: "radio" | "checkbox";
  groupName: string;
  isSelected: boolean;
  describedBy: string | undefined;
  onToggle: (isClearing: boolean) => void;
}) {
  const Indicator = INDICATOR[type][isSelected ? "on" : "off"];
  return (
    <label
      className={[
        styles.chip,
        isSelected && styles.chipSelected,
        item.isExtra && styles.chipLegacy,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type={type}
        name={groupName}
        value={item.value}
        checked={isSelected}
        className="visuallyHidden"
        aria-describedby={describedBy}
        onChange={() => onToggle(false)}
        // A radio that is already checked fires no change event, so a click
        // (or Space) on it is read here as "unselect".
        onClick={() => {
          if (type === "radio" && isSelected) onToggle(true);
        }}
      />
      <Indicator aria-hidden className={styles.indicator} />
      <span className={styles.chipText}>{item.label}</span>
    </label>
  );
}

/**
 * A `choice` or `multiChoice` control: the descriptor's `options` as a
 * wrapping row of toggle chips inside a fieldset. `choice` stores one option
 * value as a string; clicking the selected chip clears it to "". A stored
 * text equal to an option's value or label (trimmed, any case) selects that
 * option. Any other stored string is older owner-typed text: it shows first
 * as an extra selected chip (dashed, italic) with a helper line under the
 * group, until a real choice replaces it. `multiChoice` stores a `string[]` in the
 * options' order; a stored entry that is not an option stays as an extra
 * chip, kept first, until it is unticked. With `legacyTextPath`, the older
 * free-text answer at that path is quoted under the chips while none is
 * ticked, and the first tick clears it ("Discard all" restores it).
 */
export function SkinChoiceChipsControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const groupName = useId();
  const helperId = `${groupName}-helper`;
  const legacyHelperId = `${groupName}-legacy`;
  const clearHintId = `${groupName}-clear`;
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
  const describedBy =
    [helper && helperId, legacyNote && legacyHelperId, !isMulti && clearHintId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <fieldset className={styles.fieldset} aria-describedby={describedBy}>
      <legend className={isLabelHidden ? "visuallyHidden" : styles.legend}>
        {t(control.labelKey)}
      </legend>
      <div className={styles.chips}>
        {items.map((item) => (
          <ChoiceChip
            key={item.value}
            item={item}
            type={isMulti ? "checkbox" : "radio"}
            groupName={groupName}
            isSelected={selectedValues.includes(item.value)}
            describedBy={describedBy}
            onToggle={(isClearing) => toggle(item.value, isClearing)}
          />
        ))}
      </div>
      {helper && (
        <p id={helperId} className={styles.helper}>
          {helper}
        </p>
      )}
      {legacyNote && (
        <p id={legacyHelperId} className={styles.helper}>
          {legacyNote}
        </p>
      )}
      {!isMulti && (
        <span id={clearHintId} hidden>
          {t(CLEAR_HINT_KEY)}
        </span>
      )}
    </fieldset>
  );
}
