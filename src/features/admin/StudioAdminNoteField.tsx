import { type KeyboardEvent, type Ref, useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import css from "./StudioAdminPickDialog.module.css";

/** How many characters before the limit the counter turns to the accent. */
const COUNTER_WARNING_REMAINING = 10;

/** Line breaks a paste can carry. The note is one line, so each run of them
 *  becomes a single space. */
const LINE_BREAKS = /[\r\n]+/g;

/** Enter sends the form the field sits in; Shift+Enter does nothing, since
 *  the note keeps to one line. Typing with an IME composes as usual. */
function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
  event.preventDefault();
  if (!event.shiftKey) event.currentTarget.form?.requestSubmit();
}

/** The one-line pick note: label, a textarea that wraps a long line onto a
 *  second and grows with it, the hint and a live "12 of 140" counter that
 *  warms to the accent in the last characters. */
export function StudioAdminNoteField({
  value,
  onChange,
  inputRef,
  hintKey = "admin:studioAdmin.pickDialog.noteHint",
  maxLength = STUDIO_DISCOVERY_LIMITS.curationNoteMaxLength,
  measureLength,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLTextAreaElement>;
  hintKey?: string;
  /** The longest note. Defaults to the Studio pick note's limit. */
  maxLength?: number;
  /** Counts the note the way its limit does (code points for a directory
   *  partner note). When passed, the counter uses it, the native
   *  `maxLength` is left off, and a change is cut to `maxLength` code
   *  points. Without it, the field counts UTF-16 units as before. */
  measureLength?: (value: string) => number;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const hintId = useId();
  const counterId = useId();
  const max = maxLength;
  const length = measureLength ? measureLength(value) : value.length;
  const isNearLimit = length >= max - COUNTER_WARNING_REMAINING;
  return (
    <div className={css.field}>
      <label htmlFor={fieldId} className={css.fieldLabel}>
        {t("admin:studioAdmin.pickDialog.noteLabel")}
      </label>
      <textarea
        id={fieldId}
        ref={inputRef}
        rows={2}
        className={css.noteInput}
        value={value}
        maxLength={measureLength ? undefined : max}
        aria-describedby={`${hintId} ${counterId}`}
        onKeyDown={submitOnEnter}
        onChange={(event) => {
          const nextValue = event.target.value.replace(LINE_BREAKS, " ");
          onChange(
            measureLength
              ? Array.from(nextValue).slice(0, max).join("")
              : nextValue,
          );
        }}
      />
      <div className={css.noteFoot}>
        <p id={hintId} className={css.fieldHint}>
          {t(hintKey)}
        </p>
        <span
          id={counterId}
          className={
            isNearLimit ? `${css.counter} ${css.counterNear}` : css.counter
          }
        >
          {t("admin:studioAdmin.pickDialog.noteCount", {
            count: length,
            max,
          })}
        </span>
      </div>
    </div>
  );
}
