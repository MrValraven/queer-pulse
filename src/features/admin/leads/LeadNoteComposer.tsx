import { useMemo, useState, type KeyboardEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { LEAD_NOTE_MAX } from "./api/leads.types";
import { useAddLeadNote, useLeadIsWriting } from "./api/useLeadMutations";
import {
  leadFieldErrorOf,
  localLeadFieldError,
  type LeadFieldError,
} from "./leadForm.model";
import { LeadFadeInline } from "./LeadFadeInline";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadHistory.module.css";

/** The counter shows from nine tenths of the limit, so a short note reads
 *  without numbers under it. */
const COUNTER_SHOWN_FROM = Math.floor(LEAD_NOTE_MAX * 0.9);

/** Length the server measures: code points, so an emoji counts once. */
const noteLengthOf = (text: string): number => Array.from(text).length;

/**
 * The new note box at the top of the history. The counter and the limit
 * count code points, as the server does, so the box takes no native
 * `maxLength` (that counts UTF-16 units). Past the limit the counter turns
 * the accent tone and the refusal line names it at once. Add note stays
 * `aria-disabled` while the box is blank, over the limit or a lead write
 * runs; Ctrl or Cmd with Enter adds the note from the keyboard. A note that
 * lands clears the box; a refused one keeps the text and names why.
 */
export function LeadNoteComposer({ leadId }: { leadId: string }) {
  const { t } = useTranslation();
  const addNote = useAddLeadNote(leadId);
  const isWriting = useLeadIsWriting();
  const [text, setText] = useState("");
  const [refusal, setRefusal] = useState<LeadFieldError | null>(null);
  const textareaId = `lead-${leadId}-new-note`;
  const refusalId = `${textareaId}-refusal`;
  const counterId = `${textareaId}-counter`;
  // Measured on the trimmed text, as the server measures it, so a full
  // note with a trailing newline still fits.
  const usedLength = noteLengthOf(text.trim());
  const isBlank = text.trim() === "";
  const isOverLimit = usedLength > LEAD_NOTE_MAX;
  const isCounterShown = usedLength >= COUNTER_SHOWN_FROM;
  const isUnavailable = isBlank || isOverLimit || isWriting;
  // One object per crossing of the limit: the refusal line keeps the last
  // refusal it drew, so a new object on every render would loop.
  const overLimitRefusal = useMemo(
    () => (isOverLimit ? localLeadFieldError("LEAD_NOTE_TOO_LONG") : null),
    [isOverLimit],
  );
  const shownRefusal = refusal ?? overLimitRefusal;
  // The textarea names the counter only while it shows.
  const describedBy = [
    isCounterShown ? counterId : null,
    shownRefusal !== null ? refusalId : null,
  ]
    .filter((id): id is string => id !== null)
    .join(" ");

  const submit = () => {
    if (isUnavailable) return;
    setRefusal(null);
    addNote.mutate(
      { body: text.trim() },
      {
        onSuccess: () => setText(""),
        onError: (cause) => setRefusal(leadFieldErrorOf(cause)),
      },
    );
  };

  const submitFromKeyboard = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    submit();
  };

  return (
    <div className={styles.composer}>
      <FormField
        label={t("admin:leads.history.composerLabel")}
        className={styles.composerField}
      >
        <textarea
          id={textareaId}
          rows={3}
          value={text}
          placeholder={t("admin:leads.history.composerPlaceholder")}
          aria-invalid={shownRefusal !== null || undefined}
          aria-describedby={describedBy || undefined}
          onChange={(event) => {
            setText(event.target.value);
            setRefusal(null);
          }}
          onKeyDown={submitFromKeyboard}
        />
      </FormField>
      <LeadRefusalLine error={shownRefusal} id={refusalId} />
      <div className={styles.composerActions}>
        <span className={styles.counterSlot}>
          <LeadFadeInline isShown={isCounterShown}>
            <span
              id={counterId}
              className={styles.counter}
              data-over={isOverLimit || undefined}
            >
              {t("admin:leads.history.noteCounter", {
                used: usedLength,
                max: LEAD_NOTE_MAX,
              })}
            </span>
          </LeadFadeInline>
        </span>
        <Button
          variant="primary"
          size="sm"
          className={styles.phoneTarget}
          aria-disabled={isUnavailable || undefined}
          onClick={submit}
        >
          <FiPlus aria-hidden />
          {t("admin:leads.history.addNote")}
        </Button>
      </div>
    </div>
  );
}
