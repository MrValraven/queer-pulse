import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { useSkinChipsField } from "./useSkinChipsField";
import { SkinChipItems } from "./SkinChip";
import { SkinRefinedField } from "./SkinRefinedField";
import {
  refinedSurfaceClassName,
  useRefinedPlaceholder,
} from "./refinedFieldSurface";
import styles from "./SkinChipsControl.module.css";

/**
 * The `chips` field's markup: the frame's label and hint on top, the entries
 * as a row of paper chips (the owner's own words; plum is kept for chips
 * picked from options), then the add input on the refined surface with an
 * "e.g." example. The frame's `<label htmlFor>` points at the add input, so
 * a click on the label focuses it, and its id names the chip list too.
 * Keyboard, drag and editing come from `useSkinChipsField`.
 */
export function SkinChipsRefined({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const field = useSkinChipsField(control, editor);
  const { ids, label, helper, addHint, chipHint, list, visibleHint } = field;
  const { inputRef, draft, addInputHandlers } = field.keyboard;
  const { listRef, draggingIndex, swallowClickAfterDrag } = field.drag;
  const examplePlaceholder = useRefinedPlaceholder(control.placeholderKey);
  // With entries in place the line invites one more (an instruction, so no
  // "e.g."); an empty field shows the example.
  const placeholder =
    list.entries.length > 0
      ? t("subprofiles:skinChips.addAnother")
      : examplePlaceholder;
  // The add input takes its surface from its own draft: it rests recessed on
  // cream while the entries above stand as values on paper.
  const addInputClassName = refinedSurfaceClassName({
    isEmpty: draft.trim() === "",
  });

  return (
    <SkinRefinedField
      label={label}
      isLabelHidden={isLabelHidden}
      helper={helper}
      helperTone={control.helperTone}
      footer={
        visibleHint ? <span aria-hidden="true">{visibleHint}</span> : undefined
      }
    >
      {(frame) => (
        <div onFocus={field.onFieldFocus} onBlur={field.onFieldBlur}>
          <div
            role="list"
            ref={listRef}
            className={[
              styles.refinedList,
              draggingIndex === null ? null : styles.refinedListDragging,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-labelledby={frame.labelId}
            onClickCapture={swallowClickAfterDrag}
          >
            <SkinChipItems field={field} />
          </div>
          <input
            id={frame.controlId}
            ref={inputRef}
            className={addInputClassName}
            value={draft}
            placeholder={placeholder}
            autoComplete="off"
            aria-describedby={[frame.describedBy, ids.addHintId]
              .filter(Boolean)
              .join(" ")}
            {...addInputHandlers}
          />
          <span id={ids.addHintId} hidden>
            {addHint}
          </span>
          <span id={ids.chipHintId} hidden>
            {chipHint}
          </span>
          <span className="visuallyHidden" role="status" aria-live="polite">
            {list.announcement}
          </span>
        </div>
      )}
    </SkinRefinedField>
  );
}
