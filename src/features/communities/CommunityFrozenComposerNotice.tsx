import { FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunityFrozenBanner.module.css";

/**
 * Compact stand-in for a composer or reply bar while the community is
 * auto-frozen (see `CommunityFrozenBanner`) — swapped in for the input rather
 * than leaving an active-looking textarea that would just 403 on submit.
 * Reuses the banner's own copy so the platform never narrates the same
 * "paused, under review" state in two different voices.
 */
export function CommunityFrozenComposerNotice() {
  const { t } = useTranslation();
  return (
    <div className={styles.composerNotice} role="status">
      <span className={styles.icon} aria-hidden>
        <FiAlertTriangle />
      </span>
      <p className={styles.composerNoticeText}>
        {t("communities:detail.frozen.body")}
      </p>
    </div>
  );
}
