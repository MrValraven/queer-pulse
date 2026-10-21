import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioCardGridSkeleton, StudioLine } from "./StudioSkeletons";
import styles from "./studio.module.css";
import sk from "./studioSkeleton.module.css";

/** Held while GET /studio/me answers, so a granted member never sees the
 *  coming-soon teaser flash before their Studio appears. Paints the whole
 *  shell (rail, topbar, phone tab bar) so the real one lands without a jump. */
export function StudioGateSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.root}
      role="status"
      aria-busy="true"
      aria-label={t("studio:gate.loadingLabel")}
    >
      <div className={sk.gateApp}>
        <div className={sk.gateRail}>
          <StudioLine width="60%" height={20} style={{ marginBottom: 18 }} />
          <StudioLine width="85%" height={16} />
          <StudioLine width="70%" height={16} />
          <StudioLine width="78%" height={16} />
          <StudioLine width="100%" height={36} style={{ marginTop: 12 }} />
        </div>
        <div className={sk.gateMain}>
          <div className={sk.gateTopbar}>
            <StudioLine
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
            />
            <StudioLine
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
            />
            <StudioLine
              width="30%"
              height={32}
              style={{ marginLeft: "auto" }}
            />
          </div>
          <div className={sk.gateContent}>
            <StudioLine width="40%" height={28} />
            <StudioCardGridSkeleton count={8} className={styles.rowGrid} />
          </div>
        </div>
        <div className={sk.gateTabBar}>
          <StudioLine width={40} height={24} />
          <StudioLine width={40} height={24} />
          <StudioLine width={40} height={24} />
        </div>
      </div>
    </div>
  );
}
