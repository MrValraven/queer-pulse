import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Mentor } from "./mentorship.data";
import styles from "./MentorDetailPage.module.css";

/** Previous / position / next navigation between mentor profiles. */
export function MentorCycleNav({
  base,
  previous,
  next,
  position,
  total,
  last,
}: {
  base: string;
  previous: Mentor;
  next: Mentor;
  position: number;
  total: number;
  last?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.cycle}
      style={last ? { marginBottom: 0 } : undefined}
    >
      <Link to={`${base}/${previous.slug}`} className={styles.cycleBtn}>
        <span className={styles.cycleDir}>
          <FiArrowLeft aria-hidden />{" "}
          {t("economy:mentorDetail.cyclePrevious")}
        </span>
        <span className={styles.cycleName}>{previous.name}</span>
      </Link>
      <span className={styles.cyclePos}>
        {t("economy:mentorDetail.cyclePosition", { position, total })}
      </span>
      <Link
        to={`${base}/${next.slug}`}
        className={`${styles.cycleBtn} ${styles.next}`}
      >
        <span className={styles.cycleDir}>
          {t("economy:mentorDetail.cycleNext")}{" "}
          <FiArrowRight aria-hidden />
        </span>
        <span className={styles.cycleName}>{next.name}</span>
      </Link>
    </div>
  );
}
