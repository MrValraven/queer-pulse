import { FaRainbow } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { Button, SectionHead } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useCompanies } from "./api/useCompanies";

import styles from "./JobsPage.module.css";

/**
 * The "employers we trust" grid at the foot of the job board. Sources its
 * companies from `useCompanies` — demo returns the mock EMPLOYERS registry
 * (slugs pre-resolved) as one full page, live calls GET /companies page by page
 * behind the "Load more" button (which never shows in demo). Renders nothing at
 * all (heading included) while loading, on error, or with no employers.
 */
export function JobsEmployers() {
  const { t } = useTranslation();
  const {
    items: employers,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCompanies();

  if (employers.length === 0) return null;

  return (
    <section className={styles.employers}>
      <div className="wrap">
        <SectionHead
          title={
            <Translation
              i18nKey="economy:jobs.employers.title"
              components={{ em: <em /> }}
            />
          }
          subtitle={t("economy:jobs.employers.subtitle")}
        />
        <div className={styles.empGrid}>
          {employers.map((emp) => (
            <Link
              key={emp.slug ?? emp.name}
              to={emp.slug ? `${routes.company}/${emp.slug}` : routes.jobs}
              className={styles.empCard}
            >
              <div
                className={styles.empLogo}
                style={{ background: emp.background, color: emp.text }}
              >
                {emp.logo}
              </div>
              <div className={styles.empName}>{emp.name}</div>
              <div className={styles.empType}>{emp.type}</div>
              <span
                className={styles.empBadge}
                style={{ background: emp.badgeBg, color: emp.badgeText }}
              >
                {emp.qr ? (
                  <>
                    <FaRainbow />{" "}
                  </>
                ) : (
                  ""
                )}
                {emp.badge}
              </span>
            </Link>
          ))}
        </div>
        {hasNextPage && (
          <div className={styles.loadMore}>
            <Button
              type="button"
              variant="ghost"
              disabled={isFetchingNextPage}
              onClick={fetchNextPage}
            >
              {isFetchingNextPage
                ? t("economy:jobs.employers.loadingMore")
                : t("economy:jobs.employers.loadMoreCta")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
