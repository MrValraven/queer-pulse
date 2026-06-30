import { Link } from "react-router-dom";
import { FiAlertCircle, FiPhone } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { CRISIS_LINES } from "./crisisStrip.data";
import styles from "./crisisStrip.module.css";

/**
 * High-contrast crisis panel placed near the top of the Wellbeing page.
 * Plum-panel emphasis treatment; tel: links so numbers are tap-to-call and
 * copy-paste friendly. Reusable within the resources feature.
 */
export function CrisisStrip() {
  return (
    <section className={styles.section} aria-label="Crisis and emergency help">
      <div className="wrap">
        <div className={styles.panel}>
          <div className={styles.head}>
            <span className={styles.icon} aria-hidden>
              <FiAlertCircle />
            </span>
            <div>
              <h2 className={styles.title}>
                In crisis <em>right now?</em>
              </h2>
              <p className={styles.sub}>
                If you are in immediate danger, call <strong>112</strong>. These
                lines are free and confidential — tap to call, or copy the
                number.
              </p>
            </div>
          </div>

          <ul className={styles.lines}>
            {CRISIS_LINES.map((line) => (
              <li key={line.name} className={styles.line}>
                <div className={styles.lineName}>{line.name}</div>
                <a className={styles.num} href={`tel:${line.tel}`}>
                  <FiPhone aria-hidden /> {line.display}
                </a>
                <div className={styles.hours}>{line.hours}</div>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Button variant="ghost-dark" to={routes.emergency}>
              QueerPulse emergency support
            </Button>
            <Link className={styles.jump} to="#crisis">
              All crisis resources ↓
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
