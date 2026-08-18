import { useId, useState } from "react";
import { ModalSheet, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./VolunteerSignupModal.module.css";

/**
 * Collects the applicant's message before POSTing a signup. Renders through
 * the shared `ModalSheet` (mirrors `EndorseSubprofileModal`'s form pattern):
 * self-contained, owns its own `note` state. The parent owns the actual
 * `useSignup` mutation; this modal only ever calls `onSubmit(note)`. On
 * success the parent flips its `applied` flag, which unmounts the entire
 * "not applied" card this modal lives inside, so the modal needs no success
 * state of its own, only pending/error.
 */
export function VolunteerSignupModal({
  applyRole,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  applyRole: string;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) {
  const { t } = useTranslation();
  const noteFieldId = useId();
  const [note, setNote] = useState("");
  const trimmed = note.trim();

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("marketing:volunteerDetail.signupModal.ariaLabel", {
        role: applyRole,
      })}
    >
      <div className={styles.eye}>
        {t("marketing:volunteerDetail.signupModal.eyebrow")}
      </div>
      <h2 className={styles.title}>
        {t("marketing:volunteerDetail.signupModal.title")}
      </h2>
      <p className={styles.sub}>
        {t("marketing:volunteerDetail.signupModal.sub")}
      </p>

      <label className={styles.label} htmlFor={noteFieldId}>
        {t("marketing:volunteerDetail.signupModal.noteLabel")}
      </label>
      <textarea
        id={noteFieldId}
        className={styles.textarea}
        maxLength={2000}
        placeholder={t(
          "marketing:volunteerDetail.signupModal.notePlaceholder",
        )}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        disabled={submitting}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>
          {t("marketing:volunteerDetail.signupModal.cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={() => onSubmit(trimmed)}
          disabled={submitting || trimmed.length === 0}
          aria-busy={submitting}
        >
          {submitting
            ? t("marketing:volunteerDetail.signupModal.sending")
            : t("marketing:volunteerDetail.signupModal.submit")}
        </Button>
      </div>
    </ModalSheet>
  );
}
