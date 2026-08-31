import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminMembersPage.module.css";

/**
 * The reason box every account-recovery decision requires.
 *
 * Each of the three levers writes a `mod_audit_logs` row that outlives the
 * account it names, and the reason is what makes that row worth reading a year
 * later. The backend rejects a body without one, so this is the client half of
 * a rule that is enforced server-side rather than a soft prompt.
 *
 * Its own component because all four confirm modals need exactly this, and a
 * labelled control repeated four times is where accessible names go missing.
 */
export function AdminRecoveryReasonField({
  fieldId,
  label,
  placeholder,
  value,
  onChange,
}: {
  fieldId: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <label className={styles.fieldLabel} htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        id={fieldId}
        className={styles.textarea}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
      />
      <p className={styles.dHint}>{t("admin:recovery.reasonHint")}</p>
    </>
  );
}
