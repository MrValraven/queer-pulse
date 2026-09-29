import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FiEdit2, FiPlus } from "react-icons/fi";
import styles from "./StickerPackHeader.module.css";

const MAX_PACK_NAME_LENGTH = 80;

/**
 * One of the pack's names as an inline-editable line. At rest it is a button
 * that reads as the text itself with a pencil beside it; activating it swaps
 * in a text input. Enter or leaving the field saves a changed name; Escape
 * puts the old one back. Editing is tied to `packId`, so switching packs
 * mid-edit drops the draft and leaves the new pack alone.
 *
 * `variant="title"` is the English name as the page heading, where an empty
 * field puts the old name back. `variant="secondary"` is the optional
 * Portuguese name on a quieter line below it, where an empty field saves as
 * `null` and clears it. With no name saved, that line reads as an invitation:
 * italic, quieter, with a plus in place of the pencil.
 */
export function StickerPackNameEditor({
  packId,
  value,
  variant,
  displayText,
  buttonLabel,
  hiddenEditLabel,
  inputLabel,
  hint,
  lang,
  onSave,
}: {
  packId: string;
  /** The saved name, or null when this optional name has none. */
  value: string | null;
  variant: "title" | "secondary";
  /** What the line reads at rest. */
  displayText: string;
  /** The button's whole accessible name, when it must name more than the
   *  visible text (the title's "Rename {name}", which contains that text). */
  buttonLabel?: string;
  /** Read after the visible text, for screen readers only. Lets the
   *  accessible name begin with what the button shows (WCAG 2.5.3). */
  hiddenEditLabel?: string;
  inputLabel: string;
  hint: string;
  /** The language of the name typed into the input. */
  lang?: string;
  onSave: (name: string | null) => void;
}) {
  const hintId = useId();
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState(value ?? "");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const hasFinishedRef = useRef(false);
  const isEditing = editingPackId === packId;
  const isOptional = variant === "secondary";

  // Focus follows the swap both ways: into the input (text selected, ready to
  // overwrite) when editing starts, and back to the button after Enter or
  // Escape. A blur save leaves focus wherever the admin clicked.
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }
    if (!shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    buttonRef.current?.focus();
  }, [isEditing]);

  function startEditing() {
    hasFinishedRef.current = false;
    setDraftName(value ?? "");
    setEditingPackId(packId);
  }

  // Guarded by a ref so the blur that can follow an Enter or Escape (the
  // input unmounting under focus, still running the old render's handler)
  // cannot save a second time or undo an Escape.
  function finishEditing(shouldSave: boolean, shouldRestoreFocus: boolean) {
    if (!isEditing || hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    const trimmedName = draftName.trim();
    const nextValue = trimmedName.length > 0 ? trimmedName : null;
    const isSaveable =
      (nextValue !== null || isOptional) &&
      trimmedName.length <= MAX_PACK_NAME_LENGTH &&
      nextValue !== value;
    shouldRestoreFocusRef.current = shouldRestoreFocus;
    setEditingPackId(null);
    if (shouldSave && isSaveable) onSave(nextValue);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      finishEditing(true, true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finishEditing(false, true);
    }
  }

  const isTitle = variant === "title";
  const isEmptyOptional = isOptional && value === null;
  const EditIcon = isEmptyOptional ? FiPlus : FiEdit2;
  const secondaryClassName = isEmptyOptional
    ? `${styles.titleButton} ${styles.secondaryNameButton} ${styles.secondaryNameEmpty}`
    : `${styles.titleButton} ${styles.secondaryNameButton}`;

  if (isEditing) {
    return (
      <div className={styles.titleEditor}>
        <input
          ref={inputRef}
          className={isTitle ? styles.titleInput : styles.secondaryNameInput}
          type="text"
          lang={lang}
          value={draftName}
          maxLength={MAX_PACK_NAME_LENGTH}
          aria-label={inputLabel}
          aria-describedby={hintId}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => finishEditing(true, false)}
        />
        <p id={hintId} className={styles.titleHint}>
          {hint}
        </p>
      </div>
    );
  }

  const button = (
    <button
      ref={buttonRef}
      type="button"
      className={isTitle ? styles.titleButton : secondaryClassName}
      aria-label={buttonLabel}
      onClick={startEditing}
    >
      <span className={styles.titleText}>{displayText}</span>
      {hiddenEditLabel && (
        <span className="visuallyHidden"> {hiddenEditLabel}</span>
      )}
      <EditIcon className={styles.titleEditIcon} aria-hidden />
    </button>
  );

  return isTitle ? (
    <h2 className={styles.title}>{button}</h2>
  ) : (
    <p className={styles.secondaryName}>{button}</p>
  );
}
