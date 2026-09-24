import {
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinChipEditEnd } from "./useSkinChipKeyboard";
import styles from "./SkinChipsControl.module.css";

/** A chip opened for editing: an input that grows with its text. The hidden
 *  twin in `.editSizer::after` sets the width, so no measuring is needed. */
function SkinChipEditor({
  text,
  onFinish,
}: {
  text: string;
  onFinish: (text: string, how: SkinChipEditEnd) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(text);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onFinish(value, event.key === "Enter" ? "enter" : "escape");
    }
  }

  return (
    <span className={styles.editSizer} data-value={value}>
      <input
        className={styles.editInput}
        value={value}
        size={1}
        aria-label={t("subprofiles:skinChips.editLabel", { text })}
        autoComplete="off"
        // Opening a chip for editing is an explicit request to type in it.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => onFinish(value, "blur")}
      />
    </span>
  );
}

export interface SkinChipProps {
  text: string;
  isEditing: boolean;
  isDragging: boolean;
  isFlashing: boolean;
  /** Id of the hidden line that tells a screen reader the chip's keys. */
  keysHintId: string;
  chipRef: (element: HTMLElement | null) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onStartEditing: () => void;
  onFinishEditing: (text: string, how: SkinChipEditEnd) => void;
  onRemove: () => void;
}

/**
 * One chip of `SkinChipsControl`. The text is a button (click, Enter or F2
 * opens it for editing) and the only tab stop; the remove button is a pointer
 * target, with Delete and Backspace as its keyboard path.
 */
export function SkinChip({
  text,
  isEditing,
  isDragging,
  isFlashing,
  keysHintId,
  chipRef,
  onPointerDown,
  onKeyDown,
  onStartEditing,
  onFinishEditing,
  onRemove,
}: SkinChipProps) {
  const { t } = useTranslation();
  const className = [
    styles.chip,
    isEditing && styles.chipEditing,
    isDragging && styles.chipDragging,
    isFlashing && styles.chipFlash,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="listitem"
      className={className}
      data-chip=""
      onPointerDown={onPointerDown}
    >
      {isEditing ? (
        <SkinChipEditor text={text} onFinish={onFinishEditing} />
      ) : (
        <>
          <button
            type="button"
            ref={chipRef}
            className={styles.chipText}
            aria-describedby={keysHintId}
            onClick={onStartEditing}
            onKeyDown={onKeyDown}
          >
            {text}
          </button>
          <button
            type="button"
            className={styles.chipRemove}
            data-chip-remove=""
            tabIndex={-1}
            aria-label={t("subprofiles:skinChips.remove", { text })}
            // Focus stays where it was (often the add input), since this
            // button unmounts with its chip.
            onMouseDown={(event) => event.preventDefault()}
            onClick={onRemove}
          >
            <FiX size={14} aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}
