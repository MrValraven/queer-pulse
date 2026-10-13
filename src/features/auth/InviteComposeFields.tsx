import { useId } from "react";
import { FiAlertCircle, FiLock } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { INVITE_PRIVATE_NOTE_MAX_LENGTH } from "./api/invite.api";
import styles from "./InvitePage.module.css";

interface InviteComposeFieldsProps {
  /** Optional address the invite is pinned to. Empty string = a bearer link. */
  recipientEmail: string;
  setRecipientEmail: (value: string) => void;
  /** Set once the member tried to generate with a malformed address. */
  hasRecipientEmailError: boolean;
  /** The member's own reminder of who the invite is for. Never shared. */
  privateNote: string;
  setPrivateNote: (value: string) => void;
  vouch: string;
  setVouch: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
}

export function InviteComposeFields({
  recipientEmail,
  setRecipientEmail,
  hasRecipientEmailError,
  privateNote,
  setPrivateNote,
  vouch,
  setVouch,
  note,
  setNote,
}: InviteComposeFieldsProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  const helpId = `${fieldId}-recipient-help`;
  const errorId = `${fieldId}-recipient-error`;
  const privateNoteHelpId = `${fieldId}-private-note-help`;

  return (
    <div className={styles.card}>
      {/* The addressee leads: the vouch and the note below are both about them. */}
      <div className={styles.field}>
        <label htmlFor={`${fieldId}-recipient`}>
          {t("auth:invite.compose.recipientEmail.label")}{" "}
          <span className={styles.optionalSuffix}>
            {t("auth:common.optionalSuffix")}
          </span>
        </label>
        <input
          id={`${fieldId}-recipient`}
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          placeholder={t("auth:invite.compose.recipientEmail.placeholder")}
          value={recipientEmail}
          onChange={(event) => setRecipientEmail(event.target.value)}
          aria-invalid={hasRecipientEmailError}
          aria-describedby={
            hasRecipientEmailError ? `${helpId} ${errorId}` : helpId
          }
        />
        {/* Persistent, never a tooltip: what pinning does is the whole point of
            the field, so a member has to be able to read it without poking it. */}
        <p id={helpId} className={styles.fieldHelp}>
          {t("auth:invite.compose.recipientEmail.help")}
        </p>
        <p className={styles.fieldHelpStrong}>
          {t("auth:invite.compose.recipientEmail.noSend")}
        </p>
        {hasRecipientEmailError && (
          <div id={errorId} className={styles.quotaError} role="alert">
            <FiAlertCircle aria-hidden />
            {t("auth:invite.compose.recipientEmail.invalid")}
          </div>
        )}
      </div>

      {/* The member's own label, kept apart from the two fields below that the
          recipient reads: the lock and the help line say who sees it. */}
      <div className={styles.field}>
        <label htmlFor={`${fieldId}-private-note`}>
          <FiLock aria-hidden className={styles.fieldLabelIcon} />
          {t("auth:invite.compose.privateNote.label")}{" "}
          <span className={styles.optionalSuffix}>
            {t("auth:common.optionalSuffix")}
          </span>
        </label>
        <input
          id={`${fieldId}-private-note`}
          type="text"
          autoComplete="off"
          maxLength={INVITE_PRIVATE_NOTE_MAX_LENGTH}
          placeholder={t("auth:invite.compose.privateNote.placeholder")}
          value={privateNote}
          onChange={(event) => setPrivateNote(event.target.value)}
          aria-describedby={privateNoteHelpId}
        />
        {/* Help and count share one row so the count sits right under the
            input, where the vouch and note fields keep theirs. */}
        <div className={styles.fieldMeta}>
          <p id={privateNoteHelpId} className={styles.fieldHelp}>
            {t("auth:invite.compose.privateNote.help")}
          </p>
          <div className={styles.charCount}>
            {privateNote.length}/{INVITE_PRIVATE_NOTE_MAX_LENGTH}
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${fieldId}-vouch`}>
          {t("auth:invite.compose.vouch.label")}{" "}
          <span className={styles.optionalSuffix}>
            {t("auth:common.optionalSuffix")}
          </span>
        </label>
        <textarea
          id={`${fieldId}-vouch`}
          maxLength={280}
          placeholder={t("auth:invite.compose.vouch.placeholder")}
          value={vouch}
          onChange={(e) => setVouch(e.target.value)}
        />
        <div className={styles.charCount}>{vouch.length}/280</div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${fieldId}-note`}>
          {t("auth:invite.compose.note.label")}{" "}
          <span className={styles.optionalSuffix}>
            {t("auth:common.optionalSuffix")}
          </span>
        </label>
        <textarea
          id={`${fieldId}-note`}
          maxLength={200}
          placeholder={t("auth:invite.compose.note.placeholder")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className={styles.charCount}>{note.length}/200</div>
      </div>
    </div>
  );
}
