import { FaRainbow } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { LoadMoreFooter } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { EmployerCard } from "./api/companies.adapters";
import styles from "./JobsPage.module.css";

/**
 * The employers link-grid shared by the job board and the employer-reviews page.
 * Each card links through to its `CompanyPage` (`/work/companies/:slug`) where
 * the full profile and reviews live — cards carry no inline reviews, so live
 * mode never fabricates any. "Load more" is driven by the caller's paginated
 * `useCompanies()` result and stays hidden when there is no further page. A
 * failed page keeps every loaded card; the footer says so and retries it.
 */
export function EmployerGrid({
  employers,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
}: {
  employers: EmployerCard[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  /** True when the latest "Load more" failed (ENG-501). */
  isFetchNextPageError: boolean;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.empGrid}>
        {employers.map((employer) => (
          <Link
            key={employer.slug ?? employer.name}
            to={
              employer.slug ? `${routes.company}/${employer.slug}` : routes.jobs
            }
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
              style={{
                background: employer.badgeBg,
                color: employer.badgeText,
              }}
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
        <LoadMoreFooter
          className={styles.jobsLoadMore}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          onLoadMore={fetchNextPage}
          errorMessage={t("common:error.loadMore")}
          label={t("economy:jobs.employers.loadMoreCta")}
          loadingLabel={t("economy:jobs.employers.loadingMore")}
        />
      )}
    </>
  );
}
