import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import {
  SkinListFrame,
  SkinListGrip,
  SkinListRemoveButton,
  SkinListRow,
} from "./SkinListParts";
import { useSkinListRows } from "./useSkinListRows";
import styles from "./SkinListControls.module.css";

/**
 * A `lines` list (address lines) as compact one-line rows in the pair-row
 * look: grip, one input, remove. Rows reorder by drag, or with Alt and an
 * arrow key from the input. Blank lines may stay while editing; the save
 * drops them.
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
  const label = t(control.labelKey);
  const placeholder = control.placeholderKey
    ? t(control.placeholderKey)
    : undefined;

  return (
    <SkinListFrame
      control={control}
      isLabelHidden={isLabelHidden}
      itemCount={rows.items.length}
      containerRef={rows.containerRef}
      addButtonRef={rows.addButtonRef}
      onAdd={rows.add}
      defaultAddLabelKey="subprofiles:skinList.addLine"
    >
      {rows.items.map((line, index) => (
        <SkinListRow
          key={rows.rowKeys[index]}
          className={styles.lineRow}
          isDragging={rows.draggingIndex === index}
        >
          <SkinListGrip {...rows.gripHandlers(index)} />
          <input
            className={styles.pairInput}
            value={typeof line === "string" ? line : ""}
            placeholder={placeholder}
            aria-label={t("subprofiles:skinBlock.lineLabel", {
              label,
              index: index + 1,
            })}
            aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
            onChange={(event) => rows.update(index, event.target.value)}
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
