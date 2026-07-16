import { Link } from "react-router-dom";
import { FiAlertTriangle, FiHome, FiBriefcase } from "react-icons/fi";
import { LuLandmark } from "react-icons/lu";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbLabel}>{t("forum:sidebar.categoriesLabel")}</div>
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
          <span className={styles.catName}>{t(c.nameKey)}</span>
          <span className={styles.catCount}>
            {c.id === "all" ? totalCount : (counts[c.id] ?? 0)}
          </span>
        </button>
      ))}
      <div className={styles.sbDivider} />
      <Link to={routes.safety} className={styles.sbLink}>
        <FiAlertTriangle /> {t("forum:sidebar.emergencyResources")}
      </Link>
      <Link to={routes.housing} className={styles.sbLink}>
        <FiHome /> {t("forum:sidebar.housingBoard")}
      </Link>
      <Link to={routes.jobs} className={styles.sbLink}>
        <FiBriefcase /> {t("forum:sidebar.jobBoard")}
      </Link>
      <Link to={routes.governance} className={styles.sbLink}>
        <LuLandmark /> {t("forum:sidebar.governance")}
      </Link>
    </aside>
  );
}
