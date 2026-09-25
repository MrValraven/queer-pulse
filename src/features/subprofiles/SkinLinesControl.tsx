import { useId } from "react";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import {
  SkinListFrame,
  SkinListGrip,
  SkinListRemoveButton,
  SkinListRow,
} from "./SkinListParts";
import { SkinLineField } from "./SkinLineField";
import { useSkinListRows } from "./useSkinListRows";
import { useSkinLineKeys } from "./useSkinLineKeys";
import { useRefinedPlaceholder } from "./refinedFieldSurface";
import styles from "./SkinListControls.module.css";

/**
 * A `lines` list (address lines, reasons, slots) as compact one-line rows in
 * the pair-row look: grip, one field, remove. Typing flows as the chips did:
 * Enter opens the next line, Backspace on an empty line folds it away, and a
 * pasted list splits into lines (`useSkinLineKeys`). Rows reorder by drag,
 * by the grip's move menu, or with Alt and an arrow key from the field; a
 * key hint under the list says so while focus is in it, in its touch wording
 * on a coarse pointer. The example placeholder shows on the first line only
 * while no line has text, so it never repeats beside a real item. An
 * `isWrapping` control wraps long sentences in each row. Blank lines may
 * stay while editing; the save drops them.
 */
export function SkinLinesControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const rows = useSkinListRows<string>({
    editor,
    path: control.path,
    createItem: () => "",
  });
  const lineKeys = useSkinLineKeys(rows);
  const placeholder = useRefinedPlaceholder(control.placeholderKey);
  const label = t(control.labelKey);
  const isWrapping = Boolean(control.isWrapping);
  const baseId = useId();
  const keyHintId = `${baseId}-key-hint`;
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const hasAnyLineText = rows.items.some(
    (line) => typeof line === "string" && line.trim() !== "",
  );

  return (
    <SkinListFrame
      control={control}
      isLabelHidden={isLabelHidden}
      itemCount={rows.items.length}
      containerRef={rows.containerRef}
      addButtonRef={rows.addButtonRef}
      onAdd={rows.add}
      defaultAddLabelKey="subprofiles:skinList.addLine"
      keyHint={{
        id: keyHintId,
        text: isCoarsePointer
          ? t("subprofiles:skinList.linesHintTouch")
          : t("subprofiles:skinList.linesHint"),
      }}
    >
      {rows.items.map((line, index) => (
        <SkinListRow
          key={rows.rowKeys[index]}
          className={[styles.lineRow, isWrapping && styles.lineRowWrapping]
            .filter(Boolean)
            .join(" ")}
          isDragging={rows.draggingIndex === index}
          isEntering={rows.isInsertedRow(index)}
          shouldGlide={rows.shouldRowsGlide}
        >
          <SkinListGrip
            {...rows.gripHandlers(index)}
            reorder={rows.reorderFor(index, label)}
          />
          <SkinLineField
            value={typeof line === "string" ? line : ""}
            isWrapping={isWrapping}
            placeholder={
              index === 0 && !hasAnyLineText ? placeholder : undefined
            }
            ariaLabel={t("subprofiles:skinBlock.lineLabel", {
              label,
              index: index + 1,
            })}
            describedBy={keyHintId}
            onEdit={(next) => rows.update(index, next)}
            {...lineKeys.fieldHandlers(index)}
          />
          <SkinListRemoveButton
            className={styles.pairRemove}
            rowLabel={label}
            rowNumber={index + 1}
            onRemove={() => rows.remove(index)}
          />
        </SkinListRow>
      ))}
    </SkinListFrame>
  );
}
