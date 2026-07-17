import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Mentor } from "./mentorship.data";
import styles from "./MentorDetailPage.module.css";

/** Previous / position / next navigation between mentor profiles. */
export function MentorCycleNav({
  base,
  prev,
  next,
  pos,
  total,
  last,
}: {
  base: string;
  prev: Mentor;
  next: Mentor;
  pos: number;
  total: number;
  last?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.cycle}
      style={last ? { marginBottom: 0 } : undefined}
    >
      <Link to={`${base}/${prev.slug}`} className={styles.cycleBtn}>
        <span className={styles.cycleDir}>
          {t("economy:mentorDetail.cyclePrevious")}
        </span>
        <span className={styles.cycleName}>{prev.name}</span>
      </Link>
      <span className={styles.cyclePos}>
        {t("economy:mentorDetail.cyclePosition", { position: pos, total })}
      </span>
      <Link
        to={`${base}/${next.slug}`}
        className={`${styles.cycleBtn} ${styles.next}`}
      >
        <span className={styles.cycleDir}>
          {t("economy:mentorDetail.cycleNext")}
        </span>
        <span className={styles.cycleName}>{next.name}</span>
      </Link>
    </div>
  );
}
