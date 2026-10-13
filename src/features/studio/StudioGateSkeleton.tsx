import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioCardGridSkeleton, StudioLine } from "./StudioSkeletons";
import styles from "./studio.module.css";

/** Held while GET /studio/me answers, so a granted member never sees the
 *  coming-soon teaser flash before their Studio appears. */
export function StudioGateSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.root}
      role="status"
      aria-label={t("studio:gate.loadingLabel")}
    >
      <div className={styles.content}>
        <StudioLine width="40%" height={28} />
        <StudioCardGridSkeleton count={8} className={styles.rowGrid} />
      </div>
    </div>
  );
}
