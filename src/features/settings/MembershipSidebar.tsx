import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { CONTRIBUTION, STATUS } from "./membership.data";
import styles from "./MembershipPage.module.css";

export function MembershipSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sb}>
        <div className={styles.contribNum}>
          <em>{CONTRIBUTION.total}</em>
        </div>
        <div className={styles.contribLbl}>{CONTRIBUTION.label}</div>
        <div className={styles.contribSince}>{CONTRIBUTION.since}</div>
        {CONTRIBUTION.impacts.map((impact) => (
          <div key={impact} className={styles.impact}>
            <div className={styles.impactDot} />
            <span>{impact}</span>
          </div>
        ))}
      </div>

      <div className={styles.sb}>
        <div className={styles.statusPill}>
          <span className={styles.spillDot} />
          Active member
        </div>
        <div className={styles.sbTierName}>{STATUS.tier}</div>
        <div className={styles.nextRenewal}>{STATUS.renewal}</div>
        <div className={styles.sbDivider} />
        <Link to={routes.solidarity} className={styles.sbLink}>
          About solidarity pricing →
        </Link>
      </div>
    </aside>
  );
}
