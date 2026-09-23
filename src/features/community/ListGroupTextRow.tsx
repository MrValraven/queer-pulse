import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ReadingGroupsPage.module.css";

/** One labelled text row of the "Start your own group" form. Every row moves
 *  the keyboard on to the next field and skips browser autofill, since none of
 *  these answers is personal data the browser could know. */
export function ListGroupTextRow({
  id,
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  isRequired = false,
  isOptional = false,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  isRequired?: boolean;
  /** Marks the label with a quiet "optional" so a blank field reads as fine. */
  isOptional?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.ssRow}>
      <label className={styles.ssLabel} htmlFor={id}>
        {label}
        {/* The leading space keeps the accessible name two words apart. */}
        {isOptional && (
          <>
            {" "}
            <span className={styles.ssOptional}>
              {t("community:readingGroups.listGroup.optional")}
            </span>
          </>
        )}
      </label>
      <input
        id={id}
        className={styles.ssInput}
        type="text"
        autoComplete="off"
        enterKeyHint="next"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        required={isRequired}
      />
    </div>
  );
}
