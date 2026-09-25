import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  placeholdersFor,
  type EmailTemplatePurpose,
} from "../emailTemplatePurposes";
import styles from "./emailTemplateEditor.module.css";

/**
 * One chip per placeholder the purpose allows. `onMouseDown` prevents the
 * default so the text field keeps focus and its selection when a chip is
 * clicked; the token lands where the admin's caret was.
 */
export function EmailPlaceholderChips({
  purpose,
  onInsert,
}: {
  purpose: EmailTemplatePurpose;
  onInsert: (token: string) => void;
}) {
  const { t } = useTranslation();
  const placeholders = placeholdersFor(purpose);
  return (
    <div
      className={styles.chips}
      role="group"
      aria-label={t("admin:emailTemplates.placeholders.label")}
    >
      {/* The short visible word; the group carries the full name. */}
      <span className={styles.chipsLabel} aria-hidden>
        {t("admin:emailTemplates.placeholders.shortLabel")}
      </span>
      {placeholders.length === 0 ? (
        <span className={styles.chipsEmpty}>
          {t("admin:emailTemplates.placeholders.none")}
        </span>
      ) : (
        placeholders.map((placeholder) => (
          <button
            key={placeholder}
            type="button"
            className={styles.chip}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onInsert(`{${placeholder}}`)}
          >
            <FiPlus aria-hidden />
            {t(`admin:emailTemplates.placeholders.${placeholder}`)}
          </button>
        ))
      )}
    </div>
  );
}
