import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./ThreadPage.module.css";

/** The breadcrumb bar above a thread: a "back to forum" link plus the thread's
 * category name. `categoryName` is already translated by the caller. */
export function ThreadTopbar({ categoryName }: { categoryName?: string }) {
  const { t } = useTranslation();
  return (
    <section className={styles.topbar}>
      <div className="wrap">
        <div className={styles.topbarInner}>
          <Link to={routes.forum} className={styles.back}>
            <svg
              width={14}
              height={14}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="10,4 6,8 10,12" />
            </svg>
            {t("forum:threadPage.breadcrumbForum")}
          </Link>
          <span className={styles.sep} />
          <span className={styles.topCat}>{categoryName}</span>
        </div>
      </div>
    </section>
  );
}
