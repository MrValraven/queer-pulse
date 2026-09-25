import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";
import { refinedSurfaceClassName } from "./refinedFieldSurface";
import styles from "./SkinListControls.module.css";

type LineField = HTMLInputElement | HTMLTextAreaElement;

const LINE_BREAKS = /\r\n|\r|\n/g;

/**
 * One line's field in a `lines` list. A plain line is a single-line input;
 * an `isWrapping` line is a one-row textarea that rests at the input's 48px
 * and grows as a long sentence wraps (`field-sizing`, or
 * `useAutoGrowFallback`). It never stores a line break: Enter belongs to the
 * list (`useSkinLineKeys`), and a break that still arrives, by drop or
 * autocorrect, becomes a space. Both declare the Alt with arrow shortcut, so
 * `useSkinListRows` moves the row from either.
 */
export function SkinLineField({
  value,
  isWrapping,
  placeholder,
  ariaLabel,
  describedBy,
  onEdit,
  onKeyDown,
  onPaste,
}: {
  value: string;
  isWrapping: boolean;
  placeholder: string | undefined;
  ariaLabel: string;
  describedBy: string | undefined;
  onEdit: (next: string) => void;
  onKeyDown: (event: KeyboardEvent<LineField>) => void;
  onPaste: (event: ClipboardEvent<LineField>) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutoGrowFallback(textareaRef, value);
  const isEmpty = value.trim() === "";
  const sharedProps = {
    value,
    placeholder,
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
    "aria-keyshortcuts": "Alt+ArrowUp Alt+ArrowDown",
    onKeyDown,
    onPaste,
  };

  if (!isWrapping) {
    return (
      <input
        {...sharedProps}
        className={refinedSurfaceClassName({ isEmpty })}
        onChange={(event) => onEdit(event.target.value)}
      />
    );
  }
  return (
    <textarea
      {...sharedProps}
      ref={textareaRef}
      rows={1}
      className={`${refinedSurfaceClassName({ isMultiline: true, isEmpty })} ${styles.lineWrapping}`}
      onChange={(event) => onEdit(event.target.value.replace(LINE_BREAKS, " "))}
    />
  );
}
