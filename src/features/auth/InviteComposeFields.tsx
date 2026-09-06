import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InvitePage.module.css";

interface InviteComposeFieldsProps {
  /** Optional address the invite is pinned to. Empty string = a bearer link. */
  recipientEmail: string;
  setRecipientEmail: (value: string) => void;
  /** Set once the member tried to generate with a malformed address. */
  hasRecipientEmailError: boolean;
  vouch: string;
  setVouch: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
}

export function InviteComposeFields({
  recipientEmail,
  setRecipientEmail,
  hasRecipientEmailError,
  vouch,
  setVouch,
  note,
  setNote,
}: InviteComposeFieldsProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  const helpId = `${fieldId}-recipient-help`;
  const errorId = `${fieldId}-recipient-error`;

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
