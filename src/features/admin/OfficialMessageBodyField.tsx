import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { OFFICIAL_MESSAGE_MAX_LENGTH } from "./api/adminOfficialMessages.api";
import styles from "./AdminOfficialMessagesPage.module.css";

interface OfficialMessageBodyFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/** The shared message textarea with a live character count (max 2000). */
export function OfficialMessageBodyField({
  label,
  placeholder,
  value,
  onChange,
}: OfficialMessageBodyFieldProps) {
  const { t } = useTranslation();
  return (
    <FormField
      label={label}
      labelAside={
        <span className={styles.counter}>
          {t("admin:officialMessages.body.count", {
            used: value.length,
            max: OFFICIAL_MESSAGE_MAX_LENGTH,
          })}
        </span>
      }
    >
      <textarea
        className={styles.textarea}
        value={value}
        rows={5}
        maxLength={OFFICIAL_MESSAGE_MAX_LENGTH}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}
