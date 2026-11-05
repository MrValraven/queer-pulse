import { Link } from "react-router-dom";
import { FiAlertTriangle, FiHome, FiBriefcase } from "react-icons/fi";
import { LuLandmark } from "react-icons/lu";
import { routes } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type ForumThreadCounts } from "./api/forum.api";
import { CATS } from "./forum.data";
import styles from "./ForumPage.module.css";

export function ForumSidebar({
  cat,
  setCat,
  counts,
}: {
  cat: string;
  setCat: (id: string) => void;
  /** Threads each category would list under the current search and tag.
   *  Undefined while loading or after a failure, which draws no number and
   *  disables nothing. */
  counts: ForumThreadCounts | undefined;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbLabel}>{t("forum:sidebar.categoriesLabel")}</div>
      {CATS.map((c) => {
        const label = t(c.nameKey);
        const isActive = cat === c.id;
        // The server leaves out a category nobody posted in, so once the
        // counts are in a missing key is a real 0.
        const count =
          counts === undefined
            ? undefined
            : c.id === "all"
              ? counts.all
              : (counts[c.id] ?? 0);
        // Nothing to list under this category, so picking it could only
        // empty the page. Never the active one (it must stay undoable) and
        // never "All", which only lifts the category.
        const isUnavailable = count === 0 && !isActive && c.id !== "all";
        return (
          <button
            type="button"
            key={c.id}
            className={[
              styles.catItem,
              isActive && styles.catItemOn,
              isUnavailable && styles.catItemEmpty,
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={isUnavailable}
            aria-label={
              count === undefined
                ? undefined
                : t("forum:filter.withCount", {
                    label,
                    count,
                    formatted: fmt.number(count),
                  })
            }
            onClick={() => setCat(c.id)}
          >
            <span className={styles.catIcon}>
              <c.icon />
            </span>
            <span className={styles.catName}>{label}</span>
            {count !== undefined && (
              <span className={styles.catCount} aria-hidden>
                {fmt.number(count)}
              </span>
            )}
          </button>
        );
      })}
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
