import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofilePage.module.css";

/**
 * The persona page's loading state: a skeleton that reserves the real page's
 * shape (a full-bleed cover band above a hero identity block of avatar, name,
 * tagline and bio lines), so the content swap barely shifts layout instead of
 * a centered spinner jumping to a full page.
 */
export function SubprofilePageSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.skeleton}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className={styles.skeletonLabel}>
        {t("subprofiles:page.loading")}
      </span>
      <div className={styles.skeletonCover} aria-hidden />
      <div className="wrap">
        <div className={styles.skeletonHero} aria-hidden>
          <SkeletonAvatar size={96} />
          <div className={styles.skeletonHeroText}>
            <SkeletonLine width="55%" height={30} />
            <SkeletonLine width="38%" height={16} />
            <SkeletonLine width="82%" height={14} />
            <SkeletonLine width="68%" height={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
