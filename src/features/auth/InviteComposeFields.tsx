import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InvitePage.module.css";

interface InviteComposeFieldsProps {
  vouch: string;
  setVouch: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
}

const optionalStyle = {
  fontWeight: 400,
  textTransform: "none" as const,
  letterSpacing: 0,
  fontSize: 11,
};

export function InviteComposeFields({
  vouch,
  setVouch,
  note,
  setNote,
}: InviteComposeFieldsProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <div className={styles.card}>
      <div className={styles.field}>
        <label htmlFor={`${fieldId}-vouch`}>
          {t("auth:invite.compose.vouch.label")}{" "}
          <span style={optionalStyle}>{t("auth:common.optionalSuffix")}</span>
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
          <span style={optionalStyle}>{t("auth:common.optionalSuffix")}</span>
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
