import { useId, useRef, useState, type KeyboardEvent } from "react";
import { FormField } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FieldEditorShell } from "./FieldEditorShell";
import {
  DESCRIPTION_CARD_BUDGET,
  MAX_DESCRIPTION_STORAGE_LENGTH,
} from "./steps/whatChapter.data";
import { useAutoGrowTextarea } from "./useAutoGrowTextarea";
import styles from "./FieldEditor.module.css";

/** How close to the backend's hard cap the count switches to "n characters
 *  left" in the error tone. */
const NEAR_LIMIT_REMAINING = 500;

/** The characters-left counts the status region speaks at, on the way down.
 *  Every keystroke would be noise; these four tell a screen-reader user the
 *  cap is coming, then that it is close, then that it is here. */
const ANNOUNCED_REMAINING = [NEAR_LIMIT_REMAINING, 100, 50, 0];

/** Whether a move from `fromLength` to `toLength` characters passed over the
 *  line at `lineLength`, in either direction. */
function hasCrossed(
  fromLength: number,
  toLength: number,
  lineLength: number,
): boolean {
  return (
    (fromLength < lineLength && toLength >= lineLength) ||
    (fromLength >= lineLength && toLength < lineLength)
  );
}

/**
 * What the status region should say after an edit, or `null` to leave it as
 * it is. Typing down past a characters-left threshold reads the count; going
 * past the board card budget reads the budget note once. Going back the
 * other way over any of those lines empties the region quietly, so the next
 * crossing is spoken again (a live region repeats nothing it already holds).
 */
function statusAfterEdit(
  fromLength: number,
  toLength: number,
  remainingText: (remaining: number) => string,
  overBudgetNote: string,
): string | null {
  const lineLengths = ANNOUNCED_REMAINING.map(
    (remaining) => MAX_DESCRIPTION_STORAGE_LENGTH - remaining,
  );
  const hasCrossedLine = lineLengths.some((lineLength) =>
    hasCrossed(fromLength, toLength, lineLength),
  );
  const hasCrossedBudget = hasCrossed(
    fromLength,
    toLength,
    DESCRIPTION_CARD_BUDGET + 1,
  );
  if (!hasCrossedLine && !hasCrossedBudget) return null;
  if (toLength < fromLength) return "";
  return hasCrossedLine
    ? remainingText(MAX_DESCRIPTION_STORAGE_LENGTH - toLength)
    : overBudgetNote;
}

/** `Cmd` on Apple keyboards, `Ctrl` everywhere else. Read once per render,
 *  as `ItemDrawerFooter` does for the same hint. */
function saveShortcutKeys(): string {
  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(userAgent)
    ? "Cmd + Enter"
    : "Ctrl + Enter";
}

/**
 * The description editor: a wide dialog with a textarea that grows with the
 * text, a live count under it, and Cmd/Ctrl + Enter to save.
 *
 * The count reads against the board card's soft budget (ruling F2), like the
 * create wizard's. Past it the count turns amber and becomes a plain
 * "584 characters", since "584/400" read as an error and the wizard's own
 * note under it already explains the 400. Near the backend's hard cap it says
 * how many characters are left, in the error tone. The count itself is
 * silent; one status region speaks only at the lines `statusAfterEdit` names.
 */
export function FieldEditorDescription({
  value,
  onChange,
  isSaveEnabled,
  onSave,
  onClose,
}: {
  value: string;
  onChange: (value: string) => void;
  isSaveEnabled: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const textareaId = useId();
  const budgetNoteId = `${textareaId}-budget`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasPlacedCaretRef = useRef(false);
  const [statusText, setStatusText] = useState("");

  const length = value.length;
  const remaining = MAX_DESCRIPTION_STORAGE_LENGTH - length;
  const isNearLimit = remaining <= NEAR_LIMIT_REMAINING;
  const isOverBudget = length > DESCRIPTION_CARD_BUDGET;
  const overBudgetNote = t("gatherings:create.v2.what.descriptionOverBudget", {
    budget: DESCRIPTION_CARD_BUDGET,
  });
  const countTone = isNearLimit ? "limit" : isOverBudget ? "budget" : "quiet";

  // Grow with the text, between the CSS min and max heights.
  useAutoGrowTextarea(textareaRef, value);

  // `Modal` focuses the textarea on open, which puts the caret at the start of
  // a long saved description. The first focus moves it to the end, where an
  // edit usually begins; later focuses keep wherever the host left it.
  const placeCaretAtEnd = () => {
    const textarea = textareaRef.current;
    if (!textarea || hasPlacedCaretRef.current) return;
    hasPlacedCaretRef.current = true;
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    textarea.scrollTop = textarea.scrollHeight;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // An Enter that confirms an IME composition (Japanese, Chinese, Korean
    // input) belongs to the composition, so it never saves.
    if (event.nativeEvent.isComposing) return;
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    if (isSaveEnabled) onSave();
  };

  const handleChange = (nextValue: string) => {
    const nextStatus = statusAfterEdit(
      length,
      nextValue.length,
      (left) =>
        t("gatherings:manage.fieldEditor.descriptionLeft", { count: left }),
      overBudgetNote,
    );
    if (nextStatus !== null) setStatusText(nextStatus);
    onChange(nextValue);
  };

  return (
    <FieldEditorShell
      wide
      title={t("gatherings:manage.editModal.fieldDescription")}
      sub={t("gatherings:manage.fieldEditor.descriptionSub")}
      isSaveEnabled={isSaveEnabled}
      onSave={onSave}
      onClose={onClose}
      initialFocusRef={textareaRef}
    >
      {/* The dialog's title names the field on screen, so its label is
          for screen readers alone. */}
      <label htmlFor={textareaId} className="visuallyHidden">
        {t("gatherings:manage.editModal.fieldDescription")}
      </label>
      <FormField className={styles.descriptionField}>
        <textarea
          ref={textareaRef}
          id={textareaId}
          className={styles.descriptionInput}
          maxLength={MAX_DESCRIPTION_STORAGE_LENGTH}
          placeholder={t("gatherings:create.step1.descPlaceholder")}
          aria-describedby={isOverBudget ? budgetNoteId : undefined}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={placeCaretAtEnd}
          onKeyDown={handleKeyDown}
        />
      </FormField>
      <div className={styles.descriptionMeta}>
        <span className={styles.shortcutHint}>
          <Translation
            i18nKey="gatherings:manage.fieldEditor.saveShortcut"
            values={{ keys: saveShortcutKeys() }}
            components={{ kbd: <kbd className={styles.kbd} /> }}
          />
        </span>
        <span className={styles.count} data-tone={countTone}>
          {isNearLimit
            ? t("gatherings:manage.fieldEditor.descriptionLeft", {
                count: remaining,
              })
            : isOverBudget
              ? t("gatherings:manage.fieldEditor.descriptionCount", {
                  count: length,
                  length: fmt.number(length),
                })
              : `${fmt.number(length)}/${fmt.number(DESCRIPTION_CARD_BUDGET)}`}
        </span>
      </div>
      {isOverBudget && (
        <p id={budgetNoteId} className={styles.budgetNote}>
          {overBudgetNote}
        </p>
      )}
      <p role="status" className="visuallyHidden">
        {statusText}
      </p>
    </FieldEditorShell>
  );
}
