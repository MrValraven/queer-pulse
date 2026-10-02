import { useId } from "react";
import { FiCheck, FiCheckCircle, FiCircle, FiPlus } from "react-icons/fi";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { useSkinChoiceChips, type ChoiceChipItem } from "./useSkinChoiceChips";
import { SkinRefinedField } from "./SkinRefinedField";
import { SkinChoiceTile } from "./SkinChoiceTile";
import styles from "./SkinChoiceChipsRefined.module.css";
import tileStyles from "./SkinChoiceTiles.module.css";

/** Up to this many tiles share one row (table format's three), each a
 *  narrower card; more wrap two to a row at most. */
const COMPACT_TILE_COUNT = 3;

/** The leading icon of an unpicked chip: a hollow circle for a single choice,
 *  a plus for a multi choice (the multiSelect chip's own icon). Every icon is
 *  the same size, so picking a chip never changes its width. */
const UNPICKED_INDICATOR = { radio: FiCircle, checkbox: FiPlus };

/** Its picked twin: a circled check for a single choice, a plain check for a
 *  multi choice, so "one of these" and "any of these" stay apart once picked. */
const PICKED_INDICATOR = { radio: FiCheckCircle, checkbox: FiCheck };

/** One pill toggle chip: a visually hidden radio or checkbox inside its
 *  label, so arrow keys, Space and the screen-reader state still come from
 *  the native input. */
function RefinedChoiceChip({
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
  const Indicator = isSelected
    ? PICKED_INDICATOR[type]
    : UNPICKED_INDICATOR[type];
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
 * The therapist chapter editor's `choice` / `multiChoice` control: the
 * frame's label and hint above a group of pill chips that speak the same
 * language as the multiSelect chip row (plum and a check once picked, paper
 * and an outline before). The group is named by the frame's label through
 * `aria-labelledby`; the note about an older answer sits under the chips and
 * joins the description. Selection rules are `useSkinChoiceChips`. With
 * `optionLayout: "tiles"` the options are cards that say what each means
 * (`SkinChoiceTile`), over the same inputs and selection rules.
 */
export function SkinChoiceChipsRefined({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const groupName = useId();
  const clearHintId = `${groupName}-clear`;
  const {
    isMulti,
    items,
    selectedValues,
    toggle,
    label,
    helper,
    legacyNote,
    clearHint,
  } = useSkinChoiceChips(control, editor);
  const isTiles = control.optionLayout === "tiles";
  const Option = isTiles ? SkinChoiceTile : RefinedChoiceChip;

  return (
    <SkinRefinedField
      label={label}
      isLabelHidden={isLabelHidden}
      labelMode="span"
      helper={helper}
      helperTone={control.helperTone}
      footer={legacyNote || undefined}
    >
      {(frame) => {
        const describedBy =
          [
            frame.describedBy,
            legacyNote && frame.footerId,
            !isMulti && clearHintId,
          ]
            .filter(Boolean)
            .join(" ") || undefined;
        return (
          <>
            <div
              role="group"
              className={
                isTiles
                  ? `${tileStyles.tiles} ${
                      items.length <= COMPACT_TILE_COUNT
                        ? tileStyles.tilesCompact
                        : ""
                    }`
                  : styles.chips
              }
              aria-labelledby={frame.labelId}
              aria-describedby={describedBy}
            >
              {items.map((item) => (
                <Option
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
            {!isMulti && (
              <span id={clearHintId} hidden>
                {clearHint}
              </span>
            )}
          </>
        );
      }}
    </SkinRefinedField>
  );
}
