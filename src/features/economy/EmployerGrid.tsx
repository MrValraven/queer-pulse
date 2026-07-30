import { FaRainbow } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { EmployerCard } from "./api/companies.adapters";
import styles from "./JobsPage.module.css";

/**
 * The employers link-grid shared by the job board and the employer-reviews page.
 * Each card links through to its `CompanyPage` (`/work/companies/:slug`) where
 * the full profile and reviews live — cards carry no inline reviews, so live
 * mode never fabricates any. "Load more" is driven by the caller's paginated
 * `useCompanies()` result and stays hidden when there is no further page.
 */
export function EmployerGrid({
  employers,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: {
  employers: EmployerCard[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.empGrid}>
        {employers.map((employer) => (
          <Link
            key={employer.slug ?? employer.name}
            to={employer.slug ? `${routes.company}/${employer.slug}` : routes.jobs}
            className={styles.empCard}
          >
            <div
              className={styles.empLogo}
              style={{ background: employer.background, color: employer.text }}
            >
              {employer.logo}
            </div>
            <div className={styles.empName}>{employer.name}</div>
            <div className={styles.empType}>{employer.type}</div>
            <span
              className={styles.empBadge}
              style={{ background: employer.badgeBg, color: employer.badgeText }}
            >
              {employer.qr ? (
                <>
                  <FaRainbow />{" "}
                </>
              ) : (
                ""
              )}
              {employer.badge}
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
    </>
  );
}
