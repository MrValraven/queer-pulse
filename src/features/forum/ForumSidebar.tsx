import { Link } from "react-router-dom";
import { FiAlertTriangle, FiHome, FiBriefcase } from "react-icons/fi";
import { LuLandmark } from "react-icons/lu";
import { routes } from "../../app/routeMap";
import { CATS } from "./forum.data";
import styles from "./ForumPage.module.css";

export function ForumSidebar({
  cat,
  setCat,
  counts,
  totalCount,
}: {
  cat: string;
  setCat: (id: string) => void;
  counts: Record<string, number>;
  totalCount: number;
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbLabel}>Categories</div>
      {CATS.map((c) => (
        <button
          type="button"
          key={c.id}
          className={[styles.catItem, cat === c.id && styles.catItemOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setCat(c.id)}
        >
          <span className={styles.catIcon}>
            <c.icon />
          </span>
          <span className={styles.catName}>{c.name}</span>
          <span className={styles.catCount}>
            {c.id === "all" ? totalCount : (counts[c.id] ?? 0)}
          </span>
        </button>
      ))}
      <div className={styles.sbDivider} />
      <Link to={routes.safety} className={styles.sbLink}>
        <FiAlertTriangle /> Emergency resources
      </Link>
      <Link to={routes.housing} className={styles.sbLink}>
        <FiHome /> Housing board
      </Link>
      <Link to={routes.jobs} className={styles.sbLink}>
        <FiBriefcase /> Job board
      </Link>
      <Link to={routes.governance} className={styles.sbLink}>
        <LuLandmark /> Governance &amp; transparency
      </Link>
    </aside>
  );
}
