import { Link } from "react-router-dom";
import { routes, linkToPath } from "../../app/routeMap";
import { MASTHEAD_META, MASTHEAD_NAV } from "./magazineMasthead.data";
import styles from "./MagazineMasthead.module.css";

export function MagazineMasthead({ active }: { active?: string }) {
  return (
    <div className={styles.masthead}>
      <div className="wrap">
        <div className={styles.mmTop}>
          <Link to={linkToPath(routes.magazine)} className={styles.mmBrand}>
            Queer<em>Pulse</em>
            <br />
            Magazine
          </Link>
          <div className={styles.mmMeta}>
            <div className={styles.mmIssue}>{MASTHEAD_META.issue}</div>
            <div className={styles.mmDate}>{MASTHEAD_META.date}</div>
            <div className={styles.mmTagline}>{MASTHEAD_META.tagline}</div>
          </div>
        </div>
        <nav className={styles.magNav} aria-label="Magazine sections">
          {MASTHEAD_NAV.map((item) => {
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                to={linkToPath(item.href)}
                className={`${styles.mnLink} ${isActive ? styles.mnLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
