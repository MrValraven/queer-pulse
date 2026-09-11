import { FiAlertTriangle, FiRotateCcw } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatGuideDateTime, formatGuideTime } from "./guideFormat";
import styles from "./GuideWorkspace.module.css";

/** Offers unsaved work kept in this browser from an earlier visit. */
export function GuideRecoveryBanner({
  storedAt,
  isOlderBase,
  onRestore,
  onDiscard,
}: {
  storedAt: string;
  isOlderBase: boolean;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  const { t, language } = useTranslation();
  return (
    <div className={styles.banner} role="status">
      <FiRotateCcw aria-hidden className={styles.bannerIcon} />
      <div className={styles.bannerText}>
        <p className={styles.bannerTitle}>
          {t("admin:guideWorkspace.recovery.body", {
            time: formatGuideDateTime(storedAt, language),
          })}
        </p>
        {isOlderBase && (
          <p className={styles.bannerDetail}>
            {t("admin:guideWorkspace.recovery.olderBase")}
          </p>
        )}
      </div>
      <div className={styles.bannerActions}>
        <Button variant="ghost" size="sm" onClick={onDiscard}>
          {t("admin:guideWorkspace.recovery.discardCta")}
        </Button>
        <Button variant="primary" size="sm" onClick={onRestore}>
          {t("admin:guideWorkspace.recovery.restoreCta")}
        </Button>
      </div>
    </div>
  );
}

/** A save refused because someone else saved first. */
export function GuideConflictBanner({
  savedAt,
  isSaving,
  onLoadTheirs,
  onSaveMine,
}: {
  savedAt: string;
  isSaving: boolean;
  onLoadTheirs: () => void;
  onSaveMine: () => void;
}) {
  const { t, language } = useTranslation();
  return (
    <div className={`${styles.banner} ${styles.bannerConflict}`} role="alert">
      <FiAlertTriangle aria-hidden className={styles.bannerIcon} />
      <div className={styles.bannerText}>
        <p className={styles.bannerTitle}>
          {t("admin:guideWorkspace.conflict.body", {
            time: formatGuideTime(savedAt, language),
          })}
        </p>
      </div>
      <div className={styles.bannerActions}>
        <Button variant="ghost" size="sm" onClick={onLoadTheirs}>
          {t("admin:guideWorkspace.conflict.loadTheirsCta")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={isSaving}
          onClick={onSaveMine}
        >
          {t("admin:guideWorkspace.conflict.saveMineCta")}
        </Button>
      </div>
    </div>
  );
}
