import { useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import {
  SkinListFrame,
  SkinListGrip,
  SkinListRowTools,
  SkinListRow,
} from "./SkinListParts";
import { useSkinListRows } from "./useSkinListRows";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";
import styles from "./SkinListControls.module.css";

/** One paragraph: the coral numeral with the grip beside it, an
 *  auto-growing textarea, and the tools top right. */
function SkinParagraphRow({
  text,
  index,
  count,
  placeholder,
  isDragging,
  onGripPointerDown,
  onChange,
  onMove,
  onRemove,
}: {
  text: string;
  index: number;
  count: number;
  placeholder?: string;
  isDragging: boolean;
  onGripPointerDown: Parameters<typeof SkinListGrip>[0]["onPointerDown"];
  onChange: (text: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoGrowFallback(textareaRef, text);
  const paragraphLabel = t("subprofiles:skinList.paragraphNumber", {
    index: index + 1,
  });

  return (
    <SkinListRow className={styles.paragraphRow} isDragging={isDragging}>
      <div className={styles.paragraphLead}>
        <span className={styles.numeral} aria-hidden>
          {index + 1}
        </span>
        <SkinListGrip onPointerDown={onGripPointerDown} />
      </div>
      <textarea
        ref={textareaRef}
        aria-label={paragraphLabel}
        className={styles.paragraphText}
        rows={3}
        value={text}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <SkinListRowTools
        className={styles.paragraphTools}
        index={index}
        count={count}
        onMove={onMove}
        onRemove={onRemove}
        rowLabel={t("subprofiles:skinList.paragraph")}
      />
    </SkinListRow>
  );
}

/**
 * A `paragraphs` list (the therapist's approach) as one auto-growing
 * textarea per paragraph, split by hairlines inside the group card. Blank
 * paragraphs may stay while editing; the save drops them.
 */
export function SkinParagraphsControl({
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
    >
      {rows.items.map((text, index) => (
        <SkinParagraphRow
          key={rows.rowKeys[index]}
          text={typeof text === "string" ? text : ""}
          index={index}
          count={rows.items.length}
          placeholder={placeholder}
          isDragging={rows.draggingIndex === index}
          onGripPointerDown={rows.gripHandlers(index).onPointerDown}
          onChange={(next) => rows.update(index, next)}
          onMove={rows.move}
          onRemove={() => rows.remove(index)}
        />
      ))}
    </SkinListFrame>
  );
}
