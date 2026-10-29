import { FiAward } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StudioFoundingBadge.module.css";

/** The small "Founding artist" pill beside an artist's kind line (card
 *  meta, artist hero). It fades in on mount and keeps its place for good. */
export function StudioFoundingBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const { t } = useTranslation();
  return (
    <span
      className={
        size === "md" ? `${styles.badge} ${styles.badgeMd}` : styles.badge
      }
    >
      <FiAward className={styles.icon} aria-hidden="true" fill="none" />
      {t("studio:founding.badge")}
    </span>
  );
}
