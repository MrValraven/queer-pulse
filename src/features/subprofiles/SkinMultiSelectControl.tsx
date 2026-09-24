import { useId, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { useSkinMultiSelect } from "./useSkinMultiSelect";
import { MultiSelectChips, MultiSelectPanel } from "./SkinMultiSelectParts";
import styles from "./SkinMultiSelectControl.module.css";

const NONE_KEY = "subprofiles:skinControl.multiSelect.none";
const COUNT_KEY = "subprofiles:skinControl.multiSelect.chosenCount";

/**
 * A `multiSelect` control (therapist lived experience, languages): a button
 * shaped like the pane's text inputs opens a checklist of the descriptor's
 * `options`, and the chosen entries sit under it as removable chips in pick
 * order. With `allowsCustom`, the panel also takes the owner's own words.
 *
 * The panel renders in flow under the trigger and pushes the card's content
 * down. A popover would overlap the next card and the sticky savebar, and on
 * a phone the pane sits inside a sheet, so in flow reads the same everywhere.
 *
 * The trigger comes first in the slot, so a jump to this field (publish
 * checklist, the public page's edit links) focuses it: the panel is closed
 * then, and the field has no text entry for the jump to prefer.
 */
export function SkinMultiSelectControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const countId = `${baseId}-count`;
  const panelId = `${baseId}-panel`;
  const helperId = `${baseId}-helper`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const select = useSkinMultiSelect(control, editor, {
    rootRef,
    triggerRef,
    panelRef,
  });
  const count = select.entries.length;
  const helper = control.helperKey ? t(control.helperKey) : undefined;

  return (
    <div ref={rootRef} className={styles.field}>
      {/* A span named through `aria-labelledby`: a `<label for>` would make a
          click on the label text toggle the panel. */}
      <span
        id={labelId}
        className={isLabelHidden ? "visuallyHidden" : styles.label}
      >
        {t(control.labelKey)}
      </span>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        aria-expanded={select.isOpen}
        aria-controls={select.isOpen ? panelId : undefined}
        aria-labelledby={`${labelId} ${countId}`}
        aria-describedby={helper ? helperId : undefined}
        onClick={select.toggleOpen}
      >
        <span className={styles.placeholder} aria-hidden>
          {control.placeholderKey ? t(control.placeholderKey) : null}
        </span>
        {/* The name reads "Languages, 2 chosen" (or "Nothing chosen yet")
            from this hidden line; the badge only shows the number. */}
        <span id={countId} className="visuallyHidden">
          {count > 0 ? t(COUNT_KEY, { count }) : t(NONE_KEY)}
        </span>
        {count > 0 && (
          <span className={styles.count} aria-hidden>
            {count}
          </span>
        )}
        <FiChevronDown aria-hidden className={styles.chevron} />
      </button>
      {select.isOpen && (
        <MultiSelectPanel
          select={select}
          control={control}
          panelRef={panelRef}
          panelId={panelId}
          labelId={labelId}
        />
      )}
      <MultiSelectChips
        select={select}
        labelId={labelId}
        triggerRef={triggerRef}
      />
      {helper && (
        <p id={helperId} className={styles.helper}>
          {helper}
        </p>
      )}
      <span className="visuallyHidden" role="status" aria-live="polite">
        {select.announcement}
      </span>
    </div>
  );
}
