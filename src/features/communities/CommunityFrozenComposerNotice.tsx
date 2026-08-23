import { FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunityFrozenBanner.module.css";

/**
 * Compact stand-in for a composer or reply bar while the community is paused
 * (see `CommunityFrozenBanner`) — swapped in for the input rather than leaving
 * an active-looking textarea that would just 403 on submit.
 *
 * States the consequence and points at the banner for the cause. It used to
 * repeat the banner's whole sentence, which stopped working once that sentence
 * became specific to WHY the pause happened: this notice is rendered from four
 * different surfaces, none of which knows the reason, so repeating one reason
 * here would have meant guessing.
 */
export function CommunityFrozenComposerNotice() {
  const { t } = useTranslation();
  return (
    <div className={styles.composerNotice} role="status">
      <span className={styles.icon} aria-hidden>
        <FiAlertTriangle />
      </span>
      <p className={styles.composerNoticeText}>
        {t("communities:detail.frozen.composerNotice")}
      </p>
    </div>
  );
}
