import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { NEXT_POINTS } from "./cinemaSubmit.data";
import styles from "./CinemaSubmitPage.module.css";

/** Reassurance sidebar: what happens next, the access-fund note, and the
 * live open call. The open-call block is that call's own instance content
 * (mirrors the mock commission on the open-calls page) and stays English. */
export function CinemaSubmitAside() {
  const { t } = useTranslation();
  return (
    <aside className={styles.aside}>
      <div className={styles.saCard}>
        <div className={styles.saHead}>
          {t("cinema:submit.aside.nextHeading")}
        </div>
        {NEXT_POINTS.map((p) => (
          <div key={p.strongKey} className={styles.saPoint}>
            <FiCheck size={16} aria-hidden />
            <div>
              <strong>{t(p.strongKey)}</strong> {t(p.restKey)}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.saCard}>
        <div className={styles.saHead}>
          {t("cinema:submit.aside.accessHeading")}
        </div>
        <div className={styles.saBody}>
          {t("cinema:submit.aside.accessBody")}
        </div>
        <Link to={routes.accessibility} className={styles.saLink}>
          {t("cinema:submit.aside.accessCta")}
        </Link>
      </div>

      <div className={`${styles.saCard} ${styles.saJade}`}>
        <div className={styles.saHead}>
          {t("cinema:submit.aside.openCallHeading")}
        </div>
        <div className={styles.saJadeTitle}>
          Lisbon, after the flood — <em>€2,500 commission</em>
        </div>
        <div className={styles.saJadeBody}>
          Short film commission, closes 21 June. 13 applications so far.
        </div>
        <Button
          variant="ghost"
          to={routes.cinemaBrowse}
          style={{ width: "100%" }}
        >
          {t("cinema:submit.aside.applyCta")}
        </Button>
      </div>
    </aside>
  );
}
