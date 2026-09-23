import { forwardRef, type FormEvent } from "react";
import { Button, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SpaceRequestPanel.module.css";

const NOTE_MAX_LENGTH = 500;

/** The ask-again note field + submit button, split out of `SpaceRequestPanel`
 *  to keep that component under the repo's 200-line cap. The textarea ref is
 *  forwarded so `SpaceRequestPanel` can return focus to it after a withdraw
 *  succeeds, the way it focuses the pending status text after a create. */
export const SpaceRequestNoteForm = forwardRef<
  HTMLTextAreaElement,
  {
    note: string;
    onNoteChange: (value: string) => void;
    onSubmit: (event: FormEvent) => void;
    isPending: boolean;
  }
>(function SpaceRequestNoteForm(
  { note, onNoteChange, onSubmit, isPending },
  noteFieldRef,
) {
  const { t } = useTranslation();
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <FormField
        label={t("communities:spaces.request.note.label")}
        helper={t("communities:spaces.request.note.helper")}
        labelAside={`${note.length}/${NOTE_MAX_LENGTH}`}
      >
        <textarea
          ref={noteFieldRef}
          value={note}
          maxLength={NOTE_MAX_LENGTH}
          rows={3}
          placeholder={t("communities:spaces.request.note.placeholder")}
          onChange={(event) => onNoteChange(event.target.value)}
        />
      </FormField>
      <div className={styles.submitRow}>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending
            ? t("communities:spaces.request.sending")
            : t("communities:spaces.request.submit")}
        </Button>
      </div>
    </form>
  );
});
