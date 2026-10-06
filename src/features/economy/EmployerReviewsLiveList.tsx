import { FiArrowRight, FiShield } from "react-icons/fi";
import { EmptyState, LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EmployerReviewSkeleton } from "./EmployerReviewSkeleton";
import { EmployerGrid } from "./EmployerGrid";
import type { CompaniesResult } from "./api/useCompanies";
import styles from "./EmployerReviewsPage.module.css";

/** How many placeholder cards stand in for the grid while it loads. Matches
 *  the demo branch of `EmployerReviewsPage`. */
const SKELETON_COUNT = 6;

/**
 * The live employer grid on `EmployerReviewsPage`, in four states, in order:
 * a failed first page (with Retry), the first page loading, an empty list,
 * then the grid itself.
 *
 * ENG-501b: the live branch used to drop straight to "No employers reviewed
 * yet" while the first page was still in flight, so every visit opened on an
 * empty state that then filled in. It now shows the demo branch's skeleton
 * cards until the read settles. The error panel stays mounted while a Retry
 * runs, so focus stays on its button.
 */
export function EmployerReviewsLiveList({
  liveEmployers,
  onWrite,
}: {
  liveEmployers: CompaniesResult;
  /** Opens the write-a-review modal with no employer preselected. */
  onWrite: () => void;
}) {
  const { t } = useTranslation();

  if (liveEmployers.hasFailedWithoutData) {
    // The employer grid is this section's whole content, so a failed fetch
    // says so and offers a retry (DES-22).
    return (
      <LoadErrorState
        title={t("economy:employerReviews.loadError.title")}
        description={t("economy:employerReviews.loadError.description")}
        onRetry={liveEmployers.refetch}
        isRetrying={liveEmployers.isRetrying}
      />
    );
  }

  // `isPending` holds the skeleton through an offline (paused) first read too,
  // which `isLoading` reports as false.
  if (liveEmployers.isPending) {
    return (
      <div className={styles.companyGrid} aria-busy="true">
        <span role="status" className="visuallyHidden">
          {t("shared:loading.label")}
        </span>
        {Array.from({ length: SKELETON_COUNT }).map((_, skeletonIndex) => (
          <EmployerReviewSkeleton key={skeletonIndex} />
        ))}
      </div>
    );
  }

  if (liveEmployers.items.length === 0) {
    return (
      <EmptyState
        icon={<FiShield />}
        title={t("economy:employerReviews.emptyLive.title")}
        description={t("economy:employerReviews.emptyLive.description")}
        action={{
          label: (
            <>
              {t("economy:employerReviews.recent.writeCta")}{" "}
              <FiArrowRight aria-hidden />
            </>
          ),
          onClick: onWrite,
        }}
      />
    );
  }

  // ENG-501: a failed "Load more" also sets `isError`; the grid keeps its
  // rows and its footer retries the page that failed.
  return (
    <EmployerGrid
      employers={liveEmployers.items}
      hasNextPage={liveEmployers.hasNextPage}
      fetchNextPage={liveEmployers.fetchNextPage}
      isFetchingNextPage={liveEmployers.isFetchingNextPage}
      isFetchNextPageError={liveEmployers.isFetchNextPageError}
    />
  );
}
