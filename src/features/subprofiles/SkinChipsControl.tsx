import { useId, useState, type FocusEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { useSkinChipsList } from "./useSkinChipsList";
import { useSkinChipKeyboard } from "./useSkinChipKeyboard";
import { useSkinChipDrag } from "./useSkinChipDrag";
import { SkinChip } from "./SkinChip";
import styles from "./SkinChipsControl.module.css";

/** Where focus sits inside the field, which picks the visible key hint. */
type FocusZone = "input" | "chip" | "editing" | null;

/**
 * A `chips` control: an ordered `string[]` edited as chips inside one
 * input-like field (therapist lived experience, modalities, access, ...).
 * Type and press Enter to add, click a chip to edit it in place, drag or
 * Alt+arrow to reorder, Delete or the cross to remove. Only trimmed,
 * non-blank, case-insensitively unique entries are ever stored.
 */
export function SkinChipsControl({
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
  const inputId = `${baseId}-input`;
  const helperId = `${baseId}-helper`;
  const addHintId = `${baseId}-add-hint`;
  const chipHintId = `${baseId}-chip-hint`;
  const label = t(control.labelKey);
  const helper = control.helperKey ? t(control.helperKey) : undefined;
  const addHint = t("subprofiles:skinChips.addHint");
  const chipHint = t("subprofiles:skinChips.chipHint");

  const list = useSkinChipsList(control.path, editor);
  const {
    inputRef,
    draft,
    editingKey,
    registerChip,
    startEditing,
    finishEditing,
    onChipKeyDown,
    addInputHandlers,
  } = useSkinChipKeyboard(list);
  const { listRef, draggingIndex, chipPressHandlers, swallowClickAfterDrag } =
    useSkinChipDrag(
      (from, to) => list.swap(from, to, false),
      (startIndex, endIndex) => {
        const moved = list.entries[endIndex];
        if (startIndex !== endIndex && moved !== undefined) {
          list.announceMoved(moved, endIndex);
        }
      },
    );
  const [focusZone, setFocusZone] = useState<FocusZone>(null);

  const onFieldFocus = (event: FocusEvent<HTMLDivElement>) =>
    setFocusZone(
      event.target.id === inputId
        ? "input"
        : event.target instanceof HTMLInputElement
          ? "editing"
          : "chip",
    );
  const onFieldBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
      setFocusZone(null);
    }
  };

  const placeholder =
    list.entries.length > 0
      ? t("subprofiles:skinChips.addAnother")
      : control.placeholderKey
        ? t(control.placeholderKey)
        : undefined;
  const zoneHints: Record<Exclude<FocusZone, null>, string> = {
    input: addHint,
    chip: chipHint,
    editing: t("subprofiles:skinChips.editHint"),
  };
  const visibleHint = list.notice || (focusZone ? zoneHints[focusZone] : "");

  return (
    <div className={styles.field} onFocus={onFieldFocus} onBlur={onFieldBlur}>
      {!isLabelHidden && (
        <label id={labelId} htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={
          draggingIndex === null
            ? styles.box
            : `${styles.box} ${styles.boxDragging}`
        }
      >
        <div
          role="list"
          className={styles.list}
          ref={listRef}
          aria-labelledby={isLabelHidden ? undefined : labelId}
          aria-label={isLabelHidden ? label : undefined}
          onClickCapture={swallowClickAfterDrag}
        >
          {list.entries.map((text, index) => {
            const key = list.keys[index]!;
            return (
              <SkinChip
                key={key}
                text={text}
                isEditing={editingKey === key}
                isDragging={draggingIndex === index}
                isFlashing={list.flashingKey === key}
                keysHintId={chipHintId}
                chipRef={registerChip(key)}
                onPointerDown={chipPressHandlers(index).onPointerDown}
                onKeyDown={(event) => onChipKeyDown(index, event)}
                onStartEditing={() => startEditing(key)}
                onFinishEditing={(value, how) =>
                  finishEditing(index, value, how)
                }
                onRemove={() => list.removeAt(index)}
              />
            );
          })}
        </div>
        <input
          id={inputId}
          ref={inputRef}
          className={styles.addInput}
          value={draft}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={isLabelHidden ? label : undefined}
          aria-describedby={[helper && helperId, addHintId]
            .filter(Boolean)
            .join(" ")}
          {...addInputHandlers}
        />
      </div>
      {helper && (
        <p id={helperId} className={styles.helper}>
          {helper}
        </p>
      )}
      {/* Rendered only while it has something to say, so an idle chip field
          keeps the same rhythm as a plain text field. */}
      {visibleHint && (
        <p className={styles.hint} aria-hidden="true">
          {visibleHint}
        </p>
      )}
      <span id={addHintId} hidden>
        {addHint}
      </span>
      <span id={chipHintId} hidden>
        {chipHint}
      </span>
      <span className="visuallyHidden" role="status" aria-live="polite">
        {list.announcement}
      </span>
    </div>
  );
}
