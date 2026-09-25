import { useEffect, useId, useRef } from "react";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { useSkinMultiSelect, type SkinMultiSelect } from "./useSkinMultiSelect";
import { MultiSelectPanel } from "./SkinMultiSelectParts";
import { MultiSelectInlineRow } from "./SkinMultiSelectInlineRow";
import { SkinRefinedField } from "./SkinRefinedField";
import styles from "./SkinMultiSelectInline.module.css";

/**
 * The `multiSelect` field's markup: the field frame's label and helper, then
 * a row of toggle chips (the featured options, then what else is chosen),
 * and a trailing chip that opens the checklist panel in flow under the row,
 * listing the options beyond the featured ones. The panel opens and closes
 * with a height and fade (`Collapse`). Every edit goes through
 * `useSkinMultiSelect`, so the stored value keeps its shape.
 *
 * The wrapper is the hook's root: a pointer down anywhere in the row, the
 * panel or the label keeps the panel open.
 */
export function SkinMultiSelectInline({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const panelId = `${useId()}-panel`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const select = useSkinMultiSelect(control, editor, {
    rootRef,
    triggerRef,
    panelRef,
  });
  const helper = control.helperKey ? t(control.helperKey) : undefined;
  // The row already shows the featured options and the owner's own words as
  // chips (an own-words chip removes itself), so the panel lists only the
  // other options: its custom rows come from `entries`, which drop the own
  // words here. Every edit still goes through the one hook.
  const featuredValues = control.featuredValues ?? [];
  const panelSelect: SkinMultiSelect = {
    ...select,
    entries: select.entries.filter((entry) => !entry.isCustom),
    options: select.options.filter(
      (option) => !featuredValues.includes(option.value),
    ),
  };
  // The panel's rows are exactly these options, since it gets no own words.
  const hasPanelRows = panelSelect.options.length > 0;

  // A panel with no rows opens on "Add your own": this runs after the hook's
  // own focus effect, which finds no checkbox to focus then.
  useEffect(() => {
    if (!select.isOpen || hasPanelRows) return;
    panelRef.current
      ?.querySelector<HTMLInputElement>("input[type='text']")
      ?.focus();
  }, [select.isOpen, hasPanelRows]);

  return (
    <div ref={rootRef} className={styles.field}>
      <SkinRefinedField
        label={t(control.labelKey)}
        labelMode="span"
        isLabelHidden={isLabelHidden}
        helper={helper}
        helperTone={control.helperTone}
      >
        {(field) => (
          <>
            <MultiSelectInlineRow
              select={select}
              control={control}
              labelId={field.labelId}
              describedBy={field.describedBy}
              panelId={panelId}
              triggerRef={triggerRef}
            />
            <Collapse isOpen={select.isOpen}>
              <div className={styles.panelSlot}>
                <MultiSelectPanel
                  select={panelSelect}
                  control={control}
                  panelRef={panelRef}
                  panelId={panelId}
                  labelId={field.labelId}
                />
              </div>
            </Collapse>
          </>
        )}
      </SkinRefinedField>
      <span className="visuallyHidden" role="status" aria-live="polite">
        {select.announcement}
      </span>
    </div>
  );
}
