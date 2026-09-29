import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./EditCommunityModal.module.css";

/**
 * Why Save is disabled, shown next to it. Without this a cleared name or a
 * removed last shared value greys the button out with no word as to why, and
 * the owner reads it as the form being broken. Sits in the footer beside the
 * change summary, so it is readable from anywhere in the long form, and Save
 * points at it through `aria-describedby` so a screen reader hears the reason
 * on the disabled button itself.
 */
export function EditCommunityMissingFields({
  id,
  labelKeys,
}: {
  id: string;
  labelKeys: string[];
}) {
  const { t } = useTranslation();
  if (labelKeys.length === 0) return null;

  return (
    <section id={id} className={[styles.changes, styles.missing].join(" ")}>
      <h3 className={[styles.changesTitle, styles.missingTitle].join(" ")}>
        <FiAlertCircle size={13} aria-hidden />
        {t("communities:edit.missing.title")}
      </h3>
      <ul className={styles.changesList}>
        {labelKeys.map((labelKey) => (
          <li key={labelKey} className={styles.changeField}>
            {t(labelKey)}
          </li>
        ))}
      </ul>
    </section>
  );
}
