import { useId } from "react";
import { LoadMoreFooter } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleasesResult } from "./api/useStudioReleases";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** Every release after the hero's, cursor-paginated with Show more. A failed
 *  page keeps what is on screen and turns the button into Retry. */
export function StudioNewReleases({
  releasesResult,
}: {
  releasesResult: StudioReleasesResult;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const {
    releases,
    loadState,
    hasMore,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = releasesResult;
  const gridReleases = releases.slice(1);
  if (loadState.isError || loadState.isNotFound) return null;
  if (!loadState.isLoading && gridReleases.length === 0 && !hasMore)
    return null;

  return (
    <section className={styles.row} aria-labelledby={headingId}>
      <div className={styles.rowH}>
        <h2 id={headingId}>
          <Translation
            i18nKey="studio:home.newReleases.title"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      {loadState.isLoading ? (
        <StudioCardGridSkeleton count={8} className={styles.rowGrid} />
      ) : (
        <div className={styles.rowGrid}>
          {gridReleases.map((release) => (
            <StudioReleaseCard key={release.id} release={release} />
          ))}
        </div>
      )}
      {(hasMore || isFetchNextPageError) && (
        <div className={kit.moreFooter}>
          <LoadMoreFooter
            isFetchingNextPage={isFetchingNextPage}
            isFetchNextPageError={isFetchNextPageError}
            onLoadMore={fetchNextPage}
            label={t("studio:home.newReleases.showMore")}
            loadingLabel={t("studio:home.newReleases.loadingMore")}
            errorMessage={t("studio:home.newReleases.loadMoreError")}
          />
        </div>
      )}
    </section>
  );
}
