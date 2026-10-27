import { FiInfo } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./AudienceSampleNote.module.css";

/** The one-line note that says every example on the page is made up.
 *  `AudienceClosing` renders it under its CTA, in cream ink on the plum band. */
export function AudienceSampleNote({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p className={[styles.note, className].filter(Boolean).join(" ")}>
      <FiInfo aria-hidden className={styles.icon} />
      {t("audiences:sample.note")}
    </p>
  );
}
