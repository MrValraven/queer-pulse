import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { NEXT_POINTS } from "./cinemaSubmit.data";
import styles from "./CinemaSubmitPage.module.css";

/** Reassurance sidebar: what happens next, the access-fund note, and the
 * live open call. */
export function CinemaSubmitAside() {
  return (
    <aside className={styles.aside}>
      <div className={styles.saCard}>
        <div className={styles.saHead}>What happens next</div>
        {NEXT_POINTS.map((p) => (
          <div key={p.strong} className={styles.saPoint}>
            <FiCheck size={16} aria-hidden />
            <div>
              <strong>{p.strong}</strong> {p.rest}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.saCard}>
        <div className={styles.saHead}>Accessibility standard</div>
        <div className={styles.saBody}>
          We ask for captions — but we also help source them. If you can't
          afford captioning, contact us. We have a small captioning fund for
          community filmmakers.
        </div>
        <Link to={routes.accessibility} className={styles.saLink}>
          Our access standard →
        </Link>
      </div>

      <div className={`${styles.saCard} ${styles.saJade}`}>
        <div className={styles.saHead}>Open call active</div>
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
          Apply for the commission →
        </Button>
      </div>
    </aside>
  );
}
